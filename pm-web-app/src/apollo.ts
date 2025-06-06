import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { message } from 'antd';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message: eorrMessage, path }) => {
      if (path?.includes('charts')) return;
      message.error(eorrMessage).then((res) => {
        location.reload();
      });
    });
  if (networkError) {
    const errorObj = JSON.parse(JSON.stringify(networkError));
    if (errorObj.statusCode === 401 || errorObj.statusCode === 404) {
      message.error('认证超时，正在为您请刷新页面');
      location.reload();
    } else if (errorObj.statusCode === 500) {
      message.error('服务器发生错误，请检查服务器。');
    }
  }
});

const cache = new InMemoryCache({
  addTypename: false,
});
const link = createHttpLink({
  uri: '/api/graphql',
  credentials: 'same-origin',
});

export const client = new ApolloClient({
  // Provide required constructor fields
  cache,
  link: errorLink.concat(link),
});

// gen code by https://graphql-code-generator.com/
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
  name: string;
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  name: Scalars['String'];
  access: Scalars['String'][];
  groups: Scalars['String'][];
  enabled: Scalars['Boolean'];
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
  timeConsuming: Scalars['Float'];
  content?: Maybe<Scalars['String']>;
};

export type EmployeeDailies = {
  __typename?: 'EmployeeDailies';
  id: Scalars['String'];
  dailies: EmployeeDaily[];
};

export type EmployeeDaily = {
  __typename?: 'EmployeeDaily';
  date: Scalars['String'];
  projs: EmployeeDailyItem[];
};

export type EmployeeDailyItem = {
  __typename?: 'EmployeeDailyItem';
  projId: Scalars['ID'];
  timeConsuming: Scalars['Float'];
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
  project: Project;
  timeConsuming: Scalars['Float'];
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
  contAmount: Scalars['Float'];
  recoAmount: Scalars['Float'];
  projBudget: Scalars['Float'];
  budgetFee: Scalars['Float'];
  budgetCost: Scalars['Float'];
  actualFee: Scalars['Float'];
  humanFee: Scalars['Float'];
  projectFee: Scalars['Float'];
  actualCost: Scalars['Float'];
  taxAmount: Scalars['Float'];
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
  customerObj: CustomerObj;
  agreements: Agreements[];
  estimatedWorkload?: Scalars['Int'];
  serviceCycle?: Scalars['Int'];
  productDate?: Scalars['String'];
  acceptDate?: Scalars['String'];
  freePersonDays?: Scalars['Int'];
  usedPersonDays?: Scalars['Int'];
  requiredInspections?: Scalars['Int'];
  actualInspections?: Scalars['Int'];
  timeConsuming?: Scalars['Float'];
  confirmYear?: Scalars['String'];
  doYear?: Scalars['String'];
  group?: Scalars['String'];
  contractState:Scalars['Int'];
};

export type Contact = {
  __typename?: 'Contact';
  name: Scalars['String'];
  duties?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
};

export type Active = {
  __typename?: 'Active';
  name?: Scalars['String'];
  date: Scalars['String'];
  content?: Scalars['String'];
  fileList?: File[];
  recorder?: Scalars['String'];
};

export type CustomerObj = {
  __typename?: 'CustomerObj';
  id: Scalars['ID'];
  name: Scalars['String'];
  contacts: CustomerContact[];
  industryCode: Scalars['String'];
  regionCode: Scalars['String'];
  salesman: Scalars['String'][];
};

export type Agreements = {
  __typename?: 'Agreements';
  id: Scalars['ID'];
  name: Scalars['String'];
};

