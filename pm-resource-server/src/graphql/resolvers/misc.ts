// 杂项
import { AuthContext, getGroupUsers } from '../../auth/oauth'

export default {
  Query: {
    subordinates: (_: any, __: any, context: AuthContext) => getGroupUsers(context.user!),
  },
}
