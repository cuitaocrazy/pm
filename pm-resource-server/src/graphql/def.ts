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
  user: User!
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
  project: Project!
  timeConsuming: Int!
  content: String
}

type Project {
  id: ID!
  name: String!
  leader: String!
  budget: Int!
  createDate: String!
  status: ProjectStatus!
  participants: [String!]!
  contacts: [Contact!]!
}

type Contact {
  name: String!
  duties: String
  phone: String
}

enum ProjectStatus {
  endProj
  onProj
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

type ProjectCost {
  project: Project!
  amount: Float!
  type: String!
  createDate: String!
  description: String
}

type EmployeeCosts {
  user: User!
  costs: [ProjectCost!]!
}

type EmployeeCost {
  user: User!
  amount: Float!
  type: String!
  createDate: String!
  description: String
}

type ProjectCosts {
  project: Project!
  costs: [EmployeeCost!]!
}

type ChartKeyValue {
  key: String!
  value: Float!
}

type Charts {
  monthAmounts: [ChartKeyValue!]!
  monthCosts: [ChartKeyValue!]!
  monthMds: [ChartKeyValue!]!
  projCosts: [ChartKeyValue!]!
  empCosts: [ChartKeyValue!]!
  groupCosts: [ChartKeyValue!]!
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
  workCalendar: [String!]!
  settleMonth: [String!]!
  empCosts(userId: String!): EmployeeCosts!
  projCosts(projId: String!): ProjectCosts!
  charts(year: String!): Charts!
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
  status: ProjectStatus!
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

input ChangePmInput {
  leader: String!
  projIds: [String]
  isRemovePart:Boolean
}

type Mutation {
  pushDaily(date: String!, projDailies: [DailyInput!]!): ID!
  pushProject(proj: ProjectInput!): ID!
  deleteProject(id: ID!): ID!
  pushCost(cost: CostInput!): ID!
  deleteCost(id: ID!): ID!
  pushWorkCalendar(data: [String!]!): ID!
  deleteWorkCalendar(data: [String!]!): ID!
  pushChangePm(changePm:ChangePmInput!): ID!
}
`

const directivesDef = gql`
directive @hasRole(role: [String]) on FIELD | FIELD_DEFINITION
`

export const typeDef = [directivesDef, dataTypeDef]
