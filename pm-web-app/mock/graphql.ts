import R from 'ramda';
import { Request, Response } from 'express';
import { buildSchema, graphql } from 'graphql'
import moment from 'moment';

const schema = buildSchema(`
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

type Query {
  me: User!
  subordinates: [User!]!
  myDailies: EmployeeOfDailies
  projs: [Project!]!
  iLeadProjs: [Project!]!
  expenses: [Expense!]!
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
`)

function randomNum(limit: number) {
  return Math.floor(Math.random() * limit)
}

function makeProjects() {
  return R.range(1, 11).map(i => {
    return {
      id: `BOC-BJ-YF-${i}-2101`,
      name: `项目${i}`,
      leader: `0001`,
      budget: 50_0000,
      createDate: '20210301',
      status: 'onProj',
      participants: ['0001'],
      contacts: [
        {
          name: 'test contact1',
          duties: 'manager',
          phone: '13800000001'
        },
        {
          name: 'test contact2',
          duties: 'manager',
          phone: '13800000002'
        }
      ],
    }
  })
}

function makeExpenses() {
  return R.range(0, 10).map(i => ({
    id: `expense_${i}`,
    assignee: '0001',
    participant: {
      id: '0002',
      name: '组长'
    },
    items: [
      {
        project: {
          id: 'BOC-BJ-YF-1-2101',
          name: 'proj 1',
        },
        amount: 100.01,
        type: '差旅',
        description: '费用测试1'
      },
      {
        project: {
          id: 'BOC-BJ-YF-2-2101',
          name: 'proj 2',
        },
        amount: 200.2,
        type: '餐费',
        description: '费用测试2'
      }
    ],
    createDate: `2021031${i}`
  }))
}

function makeEmployeeOfDailyItem(project: any) {
  return {
    project,
    timeConsuming: randomNum(11),
    content: `test worke content`,
  }
}

function makeEmployeeOfDaily(date: string) {
  return {
    date,
    dailyItems: projs.map(p => makeEmployeeOfDailyItem(p)).filter(d => d.timeConsuming !== 0)
  }
}

function makeEmployeeOfDailies(userId: string) {
  return {
    employee: R.find(R.propEq('id', userId))(users),
    dailies: R.range(4, 10).map(i => makeEmployeeOfDaily(`2021030${i}`))
  }
}

function makeProjectOfDailies(projId: string) {
  return {
    project: R.find(R.propEq('id', projId))(projs),
    dailies: R.range(4, 10).map(i => ({
      date: `2021030${i}`,
      dailyItems: users.map(user => ({
        employee: user,
        timeConsuming: randomNum(11),
        content: `test worke content`,
      }))
    }))
  }
}

function makeEmployeeOfExpenses(userId: string) {
  return ({
    employee: R.find(R.propEq('id', userId))(users),
    items: expenses.reduce((a: any[], b: any) =>
      [...a, ...b.items.map((p: any) => ({ ...p, createDate: b.createDate }))],
      []
    ),
  })
}

function makeProjectOfExpenses(projId: string) {
  return ({
    project: R.find(R.propEq('id', projId))(projs),
    items: expenses.reduce((a: any[], b: any) =>
      [...a, ...b.items.map((p: any) => ({ ...p, employee: b.participant, createDate: b.createDate }))],
      []
    ),
  })
}

function makeCharts(_year: string) {
  return ({
    costOfMonths: [
      {
        key: '202101',
        value: 320254,
      },
    ],
    expenseOfMonths: [
      {
        key: '202101',
        value: 31305,
      },
    ],
    mdOfMonths: [],
    costOfProjs: [
      {
        key: '亚大-北京-测试-项目名称-2101',
        value: 2389.93,
      },
      {
        key: '亚大-北京-测试-项目名称-2102',
        value: 5389.93,
      },
      {
        key: '亚大-北京-测试-项目名称-2103',
        value: 6655.97,
      },
      {
        key: '亚大-北京-测试-项目名称-2104',
        value: 1208.1,
      },
    ],
    costOfEmps: [
      {
        key: '人员一',
        value: 0,
      },
      {
        key: '人员二',
        value: 152389.93,
      },
      {
        key: '人员三',
        value: 136655.97,
      },
      {
        key: '人员四',
        value: 31208.1,
      },
      {
        key: '人员五',
        value: 31208.1,
      },
      {
        key: '人员六',
        value: 31208.1,
      },
      {
        key: '人员七',
        value: 31208.1,
      },
    ],
    costOfGroups: [
      {
        key: '/项目二部',
        value: 0,
      },
      {
        key: '/项目二部/创新组',
        value: 152389.93,
      },
      {
        key: '/项目二部/特色组',
        value: 136655.97,
      },
      {
        key: '/项目二部/苏州组',
        value: 31208.1,
      },
    ],
  })
}

