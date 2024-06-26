export type Maybe<T> = T | null;
export type Exact<T extends Record<string, unknown>> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  name: Scalars['String'];
  access: Scalars['String'][];
  groups: Scalars['String'][];
};

export type ProjectOfDailies = {
  __typename?: 'ProjectOfDailies';
  project: Project;
  dailies: ProjectOfDaily[];
};

export type ProjectOfDailiesDailiesArgs = {
  date?: Maybe<Scalars['String']>;
};

export type ProjectOfDaily = {
  __typename?: 'ProjectOfDaily';
  date: Scalars['String'];
  dailyItems: ProjectOfDailyItem[];
};

export type ProjectOfDailyItem = {
  __typename?: 'ProjectOfDailyItem';
  employee: User;
  timeConsuming: Scalars['Int'];
  content?: Maybe<Scalars['String']>;
};

export type EmployeeOfDailies = {
  __typename?: 'EmployeeOfDailies';
  employee: User;
  dailies: EmployeeOfDaily[];
};

export type EmployeeOfDailiesDailiesArgs = {
  date?: Maybe<Scalars['String']>;
};

export type EmployeeOfDaily = {
  __typename?: 'EmployeeOfDaily';
  date: Scalars['String'];
  dailyItems: EmployeeOfDailyItem[];
};

export type EmployeeOfDailyItem = {
  __typename?: 'EmployeeOfDailyItem';
  project?: Project;
  timeConsuming: Scalars['Int'];
  content?: Maybe<Scalars['String']>;
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID'];
  pId?: Scalars['String'];
  leader: Scalars['String'];
  salesLeader: Scalars['String'];
  name: Scalars['String'];
  customer: Scalars['String'];
  contName: Scalars['String'];
  projStatus: Scalars['String'];
  contStatus: Scalars['String'];
  acceStatus: Scalars['String'];
  contAmount: Scalars['Int'];
  recoAmount: Scalars['Int'];
  projBudget: Scalars['Int'];
  budgetFee: Scalars['Int'];
  budgetCost: Scalars['Int'];
  actualFee: Scalars['Int'];
  actualCost: Scalars['Int'];
  taxAmount: Scalars['Int'];
  description?: Scalars['String'];
  createDate: Scalars['String'];
  updateTime: Scalars['String'];
  participants: Scalars['String'][];
  contacts: Contact[];
  actives?: Active[];
  saleActives?: Active[];
  isArchive?: Scalars['Boolean'];
  status?: ProjectStatus;
  startTime?: Scalars['String'];
  endTime?: Scalars['String'];

  estimatedWorkload?: Scalars['Int'];
  serviceCycle?: Scalars['Int'];
  productDate?: Scalars['String'];
  acceptDate?: Scalars['String'];
  freePersonDays?: Scalars['Int'];
  usedPersonDays?: Scalars['Int'];
  requiredInspections?: Scalars['Int'];
  actualInspections?: Scalars['Int'];
};

export type Contact = {
  __typename?: 'Contact';
  name: Scalars['String'];
  duties?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
};

export type Active = {
  __typename?: 'Active';
  date: Scalars['String'];
  content?: Scalars['String'];
  fileList?: File[];
};

export enum ProjectStatus {
  OnProj = 'onProj',
  EndProj = 'endProj'
}

export type Expense = {
  __typename?: 'Expense';
  id: Scalars['ID'];
  assignee: Scalars['String'];
  participant: User;
  createDate: Scalars['String'];
  items: ExpenseItem[];
};

export type ExpenseItem = {
  __typename?: 'ExpenseItem';
  project: Project;
  amount: Scalars['Float'];
  type: Scalars['String'];
  description?: Maybe<Scalars['String']>;
};

export type EmployeeOfExpenses = {
  __typename?: 'EmployeeOfExpenses';
  employee: User;
  items: EmployeeOfExpensesItem[];
};

export type EmployeeOfExpensesItem = {
  __typename?: 'EmployeeOfExpensesItem';
  project: Project;
  amount: Scalars['Float'];
  type: Scalars['String'];
  createDate: Scalars['String'];
  description?: Maybe<Scalars['String']>;
};

export type ProjectOfExpenses = {
  __typename?: 'ProjectOfExpenses';
  project: Project;
  items: ProjectOfExpensesItem[];
};

export type ProjectOfExpensesItem = {
  __typename?: 'ProjectOfExpensesItem';
  employee: User;
  amount: Scalars['Float'];
  type: Scalars['String'];
  createDate: Scalars['String'];
  description?: Maybe<Scalars['String']>;
};

export type ChartKeyValue = {
  __typename?: 'ChartKeyValue';
  key: Scalars['String'];
  value: Scalars['Float'];
};

export type Charts = {
  __typename?: 'Charts';
  costOfMonths: ChartKeyValue[];
  expenseOfMonths: ChartKeyValue[];
  mdOfMonths: ChartKeyValue[];
  costOfProjs: ChartKeyValue[];
  costOfEmps: ChartKeyValue[];
  costOfGroups: ChartKeyValue[];
};

