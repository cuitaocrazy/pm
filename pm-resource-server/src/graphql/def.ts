import { gql } from 'apollo-server-express'

const dataTypeDef = gql`
type User {
  id: ID!
  name: String!
  access: [String!]!
}

type SimpleUser {
  id: ID!
  name: String!
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

type ProjCostAllocationScale {
  proj: SimpleProj!
  scale: Int!
}

type Cost {
  id: ID!
  assignee: String!
  participants: [SimpleUser!]!
  projs: [ProjCostAllocationScale!]!
  amount: Float!
  description: String
  createDate: String!
}

type Query {
  me: User!
  subordinates: [User!]!
  myDailies: EmployeeDaily
  myProjs: [SimpleProj!]!
  iLeaderProjs: [Project!]!
  iLeaderProj(projId: String!): Project!
  costs: [Cost!]!
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

input ProjScaleInput {
  id: ID!
  scale: Int!
}

input CostInput {
  id: ID
  participants: [String!]!
  projs: [ProjScaleInput!]!
  amount: Float!
  description: String
}

type Mutation {
  pushDaily(date: String!, projDailies: [DailyInput!]!): ID!
  pushProject(proj: ProjectInput!): ID!
  pushCost(cost: CostInput!): ID!
  deleteCost(id: ID!): ID!
}
`

const directivesDef = gql`
directive @hasRole(role: [String]) on FIELD | FIELD_DEFINITION
`

export const typeDef = [directivesDef, dataTypeDef]
