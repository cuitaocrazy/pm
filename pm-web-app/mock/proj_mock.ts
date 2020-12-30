import R from 'ramda';
import { Request, Response } from 'express';
import { buildSchema, graphql } from 'graphql'

const schema = buildSchema(`
type User {
  id: ID!
  name: String!
  access: [String!]!
}

type SimpleUser {
  id: ID!
  name: String!
}

type SimpleProj {
  id: ID!
  name: String!
  isAssignMe: Boolean
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
  proj: SimpleProj!
  scale: Int!
}

type Cost {
  id: ID!
  assignee: String!
  participants: [SimpleUser!]!
  projs: [ProjCostAllocationScale!]!
  amount: Float!
  description: String
  createDate: String!
}

type Query {
  me: User!
  subordinates: [User!]!
  myDailies: EmployeeDaily
  myProjs: [SimpleProj!]!
  iLeaderProjs: [Project!]!
  iLeaderProj(projId: String!): Project!
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
    projs: simpleProjs.map(p => makeProjectDailies(p.id)).filter(d => d.timeConsuming !== 0)
  }
}

function makeEmpDailies(name: string) {
  return {
    id: name,
    dailies: R.range(1, 10).map(i => makeDailies(`2020120${i}`))
  }
}

function makeSimpleProjs() {
  return projs || makeProjects().map((p, i) => ({
    id: p.id,
    name: p.name,
    isAssignMe: i < 6,
  }))
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
    participants: [
      {
        id: '0002',
        name: 'user2'
      },
      {
        id: '0003',
        name: 'user3'
      }
    ],
    projs: [
      {
        proj: {
          id: 'proj_1',
          name: 'proj 1',
        },
        scale: 1
      },
      {
        proj: {
          id: 'proj_2',
          name: 'proj 2',
        },
        scale: 1
      }
    ],
    createDate: '20201212',
    amount: 1000,
    description: '费用测试'
  }))
}

let projs = makeProjects()
let simpleProjs = makeSimpleProjs()
let myDailies = makeEmpDailies('0001')
let costs = makeCosts()

const root = {
  me: () => ({ id: '0001', name: 'user1', access: ['realm:project_manager', 'realm:assistant'] }),
  myDailies: () => myDailies,
  myProjs: () => simpleProjs,
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
  iLeaderProjs: () => projs,
  costs: (args: any) => costs,
  subordinates: () => [{ id: '0001', name: 'user1' }, { id: '0002', name: 'user2' }, { id: '0003', name: 'user3' }, { id: '0004', name: 'user4' }],
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
  pushCost: (args: any) => {
    const index = costs.findIndex((c: any) => c.id === args.cost.id)

    const genCost = (data: any, id: string, createDate: string, assignee: string) => {
      return {
        id: id,
        assignee: assignee,
        participants: data.participants.map((p: any) => ({ id: p, name: p })),
        projs: data.projs.map((p: any) => ({ proj: { id: p.id, name: p.id }, scale: p.scale })),
        createDate: createDate,
        description: data.description,
        amount: data.amount
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
