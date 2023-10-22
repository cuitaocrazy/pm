// 杂项
import { AuthContext, getGroupUsers, getUsersByGroups } from '../../auth/oauth'

export default {
  Query: {
    subordinates: (_: any, __: any, context: AuthContext) => getGroupUsers(context.user!),
    groupsUsers: (_: any, __: any, context: AuthContext) => getUsersByGroups(context.user!, __.groups),
  },
}
