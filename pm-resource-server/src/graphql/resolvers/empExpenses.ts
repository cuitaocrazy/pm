import { propEq, isNil, any, anyPass, equals, find, identity, pipe, prop, startsWith, zip, isEmpty, includes, unnest } from 'ramda'
import { AuthContext, getGroupUsers, UserInfo, UserWithGroup } from '../../auth/oauth'
import { Cost, Project } from '../../mongodb'
import { dbid2id } from '../../util/utils'

async function getUserCosts (userId: string) {
  const data = await Cost.find({ participant: userId }).toArray()
    .then(async costs => costs.map(cost =>
      ({
        id: cost._id,
        assignee: cost.assignee,
        createDate: cost.createDate,
        userId: cost.participant,
        items: cost.projs.map(proj => ({ ...proj, projId: proj.id })),
      }),
    ))

  if (isEmpty(data)) {
    return getDeafultCosts(userId)
  }
  return ({
    userId,
    items: unnest(data.map(d => d.items.map(item => ({ ...item, createDate: d.createDate })))),
  })
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
  EmployeeOfExpenses: {
    employee: async ({ userId }: any, _: any, context: AuthContext) => {
      const user = context.user!
      const users = await getGroupUsers(user)
      const employee = find(propEq('id', userId), users)
      // TODO 当日报中对应的用户不存在时的临时处理方案
      return isNil(employee)
        ? ({
            id: userId,
            name: userId,
          })
        : employee
    },
  },
  EmployeeOfExpensesItem: {
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
