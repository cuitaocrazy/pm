import { AuthContext } from '../../auth/oauth'

export default {
  Query: {
    me: (_: any, __: any, context: AuthContext) => {console.log(context);return {id: context.user!.id, name: context.user!.name, access: context.user!.roles, groups: context.user?.groups, token: context.user?.token } },
  },
}