export enum ProjectStatus {
  OnProj = 'onProj',
  EndProj = 'endProj',
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
  parentId: Scalars['String'];
};
export type RegionOne = {
  __typename?: 'RegionOne';
  id: Scalars['ID'];
  name: Scalars['String'];
  code: Scalars['String'];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  sort: Scalars['Int'];
  createDate: Scalars['String'];
};
export type YearManage = {
  __typename?: 'YearManage';
  id: Scalars['ID'];
  name: Scalars['String'];
  code: Scalars['String'];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  sort: Scalars['Int'];
  createDate: Scalars['String'];
};
export type QuarterManage = {
  __typename?: 'QuarterManage';
  id: Scalars['ID'];
  name: Scalars['String'];
  code: Scalars['String'];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  sort: Scalars['Int'];
  createDate: Scalars['String'];
};
export type PayStateManage = {
  __typename?: 'PayStateManage';
  id: Scalars['ID'];
  name: Scalars['String'];
  code: Scalars['String'];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  sort: Scalars['Int'];
  createDate: Scalars['String'];
};
export type ProConfirmStateManage = {
  __typename?: 'ProConfirmStateManage';
  id: Scalars['ID'];
  name: Scalars['String'];
  code: Scalars['String'];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  sort: Scalars['Int'];
  createDate: Scalars['String'];
};
export type CollectionQuarterManage = {
  __typename?: 'CollectionQuarterManage';
  id: Scalars['ID'];
  name: Scalars['String'];
  code: Scalars['String'];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  sort: Scalars['Int'];
  createDate: Scalars['String'];
  milestone: Array<Scalars['String']>;
};
export type PayWayInfoManage = {
  __typename?: 'PayWayInfoManage';
  id: Scalars['ID'];
  name: Scalars['String'];
  code: Scalars['String'];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  sort: Scalars['Int'];
  createDate: Scalars['String'];
};
export type AuditStateManage = {
  __typename?: 'AuditStateManage';
  id: Scalars['ID'];
  name: Scalars['String'];
  code: Scalars['String'];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  sort: Scalars['Int'];
  createDate: Scalars['String'];
};
export type Group = {
  __typename?: 'Group';
  id: Scalars['ID'];
  name: Scalars['String'];
  code: Scalars['String'];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  sort: Scalars['Int'];
  createDate: Scalars['String'];
};
export type ProjectClass = {
  __typename?: 'ProjectClass';
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
  salesman: Scalars['String'][];
  contacts: CustomerContact[];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
  isDel: Scalars['Boolean'];
  createDate: Scalars['String'];
  officeAddress: Scalars['String'];
};

export type CustomerContact = {
  __typename?: 'CustomerContact';
  name: Scalars['String'];
  phone: Maybe<Scalars['String']>;
  tags: Scalars['String'][];
  recorder?: Scalars['String'];
  remark?: Scalars['String'];
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
  milestoneValue:String;
  contractAmount:String;
  payWayName:String;
  milestoneName:String;
  actualQuarter:String;
  afterTaxAmount:String;
  maintenanceFreePeriod:String;
  expectedQuarter:String;
  actualDate:string;
  payState:String;

};
export type AgreementsResult = {
  result: Agreement[];
  page: Scalars['Int'];
  total: Scalars['Int'];
};

export type ProjectAgreement = {
  __typename?: 'ProjectAgreement';
  id: Scalars['ID'];
  agreementId: Scalars['String'];
};

export type Market = {
  id: Scalars['ID'];
  name: Scalars['String'];
  leader: Scalars['String'];
  projects: Maybe<MarketProject[]>;
  contacts: Maybe<MarketContact[]>;
  createDate: Scalars['String'];
  updateTime: Scalars['String'];
  participants?: Scalars['String'][];
};

export type MarketProject = {
  name: Scalars['String'];
  introduct: Scalars['String'];
  scale: Scalars['String'];
  plan: Scalars['String'];
  status: MarketProjectStatus;
  fileList: Maybe<FileInput[]>;
  visitRecord: Maybe<MarketProjectVisit[]>;
  leader?: Scalars['String'];
};

export type MarketContact = {
  name: Scalars['String'];
  phone: Scalars['String'];
  duties: Scalars['String'][];
  remark: Scalars['String'];
};

export type MarketProjectVisit = {
  date: Scalars['String'];
  content: Scalars['String'];
  recorder?: Scalars['String'];
};

export enum MarketProjectStatus {
  Track = 'track',
  Stop = 'stop',
  Transfer = 'transfer',
}

export type MarketPlan = {
  id: Scalars['ID'];
  leader: Scalars['String'];
  week: Scalars['String'];
  weekPlans: MarketWeekPlan[];
  createDate: Scalars['String'];
  updateTime: Scalars['String'];
};

export type MarketWeekPlan = {
  marketId: Scalars['String'];
  marketName: Scalars['String'];
  projectName: Scalars['String'];
  projectScale?: Scalars['String'];
  projectStatus: Scalars['String'];
  projectPlan?: Scalars['String'];
  nextWeekPlan: Scalars['String'];
};

export type EventLog = {
  __typename?: 'EventLog';
  id: Scalars['String'];
  changeUser: Maybe<Scalars['String']>;
  type: Maybe<Scalars['String']>;
  target: Maybe<Scalars['String']>;
  oldValue?: Maybe<Scalars['String']>;
  newValue: Maybe<Scalars['String']>;
  changeDate: Maybe<Scalars['String']>;
  description?: Maybe<Scalars['String']>;
  information?: Maybe<Scalars['String']>;
};
//zhouyueyang===
export type Result = {
  result: Project[];
  total: number;
  page: number;
};
export type CustomersResult = {
  result: Customer[];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
};

