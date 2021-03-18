import { any, anyPass, equals, find, head, identity, pipe, prop, startsWith, zip, isNil, isEmpty, includes } from 'ramda'
import { AuthContext, getGroupUsers, UserInfo, UserWithGroup } from '../../auth/oauth'
import { Cost, Project } from '../../mongodb'
import { dbid2id } from '../../util/utils'

async function getUserCosts (userId: string) {
  const d = await Cost.aggregate([
    {
      $match: {
        participant: userId,
      },
    },
    // 转换成平坦对象
    { $unwind: '$projs' },
    {
      $sort: { _id: 1 },
    },
    {
      $group: {
        _id: '$participant',
        costs: {
          $push: {
            projId: '$projs.id',
            amount: '$projs.amount',
            createDate: '$createDate',
            type: '$projs.type',
            description: '$projs.description',
          },
        },
      },
    },
    {
      $project: {
        userId: '$_id',
        items: '$costs',
      },
    },
  ]).toArray()

  if (isEmpty(d)) {
    return getDeafultCosts(userId)
  }
  return head(d)
}

function getDeafultCosts (userId: string) {
  return {
    userId,
    items: [],
  }
}

const hasRole = (role: string) => pipe<UserInfo, string[], boolean>(prop('roles'), includes(role))
const isSupervisor = hasRole('realm:supervisor')
const isGroupLeader = hasRole('realm:group_leader')

export default {
  Query: {
    empCosts: async (_: any, { userId }: any, context: AuthContext) => {
      const user = context.user!
      if (anyPass([isSupervisor, isGroupLeader])(user)) {
        const users = await getGroupUsers(user)
        const u = find(pipe<UserWithGroup, string, boolean>(prop('id'), equals(userId)), users)
        if (u !== undefined) {
          const boolList = zip(user.groups, u.groups).map(kv => startsWith(kv[0], kv[1]))
          if (any(identity, boolList)) {
            return getUserCosts(userId)
          } else {
            return getDeafultCosts(userId)
          }
        } else {
          return getDeafultCosts(userId)
        }
      } else {
        return getDeafultCosts(userId)
      }
    },
  },
  EmployeeOfDailyItem: {
    project: async ({ projId }: any) => {
      const project = await Project.findOne({ _id: projId })
      // TODO 当费用中对应的项目不存在时的临时处理方案
      return isNil(project)
        ? ({
            id: projId,
            name: projId,
          })
        : dbid2id(project)
    },
  },
}
