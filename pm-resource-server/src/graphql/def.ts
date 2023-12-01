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
  timeConsuming: Float!
  content: String
}

type EmployeeDailies {
  id: String!
  dailies: [EmployeeDaily!]!
}

type EmployeeDaily {
  date: String!
  projs: [EmployeeDailyItem!]!
}

type EmployeeDailyItem {
  projId: String!
  timeConsuming: Float!
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
  timeConsuming: Float!
  content: String
}

type Project {
  id: ID!
  pId: String
  leader: String!
  salesLeader: String!
  name: String!
  customer: String
  contName: String
  projStatus: String
  contStatus: String
  acceStatus: String
  contAmount: Float
  recoAmount: Float
  projBudget: Float
  budgetFee: Float
  budgetCost: Float
  actualFee: Float
  actualCost: Float
  taxAmount: Float
  description: String
  createDate: String!
  updateTime: String
  participants: [String!]!
  contacts: [Contact!]!
  actives:[Active!]
  saleActives:[Active!]
  status: ProjectStatus
  isArchive: Boolean!
  archiveTime: String
  archivePerson: String
  startTime: String
  endTime: String
  estimatedWorkload: Int
  serviceCycle: Int
  productDate: String
  acceptDate: String
  freePersonDays: Int
  usedPersonDays: Int
  requiredInspections: Int
  actualInspections: Int
  timeConsuming: Float
  confirmYear: String
}

type Contact {
  name: String!
  duties: String
  phone: String
}

type Active {
  name: String
  date: String!
  content: String!
  fileList: [File!]
  recorder: String
}

enum ProjectStatus {
  endProj
  onProj
}

type Expense {
  id: ID!
  assignee: String!
  participant: User!
  createDate: String!
  items: [ExpenseItem!]!
}

type ExpenseItem {
  project: Project!
  amount: Float!
  type: String!
  description: String
}

type EmployeeOfExpenses {
  employee: User!
  items: [EmployeeOfExpensesItem!]!
}