// 客户信息查询返回的类型
export type CustomersQuery = {
  customers: CustomersResult;
  subordinates:User[];
};

export type QueryCustomersArgs = {
  region: Scalars['String'];
  industry: Scalars['String'];
  page: Scalars['Int'];
  pageSize: Scalars['Int'];
};

//zhouyueyang===
export type Query = {
  __typename?: 'Query';
  me: User;
  subordinates: User[];
  realSubordinates: User[];
  groupsUsers: User[];
  roleUsers: User[];
  myDailies?: Maybe<EmployeeOfDailies>;
  projs: Project[];
  superProjs: Result;
  awaitingReviewProjs: Result;
  iLeadProjs: Result;
  revenueConfirmPros: Result;
  filterProjs: Result;
  filterProjsByType: Project[];
  expenses: Expense[];
  dailyUsers: User[];
  empDaily: EmployeeOfDailies;
  empDailys: EmployeeDailies[];
  projDaily: ProjectOfDailies;
  allProjDaily: ProjectOfDailies;
  workCalendar: Scalars['String'][];
  settleMonth: Scalars['String'][];
  empCosts: EmployeeOfExpenses;
  projCosts: ProjectOfExpenses;
  charts: Charts;
  status: Statu[];
  treeStatus: TreeStatu[];
  industries: Industry[];
  regions: Region[];
  regionones: RegionOne[];
  yearManages: YearManage[];
  quarterManages: QuarterManage[];
  payStateManages: PayStateManage[];
  proConfirmStateManages: ProConfirmStateManage[];
  collectionQuarterManages: CollectionQuarterManage[];
  payWayInfoManages: PayWayInfoManage[];
  auditStateManages: AuditStateManage[];
  projectClasses: ProjectClass[];
  groups: Group[];
  customers: CustomersResult;
  agreements: AgreementsResult;
  projectAgreements: ProjectAgreement[];
  tags: Scalars['String'][];
  markets: Market[];
  marketsBySuper: Market[];
  marketPlans: MarketPlan[];
  marketPlansBySuper: MarketPlan[];
  eventLogs: EventLog[];
  findOneProjectById: Project;
  contractPaymentManages:{result:ContractPaymentManage[]}
};



export type ContractPaymentManage = {
  id: Scalars['String'];
    contractId: Scalars['String'];
    name: Scalars['String'];
    customer: Scalars['String'];
    type: Scalars['String'];
    fileList: File[];
    contractSignDate: Scalars['String'];
    contractPeriod: Scalars['String'];
    contractNumber: Scalars['String'];
    contractAmount: Scalars['String'];
    afterTaxAmount: Scalars['String'];
    maintenanceFreePeriod: Scalars['String'];
    remark: Scalars['String'];
    createDate: Scalars['String'];
    isDel: Scalars['Boolean']
    payWayName: Scalars['String'];
    milestoneName: Scalars['String'];
    milestoneValue: Scalars['String'];
    milestone: Milestone[];
    payState: Scalars['String'];
    expectedQuarter: Scalars['String'];
    actualQuarter: Scalars['String'];
    paymentRemark: Scalars['String'];
    paymentFileList: File[];
}

export type  Milestone ={
  name: Scalars['String'];
  value: Scalars['Float'];
}

export type QueryProjectArgs = {
  isArchive?: Scalars['Boolean'];
  // page: Scalars['Int'];
  pageSize?: Scalars['Int'];
  agreementPageSize?: Scalars['Int'];
  pageAgreements?: Scalars['Int'];
  pageSizeAgreements?: Scalars['Int'];
  customersPageSize?: Scalars['Int'];
  superProjsPageSize?: Scalars['Int'];
};

export type QueryFilterProjectArgs = {
  projType?: Scalars['String'];
  pageSize?: Scalars['Int'];
  customersPageSize?: Scalars['Int'];
  pageSizeAgreements?: Scalars['Int'];
};
export type QueryFilterProjectByIdArgs = {
  id: Scalars['String'];
};

export type QueryEmpDailyArgs = {
  userId: Scalars['String'];
};