export type Statu = {
  __typename?: 'Statu';
  id: Scalars['ID'];
  pId: Scalars['String'];
  name: Scalars['String'];
  code: Scalars['String'];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  sort: Scalars['Int'];
  createDate: Scalars['String'];
};

export type TreeStatu = {
  __typename?: 'TreeStatu';
  id: Scalars['ID'];
  pId: Scalars['String'];
  name: Scalars['String'];
  code: Scalars['String'];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  sort: Scalars['Int'];
  createDate: Scalars['String'];
  children: TreeStatu[];
};

export type Industry = {
  __typename?: 'Industry';
  id: Scalars['ID'];
  name: Scalars['String'];
  code: Scalars['String'];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  sort: Scalars['Int'];
  createDate: Scalars['String'];
};

export type Region = {
  __typename?: 'Region';
  id: Scalars['ID'];
  name: Scalars['String'];
  code: Scalars['String'];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  sort: Scalars['Int'];
  createDate: Scalars['String'];
};

export type Customer = {
  __typename?: 'Customer';
  id: Scalars['ID'];
  name: Scalars['String'];
  industryCode: Scalars['String'];
  regionCode: Scalars['String'];
  salesman: Scalars['String'];
  contacts: CustomerContact[];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  createDate: Scalars['String'];
};

export type CustomerContact = {
  __typename?: 'CustomerContact';
  name: Scalars['String'];
  phone: Maybe<Scalars['String']>;
  tags: Scalars['String'][];
};

export type File = {
  __typename?: 'File';
  uid: Scalars['String'];
  name: Scalars['String'];
  status: Scalars['String'];
  url: Scalars['String'];
  thumbUrl?: Scalars['String'];
};

export type Agreement = {
  __typename?: 'Agreement';
  id: Scalars['ID'];
  name: Scalars['String'];
  customer: Scalars['String'];
  type: Scalars['String'];
  fileList: File[];
  startTime: Scalars['String'];
  endTime: Scalars['String'];
  remark: Scalars['String'];
  isDel: Scalars['Boolean'];
  createDate: Scalars['String'];
  contactProj: Scalars['String'][];
  time: any[];
};

export type ProjectAgreement = {
  __typename?: 'ProjectAgreement';
  id: Scalars['ID'];
  agreementId: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  me: User;
  subordinates: User[];
  groupUsers: User[];
  myDailies?: Maybe<EmployeeOfDailies>;
  projs: Project[];
  iLeadProjs: Project[];
  filterProjs: Project[];
  filterProjsByApp: Project[];
  expenses: Expense[];
  dailyUsers: User[];
  empDaily: EmployeeOfDailies;
  projDaily: ProjectOfDailies;
  workCalendar: Scalars['String'][];
  settleMonth: Scalars['String'][];
  empCosts: EmployeeOfExpenses;
  projCosts: ProjectOfExpenses;
  charts: Charts;
  status: Statu[];
  treeStatus: TreeStatu[];
  industries: Industry[];
  regions: Region[];
  customers: Customer[];
  agreements: Agreement[];
  projectAgreements: ProjectAgreement[];
  tags: Scalars['String'][];
};

export type QueryProjectArgs = {
  isArchive?: Scalars['Boolean'];
};

export type QueryFilterProjectArgs = {
  isAdmin?: Scalars['Boolean'];
  customerId?: Scalars['String'];
  org?: Scalars['String'];
  projType?: Scalars['String'];
  type?: Scalars['String'];
};

export type QueryEmpDailyArgs = {
  userId: Scalars['String'];
};

export type QueryProjDailyArgs = {
  projId: Scalars['String'];
};

export type QueryEmpCostsArgs = {
  userId: Scalars['String'];
};

export type QueryProjCostsArgs = {
  projId: Scalars['String'];
};

export type QueryChartsArgs = {
  year: Scalars['String'];
};

export type QueryGroupUsersArgs = {
  group: Scalars['String'];
};

export type DailyInput = {
  projId: Scalars['String'];
  timeConsuming: Scalars['Int'];
  content?: Maybe<Scalars['String']>;
};

export type ProjectInput = {
  id: Scalars['ID'];
  pId?: Scalars['String'];
  leader: Scalars['String'];
  salesLeader: Scalars['String'];
  name: Scalars['String'];
  customer: Scalars['String'];
  contName?: Scalars['String'];
  projStatus: Scalars['String'];
  contStatus: Scalars['String'];
  acceStatus: Scalars['String'];
  contAmount: Scalars['Int'];
  recoAmount: Scalars['Int'];
  projBudget: Scalars['Int'];
  budgetFee: Scalars['Int'];
  budgetCost: Scalars['Int'];
  actualFee: Scalars['Int'];
  actualCost: Scalars['Int'];
  taxAmount: Scalars['Int'];
  description?: Scalars['String'];
  participants?: Maybe<Scalars['String'][]>;
  contacts?: Maybe<ContactInput[]>;
  actives?: Maybe<ActiveInput[]>;
  saleActives?: Maybe<ActiveInput[]>;
  status?: ProjectStatus;
  startTime?: Scalars['String'];
  endTime?: Scalars['String'];

  estimatedWorkload?: Scalars['Int'];
  serviceCycle?: Scalars['Int'];
  productDate?: Scalars['String'];
  acceptDate?: Scalars['String'];
  freePersonDays?: Scalars['Int'];
  usedPersonDays?: Scalars['Int'];
  requiredInspections?: Scalars['Int'];
  actualInspections?: Scalars['Int'];
};