let users = [
  {
    id: '0001',
    name: '主管',
    access: ['realm:engineer', 'realm:assistant', 'realm:project_manager', 'realm:group_leader', 'realm:supervisor'],
    groups: ['/a']
  },
  {
    id: '0002',
    name: '组长',
    access: ['realm:group_leader', 'realm:project_manager', 'realm:engineer'],
    groups: ['/a/b']
  },
  {
    id: '0003',
    name: '经理',
    access: ['realm:project_manager', 'realm:engineer'],
    groups: ['/a/b']
  },
  {
    id: '0004',
    name: '员工',
    access: ['realm:engineer'],
    groups: ['/a/b']
  },
  {
    id: '0005',
    name: '助理',
    access: ['realm:engineer', 'realm:assistant'],
    groups: ['/a']
  }
]

let projs = makeProjects()
let myDailies = makeEmployeeOfDailies('0001')
let expenses = makeExpenses()
let config = {
  workCalendar: ['20210101', '20210131', '20210207', '20210210', '20210211', '20210212', '20210215', '20210216', '20210217', '20210220'],
  settleMonth: ['202012'],
}

const root = {
  // Query
  me: () => users[0],
  subordinates: () => users,
  myDailies: () => myDailies,
  projs: () => projs,
  iLeadProjs: () => projs,
  expenses: (args: any) => expenses,
  dailyUsers: users,
  empDaily: ({ userId }: any) => makeEmployeeOfDailies(userId),
  projDaily: ({ projId }: any) => makeProjectOfDailies(projId),
  workCalendar: () => R.sort((a, b) => R.subtract(moment(a, 'YYYYMMDD').unix(), moment(b, 'YYYYMMDD').unix()), config.workCalendar),
  settleMonth: () => config.settleMonth,
  empCosts: ({ userId }: any) => makeEmployeeOfExpenses(userId),
  projCosts: ({ projId }: any) => makeProjectOfExpenses(projId),
  charts: ({ year }: any) => makeCharts(year),
  // Mutation
  pushDaily: (args: { date: string, projDailies: { projId: string, timeConsuming: number, content: string }[] }) => {
    const newDaily = {
      date: args.date,
      projs: args.projDailies.map(pd => ({ project: projs.find(p => p.id === pd.projId), timeConsuming: pd.timeConsuming, content: pd.content }))
    }

    type TDaily = typeof newDaily
    const lp = R.lensProp('dailies')
    const p = R.prop('date')

    const change = R.pipe<TDaily[], TDaily[], TDaily[], TDaily[]>(
      R.filter<TDaily>(R.compose(R.not, R.equals(args.date), p)),
      args.projDailies.length ? R.append(newDaily) : R.identity,
      R.sortBy(p)
    )
    myDailies = R.over(lp, change)(myDailies)
    return 'user1'
  },
  pushProject: (args: any) => {
    args.proj.participants || (args.proj.participants = ['0001'])
    args.proj.contacts || (args.proj.contacts = [])
    const index = projs.findIndex(p => p.id === args.proj.id)
    if (index === -1) {
      projs = R.append({ ...args.proj, createDate: '20201219', leader: '0001' }, projs)
    } else {
      projs[index] = { ...projs[index], ...args.proj }
    }
    return args.proj.id
  },
  deleteProject: (args: any) => {
    projs = projs.filter(p => p.id !== args.id)
    return args.id
  },
  pushCost: (args: any) => {
    const index = expenses.findIndex((c: any) => c.id === args.cost.id)

    const genCost = (data: any, id: string, createDate: string, assignee: string) => {
      return {
        id: id,
        assignee: assignee,
        participant: { id: data.participant, name: users.find(u => u.id === data.participant)?.name || data.participant },
        items: data.items.map((p: any) => ({ project: { id: p.id, name: projs.find(proj => proj.id === p.id)?.name }, amount: p.amount, description: p.description, type: p.type })),
        createDate: createDate
      }
    }

    let id: string

    if (index === -1) {
      id = `expense_${expenses.length}`
      const cost = genCost(args.cost, id, '20210312', '0001')
      expenses = R.append(cost)(expenses)
    } else {
      id = expenses[index].id
      const expense = genCost(args.cost, expenses[index].id, expenses[index].createDate, expenses[index].assignee)
      expenses = R.update(index, expense, expenses)
    }

    return id
  },
  deleteCost: (args: any) => {
    expenses = expenses.filter((c: any) => c.id !== args.id)
    return args.id
  },
  pushWorkCalendar: (args: any) => {
    config = R.set(
      R.lensProp('workCalendar'),
      R.union(config.workCalendar || [], args.data),
      config
    )
    return 'workCalendar'
  },
  deleteWorkCalendar: (args: any) => {
    config = R.set(
      R.lensProp('workCalendar'),
      R.difference(config.workCalendar || [], args.data),
      config
    )
    return 'workCalendar'
  },
  pushChangePm: (args: any) => {
    projs
      .filter(proj => proj.id === args?.changePm.projIds[0])
      .map(proj => {
        proj.leader = args.changePm.leader
      })
    return args?.changePm.projIds.length
  },
}

export default {
  'POST /api/graphql': (req: Request, res: Response) => {
    const data = req.body
    if ('query' in data) {
      graphql(schema, data.query, root, undefined, data.variables).then(d => res.send(d))
    } else {
      res.send('ok')
    }
  }
};