export type QueryProjDailyArgs = {
  projId?: Scalars['String'];
  startDate?: Scalars['String'];
  endDate?: Scalars['String'];
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

export type QueryGroupsUsersArgs = {
  groups?: Scalars['String'][];
  customersPageSize?: Scalars['Float'];
  pageSizeAgreements?: Scalars['Float'];
  agreementPageSize?:Scalars['Float'];
};

export type IsExistProjIdArgs = {
  id: Scalars['String'];
};
export type IsExistProjIdQuery = {
  isExistProjID: Scalars['Boolean'];
};

export type QueryRoleUsersArgs = {
  role: Scalars['String'];
};

export type DailyInput = {
  projId: Scalars['String'];
  timeConsuming: Scalars['Float'];
  content?: Maybe<Scalars['String']>;
};

export type PrintProjInput = {
  id: Scalars['ID'];
  printState:Scalars['String'];
}

export type ProjectInput = {
  id: Scalars['ID'];
  pId?: Scalars['String'];
  leader: Scalars['String'];
  salesLeader: Scalars['String'];
  name: Scalars['String'];
  customer: Scalars['String'];
  customerObj: CustomerObj;
  agreements: AgreementsResult;
  contName?: Scalars['String'];
  projStatus: Scalars['String'];
  contStatus: Scalars['String'];
  acceStatus: Scalars['String'];
  contAmount: Scalars['Float'];
  recoAmount: Scalars['Float'];
  projBudget: Scalars['Float'];
  budgetFee: Scalars['Float'];
  budgetCost: Scalars['Float'];
  actualFee: Scalars['Float'];
  humanFee: Scalars['Float'];
  projectFee: Scalars['Float'];
  actualCost: Scalars['Float'];
  taxAmount: Scalars['Float'];
  description?: Scalars['String'];
  participants?: Maybe<Scalars['String'][]>;
  contacts?: Maybe<ContactInput[]>;
  actives?: Maybe<ActiveInput[]>;
  saleActives?: Maybe<ActiveInput[]>;
  status?: ProjectStatus;
  startTime?: Scalars['String'];
  endTime?: Scalars['String'];
  group?: Scalars['String'];
  estimatedWorkload?: Scalars['Int'];
  serviceCycle?: Scalars['Int'];
  productDate?: Scalars['String'];
  acceptDate?: Scalars['String'];
  freePersonDays?: Scalars['Int'];
  usedPersonDays?: Scalars['Int'];
  requiredInspections?: Scalars['Int'];
  actualInspections?: Scalars['Int'];
  confirmYear?: Scalars['String'];
  productName?: Scalars['String'];
  copyrightName?: Scalars['String'];
  projectArrangement?: Scalars['String'];
  proState?: Scalars['Int'];
  incomeConfirm?: Scalars['Int'];
  contractState?: Scalars['Int'];
  address?: Scalars['String'];
  customerContact?: Scalars['String'];
  contactDetailsCus?: Scalars['String'];
  salesManager?: Scalars['String'];
  copyrightNameSale?: Scalars['String'];
  doYear?: Scalars['String'];
  oldId:String;
  contAmount_:String;
  taxAmount_:String;
  serviceCycle_:String;
  confirmQuarter:String;
  contractState1:String;
  proState1:String;
};

export type ContactInput = {
  name: Scalars['String'];
  duties?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
};

export type ActiveInput = {
  name: Scalars['String'];
  date: Scalars['String'];
  content: Scalars['String'];
  fileList?: Maybe<FileInput[]>;
  recorder?: Scalars['String'];
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
export type RegionOneInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  code: Scalars['String'];
  enable: Scalars['Boolean'];
  remark?: Scalars['String'];
  sort: Scalars['Int'];
};
export type YearManageInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  code: Scalars['String'];
  enable: Scalars['Boolean'];
  remark?: Scalars['String'];
  sort: Scalars['Int'];
};
export type QuarterManageInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  code: Scalars['String'];
  enable: Scalars['Boolean'];
  remark?: Scalars['String'];
  sort: Scalars['Int'];
};
export type PayStateManageInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  code: Scalars['String'];
  enable: Scalars['Boolean'];
  remark?: Scalars['String'];
  sort: Scalars['Int'];
};
export type ProConfirmStateManageInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  code: Scalars['String'];
  enable: Scalars['Boolean'];
  remark?: Scalars['String'];
  sort: Scalars['Int'];
};
export type CollectionQuarterManageInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  code: Scalars['String'];
  enable: Scalars['Boolean'];
  remark?: Scalars['String'];
  sort: Scalars['Int'];
  milestone: Array<Scalars['String']>;
};
export type PayWayInfoManageInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  code: Scalars['String'];
  enable: Scalars['Boolean'];
  remark?: Scalars['String'];
  sort: Scalars['Int'];
};
export type AuditStateManageInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  code: Scalars['String'];
  enable: Scalars['Boolean'];
  remark?: Scalars['String'];
  sort: Scalars['Int'];
};
export type GroupInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
  code: Scalars['String'];
  enable: Scalars['Boolean'];
  remark?: Scalars['String'];
  sort: Scalars['Int'];
};
export type ProjectClassInput = {
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
  salesman: Scalars['String'][];
  officeAddress: Scalars['String'];
  contacts: CustomerContactInput[];
  remark: Scalars['String'];
  enable: Scalars['Boolean'];
};