type EmployeeOfExpensesItem {
  project: Project!
  amount: Float!
  type: String!
  createDate: String!
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

type Statu {
  id: ID!
  pId: String!
  name: String!
  code: String!
  remark: String!
  enable: Boolean!
  isDel: Boolean!
  sort: Int!
  createDate: String!
}

type TreeStatu {
  id: ID!
  pId: String!
  name: String!
  code: String!
  remark: String!
  enable: Boolean!
  isDel: Boolean!
  sort: Int!
  createDate: String!
  children: [TreeStatu!]
}

type Industry {
  id: ID!
  name: String!
  code: String!
  remark: String!
  enable: Boolean!
  isDel: Boolean!
  sort: Int!
  createDate: String!
}

type Region {
  id: ID!
  name: String!
  code: String!
  remark: String!
  enable: Boolean!
  isDel: Boolean!
  sort: Int!
  createDate: String!
}

type Customer {
  id: ID!
  name: String!
  industryCode: String!
  regionCode: String!
  salesman: String!
  contacts: [CustomerContact!]!
  enable: Boolean!
  remark: String!
  isDel: Boolean!
  createDate: String!
}

type CustomerContact {
  name: String!
  phone: String!
  tags: [String!]
  recorder: String
}

type File {
  uid: String!
  name: String!
  status: String!
  url: String!
  thumbUrl: String
}

type Agreement {
  id: ID!
  name: String!
  customer: String!
  type: String!
  fileList: [File!]!
  startTime: String!
  endTime: String!
  remark: String!
  isDel: Boolean!
  createDate: String!
}

type ProjectAgreement {
  id: ID!
  agreementId: String!
}

type Attachment {
  id: ID!
  name: String!
  directory: String!
  path: String!
}

type Tag {
  id: ID!
  name: String!
}

type Market {
  id: ID!
  name: String!
  leader: String!
  projects: [MarketProject!]
  contacts: [MarketContact!]
  createDate: String!
  updateTime: String!
  participants: [String!]
}

type MarketProject {
  name: String!
  introduct: String
  scale: String
  plan: String
  status: MarketProjectStatus
  fileList: [File!]
  visitRecord: [MarketProjectVisit!]
  leader: String
}

type MarketContact {
  name: String!
  phone: String!
  duties: [String!]
  remark: String
}

type MarketProjectVisit {
  date: String!
  content: String
  recorder: String
}

enum MarketProjectStatus {
  track
  stop
  transfer
}

type MarketPlan {
  id: ID
  leader: String!
  week: String!
  weekPlans: [MarketWeekPlan!]
  createDate: String
  updateTime: String
}

type MarketWeekPlan {
  marketId: String!
  marketName: String!
  projectName: String!
  projectScale: String
  projectStatus: String!
  projectPlan: String
  weekWork: String
  nextWeekPlan: String
}

type EventLog {
  id: ID
  changeUser: String!
  type: String!
  target: String!
  oldValue: String
  newValue: String!
  changeDate: String!
  description: String
  information: String
}

type Query {
  me: User!
  subordinates: [User!]!
  groupsUsers(groups: [String!]): [User!]!
  roleUsers(role: String!): [User!]!
  myDailies: EmployeeOfDailies
  projs(isArchive: Boolean): [Project!]!
  superProjs(isArchive: Boolean): [Project!]!
  iLeadProjs(isArchive: Boolean): [Project!]!
  filterProjs(projType: String!): [Project!]!
  filterProjsByApp(customerId: String, org: String, projType: String, type: String, isAdmin: Boolean): [Project!]!
  filterProjsByType(projType: String!): [Project!]!
  expenses: [Expense!]!
  dailyUsers: [User!]!
  empDailys: [EmployeeDailies!]!
  empDaily(userId: String!): EmployeeOfDailies!
  projDaily(projId: String!): ProjectOfDailies!
  allProjDaily(projId: String!): ProjectOfDailies!
  workCalendar: [String!]!
  settleMonth: [String!]!
  empCosts(userId: String!): EmployeeOfExpenses!
  projCosts(projId: String!): ProjectOfExpenses!
  charts(year: String!): Charts!
  status:[Statu!]!
  treeStatus:[TreeStatu!]!
  industries:[Industry!]!
  regions:[Region!]!
  customers:[Customer!]!
  agreements:[Agreement!]!
  projectAgreements:[ProjectAgreement!]!
  attachments:[Attachment!]!
  tags: [String]
  markets: [Market!]!
  marketsBySuper: [Market!]!
  marketPlans: [MarketPlan!]!
  marketPlansBySuper: [MarketPlan!]!
  eventLogs: [EventLog!]!
}

input DailyInput {
  projId: String!
  timeConsuming: Float!
  content: String
}

input ProjectInput {
  id: ID!
  pId: String
  leader: String!
  salesLeader: String!
  name: String!
  customer: String
  contName: String
  projStatus: String
  contStatus: String
  acceStatus: String
  contAmount: Float
  recoAmount: Float
  projBudget: Float
  budgetFee: Float
  budgetCost: Float
  actualFee: Float
  actualCost: Float
  taxAmount: Float
  description: String
  participants: [String!]
  contacts: [ContactInput!]
  actives: [ActiveInput!]
  saleActives: [ActiveInput!]
  status: ProjectStatus
  startTime: String
  endTime: String
  estimatedWorkload: Int
  serviceCycle: Int
  productDate: String
  acceptDate: String
  freePersonDays: Int
  usedPersonDays: Int
  requiredInspections: Int
  actualInspections: Int
  confirmYear: String
}

input ContactInput {
  name: String!
  duties: String
  phone: String
}
input ActiveInput {
  name: String
  date: String!
  content: String
  fileList: [FileInput!]
  recorder: String
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

input StatuInput {
  id: ID
  pId: String!
  name: String!
  code: String!
  enable: Boolean!
  sort: Int!
  remark: String!
}

input IndustryInput {
  id: ID
  name: String!
  code: String!
  enable: Boolean!
  sort: Int!
  remark: String!
}

input RegionInput {
  id: ID
  name: String!
  code: String!
  enable: Boolean!
  sort: Int!
  remark: String!
}

input CustomerInput {
  id: ID
  name: String!
  industryCode: String!
  regionCode: String!
  salesman: String!
  contacts: [CustomerContactInput!]
  enable: Boolean!
  remark: String!
}
input CustomerContactInput {
  name: String!
  phone: String!
  tags: [String!]
  recorder: String
}

input FileInput {
  uid: String!
  name: String!
  status: String!
  url: String!
  thumbUrl: String
}

input AgreementInput {
  id: ID
  name: String!
  customer: String!
  type: String!
  fileList: [FileInput!]!
  startTime: String!
  endTime: String!
  remark: String!
  contactProj: [String!]!
}

input AttachmentInput {
  id: ID!
  name: String!
  directory: String!
  path: String!
}

input MarketInput {
  id: ID
  name: String!
  leader: String!
  projects: [MarketProjectInput!]
  contacts: [MarketContactInput!]
  createDate: String
  updateTime: String
  participants: [String!]
}

input MarketProjectInput {
  name: String!
  introduct: String
  scale: String
  plan: String
  status: MarketProjectStatus
  fileList: [FileInput!]
  visitRecord: [MarketProjectVisitInput!]
  leader: String
}

input MarketContactInput {
  name: String!
  phone: String!
  duties: [String!]
  remark: String
}

input MarketProjectVisitInput {
  date: String!
  content: String
  recorder: String
}

input MarketPlanInput {
  id: ID
  leader: String
  week: String!
  weekPlans: [MarketWeekPlanInput!]
  createDate: String
  updateTime: String
}

input MarketWeekPlanInput {
  marketId: String!
  marketName: String!
  projectName: String!
  projectScale: String
  projectStatus: String!
  projectPlan: String
  weekWork: String
  nextWeekPlan: String
}

input EventLogInput {
  id: ID
  changeUser: String!
  type: String!
  target: String!
  oldValue: String
  newValue: String!
  changeDate: String!
  description: String
  information: String
}

type Mutation {
  pushDaily(date: String!, projDailies: [DailyInput!]!): ID!
  pushProject(proj: ProjectInput!): ID!
  archiveProject(id: ID!): ID!
  deleteProject(id: ID!): ID!
  restartProject(id: ID!): ID!
  pushCost(cost: CostInput!): ID!
  deleteCost(id: ID!): ID!
  pushWorkCalendar(data: [String!]!): ID!
  deleteWorkCalendar(data: [String!]!): ID!
  pushChangePm(changePm:ChangePmInput!): ID!
  pushStatu(statu: StatuInput!): ID!
  deleteStatu(id: ID!): ID!
  pushIndustry(industry: IndustryInput!): ID!
  deleteIndustry(id: ID!): ID!
  pushRegion(region: RegionInput!): ID!
  deleteRegion(id: ID!): ID!
  pushCustomer(customer: CustomerInput!): ID!
  deleteCustomer(id: ID!): ID!
  pushAgreement(agreement: AgreementInput!): ID!
  deleteAgreement(id: ID!): ID!
  pushAttachment(attachment: AttachmentInput!): ID!
  deleteAttachment(id: ID!): ID!
  pushTags(tags: [String!]!): String
  pushMarket(market: MarketInput!): ID!
  deleteMarket(id: ID!): ID!
  pushMarketPlan(marketPlan: MarketPlanInput!): ID!
  deleteMarketPlan(id: ID!): ID!
  pushEventLog(eventLog: EventLogInput!): ID!
  deleteEventLog(id: ID!): ID!
}
`
const directivesDef = gql`
directive @hasRole(role: [String]) on FIELD | FIELD_DEFINITION
`
export const typeDef = [directivesDef, dataTypeDef]
