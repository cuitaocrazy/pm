import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { authMiddleware, protect } from './auth/oauth'
import def from './graphql'
import { client as mongoClient } from './mongodb'
import ws from './ws'

const app = express()
const server = new ApolloServer({
  typeDefs: def.typeDef,
  context: def.context,
  schemaDirectives: def.directiveSchema,
  resolvers: def.resolvers,
})

app.use(authMiddleware)
server.applyMiddleware({ app, path: '/api/graphql' })
app.get('/api', protect('realm:project_manager'), (req, res) => {
  res.send((req as any).auth)
})
const s = app.listen(3000, () => console.log('server starting!!!'))

ws(s)

const closeServer = () => {
  s.close()
  mongoClient.close()
}

process.on('SIGTERM', closeServer)
process.on('SIGINT', closeServer)
