import R from 'ramda';
import { Request, Response } from 'express';
import { buildSchema, graphql } from 'graphql'

const schema = buildSchema(`
type User {
  id: ID!
  name: String!
  access: [String!]!
  groups: [String!]!
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
`)

function randomNum(limit: number) {
  return Math.floor(Math.random() * limit)
}
function makeProjectDailies(projId: string) {
  return {
    projId,
    timeConsuming: randomNum(11),
    content: `test worke content`,
  }
}

function makeDailies(date: string) {
  return {
    date,
    projs: projs.map(p => makeProjectDailies(p.id)).filter(d => d.timeConsuming !== 0)
  }
}

function makeEmpDailies(name: string) {
  return {
    id: `${name}`,
    dailies: R.range(1, 10).map(i => makeDailies(`2021010${i}`))
  }
}

function makeProjects() {
  return R.range(1, 11).map(i => {
    return {
      id: `proj_${i}`,
      name: `项目 ${i}`,
      leader: `0001`,
      budget: 50_0000,
      createDate: '20201201',
      type: 'onSale',
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

function makeCosts() {
  return R.range(0, 5).map(i => ({
    id: `cost_${i}`,
    assignee: '0001',
    participant: {
      id: '0002',
      name: 'user2'
    },
    projs: [
      {
        proj: {
          id: 'proj_1',
          name: 'proj 1',
        },
        amount: 100.01,
        type: '差旅',
        description: '费用测试1'
      },
      {
        proj: {
          id: 'proj_2',
          name: 'proj 2',
        },
        amount: 200.2,
        type: '餐费',
        description: '费用测试2'
      }
    ],
    createDate: '20201212'
  }))
}

let projs = makeProjects()
let myDailies = makeEmpDailies('0001')
let costs = makeCosts()
let users = [
  {
    id: '0001',
    name: 'user1',
    access: ['realm:project_manager', 'realm:assistant'],
    groups: ['/a']
  },
  {
    id: '0002',
    name: 'user2',
    access: ['realm:project_manager', 'realm:assistant'],
    groups: ['/a']
  },
  {
    id: '0003',
    name: 'user3',
    access: ['realm:project_manager', 'realm:assistant'],
    groups: ['/a']
  },
  {
    id: '0004',
    name: 'user4',
    access: ['realm:project_manager', 'realm:assistant'],
    groups: ['/a']
  }
]

const root = {
  me: () => users[0],
  myDailies: () => myDailies,
  projs: () => projs,
  pushDaily: (args: { date: string, projDailies: { projId: string, timeConsuming: number, content: string }[] }) => {
    const newDaily = {
      date: args.date,
      projs: args.projDailies
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
  iLeadProjs: () => projs,
  costs: (args: any) => costs,
  dailyUsers: users,
  daily: makeEmpDailies,
  subordinates: () => users,
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
    const index = costs.findIndex((c: any) => c.id === args.cost.id)

    const genCost = (data: any, id: string, createDate: string, assignee: string) => {
      return {
        id: id,
        assignee: assignee,
        participant: { id: data.participant, name: users.find(u => u.id === data.participant)?.name || data.participant },
        projs: data.projs.map((p: any) => ({ proj: { id: p.id, name: projs.find(proj => proj.id === p.id)?.name }, amount: p.amount, description: p.description, type: p.type })),
        createDate: createDate
      }
    }

    let id: string

    if (index === -1) {
      id = `cost_${costs.length}`
      const cost = genCost(args.cost, id, '20121212', '0001')
      costs = R.append(cost)(costs)
    } else {
      id = costs[index].id
      const cost = genCost(args.cost, costs[index].id, costs[index].createDate, costs[index].assignee)
      costs = R.update(index, cost, costs)
    }

    return id
  },
  deleteCost: (args: any) => {
    costs = costs.filter(c => c.id !== args.id)
    return args.id
  }
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
