import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const cache = new InMemoryCache({
  addTypename: false,
});
const link = createHttpLink({
  uri: 'http://localhost:8000/api/graphql',
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
  name?: Maybe<Scalars['String']>;
  access: Scalars['String'][];
};

export type SimpleProj = {
  __typename?: 'SimpleProj';
  id: Scalars['ID'];
  name: Scalars['String'];
  isAssignMe?: Maybe<Scalars['Boolean']>;
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
  projId: Scalars['String'];
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
  stage: ProjectStage;
  participants: Scalars['String'][];
  contacts: Contact[];
};

export type Contact = {
  __typename?: 'Contact';
  name: Scalars['String'];
  duties?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
};

export enum ProjectStage {
  Requirement = 'requirement',
  Dev = 'dev',
  Test = 'test',
  Acceptance = 'acceptance',
  Complete = 'complete',
}

export type Query = {
  __typename?: 'Query';
  me: User;
  subordinates: User[];
  myDailies?: Maybe<EmployeeDaily>;
  myProjs: SimpleProj[];
  iLeaderProjs: Project[];
  iLeaderProj: Project;
};

export type QueryILeaderProjArgs = {
  projId: Scalars['String'];
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
  stage: ProjectStage;
  participants: Scalars['String'][];
  contacts: ContactInput[];
};

export type ContactInput = {
  name: Scalars['String'];
  duties?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  pushDaily: Scalars['ID'];
  pushProject: Scalars['ID'];
};

export type MutationPushDailyArgs = {
  date: Scalars['String'];
  projDailies: DailyInput[];
};

export type MutationPushProjectArgs = {
  proj: ProjectInput;
};
