import { gql } from 'apollo-server-express'

const dataTypeDef = gql`
type User {
  id: ID!
  name: String
  access: [String!]!
}

type SimpleProj {
  id: ID!
  name: String!
  isAssignMe: Boolean
}

type EmployeeDaily {
  id: ID!
  dailies(date: String): [Daily!]!
}

type Daily {
  date: String!
  projs: [ProjDaily!]!
}

type ProjDaily {
  projId: String!
  timeConsuming: Int!
  content: String
}

type Project {
  id: ID!
  name: String!
  leader: String!
  budget: Int!
  createDate: String!
  type: ProjectType!
  participants: [String!]!
  contacts: [Contact!]!
}

type Contact {
  name: String!
  duties: String
  phone: String
}

enum ProjectType {
  preSale
  onSale
  afterSale
  research
}

type Query {
  me: User!
  subordinates: [User!]!
  myDailies: EmployeeDaily
  myProjs: [SimpleProj!]!
  iLeaderProjs: [Project!]!
  iLeaderProj(projId: String!): Project!
}

input DailyInput {
  projId: String!
  timeConsuming: Int!
  content: String
}

input ProjectInput {
  id: ID!
  name: String!
  budget: Int!
  type: ProjectType!
  participants: [String!]
  contacts: [ContactInput!]
}

input ContactInput {
  name: String!
  duties: String
  phone: String
}

type Mutation {
  pushDaily(date: String!, projDailies: [DailyInput!]!): ID!
  pushProject(proj: ProjectInput!): ID!
}
`

const directivesDef = gql`
directive @hasRole(role: [String]) on FIELD | FIELD_DEFINITION
`

export const typeDef = [directivesDef, dataTypeDef]
