import { SchemaDirectiveVisitor } from 'apollo-server-express'
import { defaultFieldResolver } from 'graphql'
import { AuthRequest, AuthContext } from '../auth/oauth'

const hasRole = (roles: string[] | undefined) => (next: Function) => (...params: any[]) => {
  const context = params[2] as AuthContext

  if (context.user !== null && context.user?.hasPower(roles)) {
    return next.apply(null, params)
  } else {
    const error: any = new Error(`用户没有授权。 必须具有以下角色之一： [${roles}]`)
    error.code = 'FORBIDDEN'
    throw error
  }
}

export const context = ({ req }: {req: AuthRequest}) => ({ auth: req.auth, user: req.user })

class HasRoleDirective extends SchemaDirectiveVisitor {
  public visitFieldDefinition (field: any) {
    const { resolve = defaultFieldResolver } = field
    const roles = this.parseAndValidateArgs(this.args)
    field.resolve = hasRole(roles)(resolve)
  }

  public parseAndValidateArgs (args: { [name: string]: any }): string[] | undefined {
    const keys = Object.keys(args)

    if (keys.length === 1 && keys[0] === 'role') {
      const role = args[keys[0]]
      if (typeof role === 'string') {
        return [role]
      } else if (Array.isArray(role)) {
        return role.map(val => String(val))
      } else {
        // throw new Error('invalid hasRole args. role must be a String or an Array of Strings')
      }
    }
    // throw Error('invalid hasRole args. must contain only a \'role argument')
  }
}

export const directiveSchema = {
  hasRole: HasRoleDirective,
}
