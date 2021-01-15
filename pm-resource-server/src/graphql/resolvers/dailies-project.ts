import { anyPass, head, includes, pipe, prop, find, propEq } from 'ramda'
import { AuthContext, UserInfo, getGroupUsers } from '../../auth/oauth'
import { EmployeeDaily, Project } from '../../mongodb'
import { dbid2id } from '../../util/utils'

async function getParticipateProjectDailiesByLeader (leaderId: string, projId: string) {
  const projIds = await Project.find({ leader: leaderId }).map(proj => proj._id).toArray()

  if (includes(projId)(projIds)) {
    const d = await EmployeeDaily.aggregate([
      {
        $match: {
          'dailies.projs.projId': projId,
        },
      },
      // 过滤掉跟项目无关掉日报
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
                    cond: { $eq: ['$$p.projId', projId] },
                  },
                },
              },
            },
          },
        },
      },
      // 过滤掉空集合
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
      // 转换成平坦对象
      { $unwind: '$dailies' },
      { $unwind: '$dailies.projs' },
      {
        $sort: { _id: 1 },
      },
      {
        $group: {
          _id: {
            date: '$dailies.date',
            projId: '$dailies.projs.projId',
          },
          users: {
            $push: {
              userId: '$_id',
              timeConsuming: '$dailies.projs.timeConsuming',
              content: '$dailies.projs.content',
            },
          },
        },
      },
      {
        $sort: { '_id.date': 1 },
      },
      {
        $group: {
          _id: '$_id.projId',
          dailies: {
            $push: {
              date: '$_id.date',
              users: '$users',
            },
          },
        },
      },
    ]).toArray()

    return dbid2id(head(d))
  } else {
    return getDeafultDailies(projId)
  }
}

function getDeafultDailies (projId: string) {
  return {
    id: projId,
    dailies: [],
  }
}

const hasRole = (role: string) => pipe<UserInfo, string[], boolean>(prop('roles'), includes(role))
const isSupervisor = hasRole('realm:supervisor')
const isGroupLeader = hasRole('realm:group_leader')
const isProjectManager = hasRole('realm:project_manager')

export default {
  Query: {
    projDaily: async (_: any, { projId }: any, context: AuthContext) => {
      const user = context.user!
      if (anyPass([isSupervisor, isGroupLeader, isProjectManager])(user)) {
        return getParticipateProjectDailiesByLeader(user.id, projId)
      } else {
        return getDeafultDailies(projId)
      }
    },
  },
  UserDaily: {
    user: async ({ userId }: any, _: any, context: AuthContext) => {
      const user = context.user!
      const users = await getGroupUsers(user)
      return find(propEq('id', userId), users)
    },
  },
}
