import R from 'ramda';
import { Request, Response } from 'express';
import { buildSchema, graphql } from 'graphql'

const schema = buildSchema(`
type User {
  id: ID!
  name: String
  access: [String!]!
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
  create
  dev
  test
  acceptance
  complete
}

type Query {
  me: User!
  subordinates: [User!]!
  myDailies: EmployeeDaily
  myProjs: [SimpleProj!]!
  iLeaderProjs: [Project!]!
  iLeaderProj(projId: String!): Project!
}

input DailyInput {
  projId: String!
  timeConsuming: Int!
  content: String
}

type Mutation {
  pushDaily(date: String!, projDailies: [DailyInput!]!): ID!
  addTodo(type: String): String 
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
  return R.range(1, 11).map(i => {
    return {
      id: `proj_${i}`,
      name: `proj_${i}`,
      isAssignMe: i < 6
    }
  })
}

let simpleProjs = makeSimpleProjs()
let myDailies = makeEmpDailies('0001')

const root = {
  me: () => ({id: '0001', name: 'user1', access: ['admin']}),
  myDailies: () => myDailies,
  myProjs: () => simpleProjs,
  pushDaily: (args: {date: string, projDailies: {projId: string, timeConsuming: number, content: string}[]}) => {
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
  addTodo: (args:any) => args.type
}

export default {
  'POST /api/graphql': (req: Request, res: Response) => {
    const data = req.body
    if('query' in data) {
      graphql(schema, data.query, root, undefined, data.variables).then(d => res.send(d))
    } else {
      res.send('ok')
    }
  }
};