export type CustomerContactInput = {
  name: Scalars['String'];
  phone: Maybe<Scalars['String']>;
  tags: Scalars['String'][];
  recorder?: Scalars['String'];
};

export type FileInput = {
  uid: Scalars['String'];
  name: Scalars['String'];
  status: Scalars['String'];
  url: Scalars['String'];
  thumbUrl?: Scalars['String'];
};

export type AgreementInput = {
  taxRate?: any;
  contractAmount?: any;
  id?: Maybe<Scalars['ID']>;
  name?: Scalars['String'];
  customer?: Scalars['String'];
  customerName?: Scalars['String'];
  type?: Scalars['String'];
  contactProj?: Scalars['String'][];
  fileList?: Maybe<FileInput[]>;
  startTime?: Scalars['String'];
  endTime?: Scalars['String'];
  remark?: Scalars['String'];
  time?: Scalars['String'][];
  payWayName?:any;
  milestone?:any;
  paymentFileList?:Maybe<FileInput[]>;
  actualDate?:string;
  group?:Scalars['String'][] | Scalars['String'];
  contractSignDate:Scalars['String'];
  contractPeriod:Scalars['String'];
  contractNumber:Scalars['String'];
  contractAmount:Scalars['String'];
  taxRate:Scalars['String'];
  afterTaxAmount:Scalars['String'];
  maintenanceFreePeriod:Scalars['String'];
};

export type ContractPaymentInput = {
  id?: Maybe<Scalars['ID']>;
    name?: Scalars['String'];
    contractAmount?: Scalars['String'];
    milestoneName?: Scalars['String'];
    milestoneValue?: Scalars['String'];
    milestoneAmount?: Scalars['Float'];
    payState?: Scalars['String'][];
    expectedQuarter?: Scalars['String'][];
    actualQuarter?: Scalars['String'][];
    actualDate?:Scalars['String'];
    paymentRemark?: Scalars['String'];
    paymentFileList?: Maybe<FileInput[]>;
};

export type TagInput = {
  id?: Maybe<Scalars['ID']>;
  name: Scalars['String'];
};

export type MarketInput = {
  id: Scalars['ID'];
  name: Scalars['String'];
  leader: Scalars['String'];
  projects: Maybe<MarketProjectInput[]>;
  contacts: Maybe<MarketContactInput[]>;
  createDate: Scalars['String'];
  updateTime: Scalars['String'];
  participants?: Scalars['String'][];
};

export type MarketProjectInput = {
  name: Scalars['String'];
  introduct: Scalars['String'];
  scale: Scalars['String'];
  plan: Scalars['String'];
  status: MarketProjectStatus;
  fileList: Maybe<FileInput[]>;
  visitRecord: Maybe<MarketProjectVisitInput[]>;
  leader?: Scalars['String'];
};

export type MarketContactInput = {
  name: Scalars['String'];
  phone: Scalars['String'];
  duties: Scalars['String'][];
  remark: Scalars['String'];
};

export type MarketProjectVisitInput = {
  date: Scalars['String'];
  content: Scalars['String'];
  recorder?: Scalars['String'];
};

export type MarketPlanInput = {
  id: Scalars['ID'];
  week: Scalars['String'];
  weekPlans: MarketWeekPlanInput[];
  createDate: Scalars['String'];
  updateTime: Scalars['String'];
};

