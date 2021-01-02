import { gql } from 'apollo-server-express'

const dataTypeDef = gql`
type User {
  id: ID!
  name: String!
  access: [String!]!
  group: [String!]!
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
  proj: Project!
  scale: Int!
}

type Cost {
  id: ID!
  assignee: String!
  participants: [User!]!
  projs: [ProjCostAllocationScale!]!
  amount: Float!
  description: String
  createDate: String!
}

type Query {
  me: User!
  subordinates: [User!]!
  myDailies: EmployeeDaily
  projs: [Project!]!
  iLeadProjs: [Project!]!
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
  deleteProject(id: ID!): ID!
  pushCost(cost: CostInput!): ID!
  deleteCost(id: ID!): ID!
}
`

const directivesDef = gql`
directive @hasRole(role: [String]) on FIELD | FIELD_DEFINITION
`

export const typeDef = [directivesDef, dataTypeDef]
