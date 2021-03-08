import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

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
  link,
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
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  name: Scalars['String'];
  access: Scalars['String'][];
  groups: Scalars['String'][];
};

export type ProjectDaily = {
  __typename?: 'ProjectDaily';
  id: Scalars['ID'];
  dailies: UsersDaily[];
};

export type ProjectDailyDailiesArgs = {
  date?: Maybe<Scalars['String']>;
};

export type UsersDaily = {
  __typename?: 'UsersDaily';
  date: Scalars['String'];
  users: UserDaily[];
};

export type UserDaily = {
  __typename?: 'UserDaily';
  user: User;
  timeConsuming: Scalars['Int'];
  content?: Maybe<Scalars['String']>;
};

export type EmployeeDaily = {
  __typename?: 'EmployeeDaily';
  id: Scalars['ID'];
  dailies: Daily[];
};

export type EmployeeDailyDailiesArgs = {
  date?: Maybe<Scalars['String']>;
};

export type Daily = {
  __typename?: 'Daily';
  date: Scalars['String'];
  projs: ProjDaily[];
};

export type ProjDaily = {
  __typename?: 'ProjDaily';
  project: Project;
  timeConsuming: Scalars['Int'];
  content?: Maybe<Scalars['String']>;
};

export type Project = {
  __typename?: 'Project';
  id: Scalars['ID'];
  name: Scalars['String'];
  leader: Scalars['String'];
  budget: Scalars['Int'];
  createDate: Scalars['String'];
  status: ProjectStatus;
  participants: Scalars['String'][];
  contacts: Contact[];
};

export type Contact = {
  __typename?: 'Contact';
  name: Scalars['String'];
  duties?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
};

export enum ProjectStatus {
  EndProj = 'endProj',
  OnProj = 'onProj',
}

export type ProjectCostDetail = {
  __typename?: 'ProjectCostDetail';
  proj: Project;
  amount: Scalars['Float'];
  type: Scalars['String'];
  description?: Maybe<Scalars['String']>;
};

export type Cost = {
  __typename?: 'Cost';
  id: Scalars['ID'];
  assignee: Scalars['String'];
  participant: User;
  projs: ProjectCostDetail[];
  createDate: Scalars['String'];
};

export type ProjectCost = {
  __typename?: 'ProjectCost';
  project: Project;
  amount: Scalars['Float'];
  type: Scalars['String'];
  createDate: Scalars['String'];
  description?: Maybe<Scalars['String']>;
};

export type EmployeeCosts = {
  __typename?: 'EmployeeCosts';
  user: User;
  costs: ProjectCost[];
};

export type EmployeeCost = {
  __typename?: 'EmployeeCost';
  user: User;
  amount: Scalars['Float'];
  type: Scalars['String'];
  createDate: Scalars['String'];
  description?: Maybe<Scalars['String']>;
};

export type ProjectCosts = {
  __typename?: 'ProjectCosts';
  project: Project;
  costs: EmployeeCost[];
};

export type ChartKeyValue = {
  __typename?: 'ChartKeyValue';
  key: Scalars['String'];
  value: Scalars['Float'];
};

export type Charts = {
  __typename?: 'Charts';
  monthAmounts: ChartKeyValue[];
  monthCosts: ChartKeyValue[];
  monthMds: ChartKeyValue[];
  projCosts: ChartKeyValue[];
  empCosts: ChartKeyValue[];
  groupCosts: ChartKeyValue[];
};

export type Query = {
  __typename?: 'Query';
  me: User;
  subordinates: User[];
  myDailies?: Maybe<EmployeeDaily>;
  projs: Project[];
  iLeadProjs: Project[];
  costs: Cost[];
  dailyUsers: User[];
  daily: EmployeeDaily;
  projDaily: ProjectDaily;
  workCalendar: Scalars['String'][];
  settleMonth: Scalars['String'][];
  empCosts: EmployeeCosts;
  projCosts: ProjectCosts;
  charts: Charts;
};

export type QueryDailyArgs = {
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

export type DailyInput = {
  projId: Scalars['String'];
  timeConsuming: Scalars['Int'];
  content?: Maybe<Scalars['String']>;
};

export type ProjectInput = {
  id: Scalars['ID'];
  name: Scalars['String'];
  budget: Scalars['Int'];
  status: ProjectStatus;
  participants?: Maybe<Scalars['String'][]>;
  contacts?: Maybe<ContactInput[]>;
};

export type ContactInput = {
  name: Scalars['String'];
  duties?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
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

export type Mutation = {
  __typename?: 'Mutation';
  pushDaily: Scalars['ID'];
  pushProject: Scalars['ID'];
  deleteProject: Scalars['ID'];
  pushCost: Scalars['ID'];
  deleteCost: Scalars['ID'];
  pushWorkCalendar: Scalars['ID'];
  deleteWorkCalendar: Scalars['ID'];
  pushChangePm: Scalars['ID'];
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
