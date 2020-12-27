import * as def from './def'
import * as directive from './directiveResolvers'
import resolvers from './resolvers'

export default {
  typeDef: def.typeDef,
  context: directive.context,
  directiveSchema: directive.directiveSchema,
  resolvers,
}
