import { any, anyPass, equals, filter, find, head, identity, includes, pipe, prop, startsWith, uniqBy, unnest, without, zip, isNil } from 'ramda'
import { AuthContext, getGroupUsers, UserInfo, UserWithGroup } from '../../auth/oauth'
import { EmployeeDaily, Project } from '../../mongodb'
import { dbid2id } from '../../util/utils'

function getUsersByGroups (groups: string[], users: UserWithGroup[]) {
  const list = unnest(groups.map(g => getUsersByGroup(g, users)))
  return uniqBy(prop('id'), list)
}
function getUsersByGroup (group: string, users: UserWithGroup[]) {
  const filterPredicate = pipe<any, any, any>(
    prop('groups'),
    any(startsWith(group)),
  )
  return filter(filterPredicate, users)
}

async function getUserDailies (userId: string) {
  return dbid2id(await EmployeeDaily.findOne({ _id: userId }))
}

async function getParticipateProjectUsersByLeader (leaderId: string, users: UserWithGroup[]) {
  const projIds = await Project.find({ leader: leaderId }).map(proj => proj._id).toArray()
  const userIds = without([leaderId], await EmployeeDaily.find({
    dailies: {
      $elemMatch: {
        projs: {
          $elemMatch: {
            projId: {
              $in: projIds,
            },
          },
        },
      },
    },
  }).map(daily => daily._id).toArray())

  return users.filter(u => userIds.includes(u.id))
}

async function getParticipateProjectDailiesByLeader (leaderId: string, userId: string) {
  const projIds = await Project.find({ leader: leaderId }).map(proj => proj._id).toArray()

  const d = await EmployeeDaily.aggregate([
    {
      $match: {
        _id: userId,
      },
    },
    {
      $project: {
        dailies: {
          $map: {
            input: '$dailies',
            as: 'daily',
            in: {
              date: '$$daily.date',
              projs: {
                $filter: {
                  input: '$$daily.projs',
                  as: 'p',
                  cond: { $in: ['$$p.projId', projIds] },
                },
              },
            },
          },
        },
      },
    },
    {
      $project: {
        dailies: {
          $filter: {
            input: '$dailies',
            as: 'd',
            cond: { $ne: [{ $size: '$$d.projs' }, 0] },
          },
        },
      },
    },
  ]).toArray()

  return dbid2id(head(d))
}

function getDeafultDailies (userId: string) {
  return {
    id: userId,
    dailies: [],
  }
}

const hasRole = (role: string) => pipe<UserInfo, string[], boolean>(prop('roles'), includes(role))
const isSupervisor = hasRole('realm:supervisor')
const isGroupLeader = hasRole('realm:group_leader')
const isProjectManager = hasRole('realm:project_manager')

export default {
  Query: {
    dailyUsers: async (_: any, __: any, context: AuthContext) => {
      const user = context.user!
      const users = await getGroupUsers(user)
      if (anyPass([isSupervisor, isGroupLeader])(user)) {
        return getUsersByGroups(user.groups, users).filter(u => u.id !== user.id)
      } else if (isProjectManager(user)) {
        return getParticipateProjectUsersByLeader(user.id, users)
      } else {
        return []
      }
    },
    daily: async (_: any, { userId }: any, context: AuthContext) => {
      const user = context.user!
      if (anyPass([isSupervisor, isGroupLeader])(user)) {
        const users = await getGroupUsers(user)
        const u = find(pipe<UserWithGroup, string, boolean>(prop('id'), equals(userId)), users)
        if (u !== undefined) {
          const boolList = zip(user.groups, u.groups).map(kv => startsWith(kv[0], kv[1]))
          if (any(identity, boolList)) {
            return getUserDailies(userId)
          } else {
            return getDeafultDailies(userId)
          }
        } else {
          return getDeafultDailies(userId)
        }
      } else if (isProjectManager(user)) {
        return getParticipateProjectDailiesByLeader(user.id, userId)
      } else {
        return getDeafultDailies(userId)
      }
    },
  },
  ProjDaily: {
    project: async ({ projId }: any) => {
      const project = await Project.findOne({ _id: projId })
      // TODO 当日报中对应的项目不存在时的临时处理方案
      return isNil(project)
        ? ({
            id: projId,
            name: projId,
          })
        : dbid2id(project)
    },
  },
}