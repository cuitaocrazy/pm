// 杂项
import { AuthContext, getGroupUsers, getUsersByGroups, getUsersByRole } from '../../auth/oauth'

export default {
  Query: {
    subordinates: (_: any, __: any, context: AuthContext) => getGroupUsers(context.user!),
    groupsUsers: (_: any, __: any, context: AuthContext) => getUsersByGroups(context.user!, __.groups),
    roleUsers: (_: any, __: any, context: AuthContext) => getUsersByRole(context.user!, __.role),
  },
}
