import { gql } from 'apollo-server-express'

const dataTypeDef = gql`
type User {
  id: ID!
  name: String!
  access: [String!]!
  groups: [String!]!
}

type ProjectDaily {
  id: ID!
  dailies(date: String): [UsersDaily!]!
}

type UsersDaily {
  date: String!
  users: [UserDaily!]!
}

type UserDaily {
  userId: String!
  timeConsuming: Int!
  content: String
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
  comprehensive
}

type ProjectCostDetail {
  proj: Project!
  amount: Float!
  type: String!
  description: String
}

type Cost {
  id: ID!
  assignee: String!
  participant: User!
  projs: [ProjectCostDetail!]!
  createDate: String!
}

type Query {
  me: User!
  subordinates: [User!]!
  myDailies: EmployeeDaily
  projs: [Project!]!
  iLeadProjs: [Project!]!
  costs: [Cost!]!
  dailyUsers: [User!]!
  daily(userId: String!): EmployeeDaily!
  projDaily(projId: String!): ProjectDaily!
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

input ProjCostInput {
  id: ID!
  amount: Float!
  type: String!
  description: String
}

input CostInput {
  id: ID
  participant: ID!
  projs: [ProjCostInput!]!
}

type Mutation {
  pushDaily(date: String!, projDailies: [DailyInput!]!): ID!
  pushProject(proj: ProjectInput!): ID!
  deleteProject(id: ID!): ID!
  pushCost(cost: CostInput!): ID!
  deleteCost(id: ID!): ID!
}
`

const directivesDef = gql`
directive @hasRole(role: [String]) on FIELD | FIELD_DEFINITION
`

export const typeDef = [directivesDef, dataTypeDef]