export type MarketWeekPlanInput = {
  marketId: Scalars['String'];
  marketName: Scalars['String'];
  projectName: Scalars['String'];
  projectScale?: Scalars['String'];
  projectStatus: Scalars['String'];
  projectPlan?: Scalars['String'];
  nextWeekPlan: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  pushDaily: Scalars['ID'];
  pushProject: Scalars['ID'];
  checkProj: Scalars['ID'];
  archiveProject: Scalars['ID'];
  incomeConfirmProj: Scalars['ID'];
  deleteProject: Scalars['ID'];
  restartProject: Scalars['ID'];
  pushCost: Scalars['ID'];
  deleteCost: Scalars['ID'];
  pushWorkCalendar: Scalars['ID'];
  deleteWorkCalendar: Scalars['ID'];
  pushChangePm: Scalars['ID'];
  pushStatu: Scalars['ID'];
  pushIndustry: Scalars['ID'];
  pushRegion: Scalars['ID'];
  pushRegionOne: Scalars['ID'];
  pushYearManage: Scalars['ID'];
  pushQuarterManage: Scalars['ID'];
  pushPayStateManage: Scalars['ID'];
  pushProConfirmStateManage: Scalars['ID'];
  pushCollectionQuarterManage: Scalars['ID'];
  pushPayWayInfoManage: Scalars['ID'];
  pushAuditStateManage: Scalars['ID'];
  pushGroup: Scalars['ID'];
  pushCustomer: Scalars['ID'];
  pushAgreement: Scalars['ID'];
  pushTags: Scalars['ID'];
  pushMarket: Scalars['ID'];
  deleteMarket: Scalars['ID'];
  pushMarketPlan: Scalars['ID'];
  deleteMarketPlan: Scalars['ID'];
};

export type MutationPushDailyArgs = {
  date: Scalars['String'];
  projDailies: DailyInput[];
};

export type MutationPushProjectArgs = {
  proj: ProjectInput;
};

export type MutationCheckProjArgs = {
  id: Scalars['String'];
  checkState: Scalars['Int'];
  reason: Scalars['String'];
};

export type MutationDeleteProjectArgs = {
  id: Scalars['ID'];
};
export type MutationPrintProjArgs = {
  proj:PrintProjInput;
  
};

export type MutationUpdateIncomeConfirmProjArgs = {
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
export type MutationPushRegionOneArgs = {
  region: RegionOneInput;
};
export type MutationPushYearManageArgs = {
  yearManage: YearManageInput;
};
export type MutationPushQuarterManageArgs = {
  quarterManage: QuarterManageInput;
};
export type MutationPushPayStateManageArgs = {
  payStateManages: PayStateManageInput;
};
export type MutationPushProConfirmStateManageArgs = {
  proConfirmStateManages: ProConfirmStateManageInput;
};
export type MutationPushCollectionQuarterManageArgs = {
  collectionQuarterManages: CollectionQuarterManageInput;
};
export type MutationPushPayWayInfoManageArgs = {
  payWayInfoManages: PayWayInfoManageInput;
};
export type MutationPushAuditStateManageArgs = {
  auditStateManages: AuditStateManageInput;
};
export type MutationPushGroupArgs = {
  group: GroupInput;
};
export type MutationPushProjectClassArgs = {
  projectclass: ProjectClassInput;
};
export type MutationDeleteRegionArgs = {
  id: Scalars['ID'];
};
export type MutationDeleteRegionOneArgs = {
  id: Scalars['ID'];
};
export type MutationDeleteYearManageArgs = {
  id: Scalars['ID'];
};
export type MutationDeleteQuarterManageArgs = {
  id: Scalars['ID'];
};
export type MutationDeletePayStateManageArgs = {
  id: Scalars['ID'];
};
export type MutationDeleteProConfirmStateManageArgs = {
  id: Scalars['ID'];
};
export type MutationDeleteCollectionQuarterManageArgs = {
  id: Scalars['ID'];
};
export type MutationDeletePayWayInfoManageArgs = {
  id: Scalars['ID'];
};
export type MutationDeleteAuditStateManageArgs = {
  id: Scalars['ID'];
};
export type MutationDeleteGroupArgs = {
  id: Scalars['ID'];
};
export type MutationDeleteProjectClassArgs = {
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

export type MutationContractPaymentArgs = {
  agreement: ContractPaymentInput;
};

export type MutationDeleteAgreementArgs = {
  id: Scalars['ID'];
};

export type MutationPushTagsArgs = {
  tags: Scalars['String'][];
};

export type MutationPushMarketArgs = {
  market: MarketInput;
};

export type MutationDeleteMarketArgs = {
  id: Scalars['ID'];
};

export type MutationPushMarketPlanArgs = {
  marketPlan: MarketPlanInput;
};

export type MutationDeleteMarketPlanArgs = {
  id: Scalars['ID'];
};
