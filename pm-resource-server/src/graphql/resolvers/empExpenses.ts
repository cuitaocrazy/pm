import { any, anyPass, equals, find, identity, pipe, prop, startsWith, zip, isEmpty, includes } from 'ramda'
import { AuthContext, getGroupUsers, UserInfo, UserWithGroup } from '../../auth/oauth'
import { Cost } from '../../mongodb'

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
  return data
}

function getDeafultCosts (userId: string) {
  return {
    id: '',
    assignee: '',
    createDate: '',
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
}
