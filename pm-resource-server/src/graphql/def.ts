import { gql } from 'apollo-server-express'

const dataTypeDef = gql`
type User {
  id: ID!
  name: String!
  access: [String!]!
  groups: [String!]!
}

type ProjectOfDailies {
  project: Project!
  dailies(date: String): [ProjectOfDaily!]!
}

type ProjectOfDaily {
  date: String!
  dailyItems: [ProjectOfDailyItem!]!
}

type ProjectOfDailyItem {
  employee: User!
  timeConsuming: Int!
  content: String
}

type EmployeeOfDailies {
  employee: User!
  dailies(date: String): [EmployeeOfDaily!]!
}

type EmployeeOfDaily {
  date: String!
  dailyItems: [EmployeeOfDailyItem!]!
}

type EmployeeOfDailyItem {
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

type EmployeeOfExpenses {
  id: ID!
  assignee: String!
  participant: User!
  items: [EmployeeOfExpensesItem!]!
  createDate: String!
}

type EmployeeOfExpensesItem {
  project: Project!
  amount: Float!
  type: String!
  description: String
}

type ProjectOfExpenses {
  project: Project!
  items: [ProjectOfExpensesItem!]!
}

type ProjectOfExpensesItem {
  employee: User!
  amount: Float!
  type: String!
  createDate: String!
  description: String
}

type ChartKeyValue {
  key: String!
  value: Float!
}

type Charts {
  costOfMonths: [ChartKeyValue!]!
  expenseOfMonths: [ChartKeyValue!]!
  mdOfMonths: [ChartKeyValue!]!
  costOfProjs: [ChartKeyValue!]!
  costOfEmps: [ChartKeyValue!]!
  costOfGroups: [ChartKeyValue!]!
}

type Query {
  me: User!
  subordinates: [User!]!
  myDailies: EmployeeOfDailies
  projs: [Project!]!
  iLeadProjs: [Project!]!
  expenses: [EmployeeOfExpenses!]!
  dailyUsers: [User!]!
  empDaily(userId: String!): EmployeeOfDailies!
  projDaily(projId: String!): ProjectOfDailies!
  workCalendar: [String!]!
  settleMonth: [String!]!
  empCosts(userId: String!): EmployeeOfExpenses!
  projCosts(projId: String!): ProjectOfExpenses!
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
