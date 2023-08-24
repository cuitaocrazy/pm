// 杂项
import { AuthContext, getGroupUsers, getUsersByGroup } from '../../auth/oauth'

export default {
  Query: {
    subordinates: (_: any, __: any, context: AuthContext) => getGroupUsers(context.user!),
    groupUsers: (_: any, __: any, context: AuthContext) => getUsersByGroup(context.user!, __.group),
  },
}