export type ContactInput = {
  name: Scalars['String'];
  duties?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
};

export type ActiveInput = {
  date: Scalars['String'];
  content: Scalars['String'];
  fileList?: Maybe<FileInput[]>;
};

export type ProjCostInput = {
  id: Scalars['ID'];
  amount: Scalars['Float'];
  type: Scalars['String'];
  description?: Maybe<Scalars['String']>;
};

export type CostInput = {
  id?: Maybe<Scalars['ID']>;
  participant: Scalars['ID'];
  projs: ProjCostInput[];
};

export type ChangePmInput = {
  leader: Scalars['String'];
  projIds?: Maybe<Maybe<Scalars['String']>[]>;
  isRemovePart?: Maybe<Scalars['Boolean']>;
};

export type StatuInput = {
  id?: Maybe<Scalars['ID']>;
  pId: Scalars['String'];
  name: Scalars['String'];
  code: Scalars['String'];
  enable: Scalars['Boolean'];
  remark?: Scalars['String'];
  sort: Scalars['Int'];
};

export type IndustryInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  code: Scalars['String'];
  enable: Scalars['Boolean'];
  remark?: Scalars['String'];
  sort: Scalars['Int'];
};

export type RegionInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  code: Scalars['String'];
  enable: Scalars['Boolean'];
  remark?: Scalars['String'];
  sort: Scalars['Int'];
};

export type CustomerInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  industryCode: Scalars['String'];
  regionCode: Scalars['String'];
  salesman: Scalars['String'];
  officeAddress: Scalars['String'];
  contacts: CustomerContactInput[];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
};

export type CustomerContactInput = {
  name: Scalars['String'];
  phone: Maybe<Scalars['String']>;
  tags: Scalars['String'][];
  remark: Scalars['String'];
};

export type FileInput = {
  uid: Scalars['String'];
  name: Scalars['String'];
  status: Scalars['String'];
  url: Scalars['String'];
  thumbUrl?: Scalars['String'];
};

export type AgreementInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  customer: Scalars['String'];
  customerName?: Scalars['String'];
  type: Scalars['String'];
  contactProj: Scalars['String'][];
  fileList?: Maybe<FileInput[]>;
  startTime: Scalars['String'];
  endTime: Scalars['String'];
  remark: Scalars['String'];
  time?: Scalars['String'][];
};

export type TagInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  pushDaily: Scalars['ID'];
  pushProject: Scalars['ID'];
  archiveProject: Scalars['ID'];
  deleteProject: Scalars['ID'];
  pushCost: Scalars['ID'];
  deleteCost: Scalars['ID'];
  pushWorkCalendar: Scalars['ID'];
  deleteWorkCalendar: Scalars['ID'];
  pushChangePm: Scalars['ID'];
  pushStatu: Scalars['ID'];
  pushIndustry: Scalars['ID'];
  pushRegion: Scalars['ID'];
  pushCustomer: Scalars['ID'];
  pushAgreement: Scalars['ID'];
  pushTags: Scalars['ID'];
};

export type MutationPushDailyArgs = {
  date: Scalars['String'];
  projDailies: DailyInput[];
};

export type MutationPushProjectArgs = {
  proj: ProjectInput;
};

export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};

export type MutationPushCostArgs = {
  cost: CostInput;
};

export type MutationDeleteCostArgs = {
  id: Scalars['ID'];
};

export type MutationPushWorkCalendarArgs = {
  data: Scalars['String'][];
};

export type MutationDeleteWorkCalendarArgs = {
  data: Scalars['String'][];
};

export type MutationPushChangePmArgs = {
  changePm: ChangePmInput;
};

export type MutationPushStatuArgs = {
  statu: StatuInput;
};

export type MutationDeleteStatuArgs = {
  id: Scalars['ID'];
};

export type MutationPushIndustryArgs = {
  industry: IndustryInput;
};

export type MutationDeleteIndustryArgs = {
  id: Scalars['ID'];
};

export type MutationPushRegionArgs = {
  region: RegionInput;
};

export type MutationDeleteRegionArgs = {
  id: Scalars['ID'];
};

export type MutationPushCustomerArgs = {
  customer: CustomerInput;
};

export type MutationDeleteCustomerArgs = {
  id: Scalars['ID'];
};

export type MutationPushAgreementArgs = {
  agreement: AgreementInput;
};

export type MutationDeleteAgreementArgs = {
  id: Scalars['ID'];
};

export type MutationPushTagsArgs = {
  tags: Scalars['String'][];
};
