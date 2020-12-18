import R from 'ramda';
import { Request, Response } from 'express';
import {graphql, buildSchema } from 'graphql'

const schema = buildSchema(`

type User {
  id: ID!
  name: String
  access: [String!]!
}

type EmployeeDaily {
  id: ID!
  dailies(date: String): [Daily!]!
}

type Daily {
  date: String
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
  myDaily: EmployeeDaily
  iLeaderProjs: [Project!]!
  iLeaderProj(projId: String!): Project!
}
`)

const root = {
  me: () => ({id: '0001', name: 'cuitao', access: ['admin']})
}
const make_data = (creator: (i: number) => {}) => (count: number) =>
  R.range(0, count).map((_, i) => creator(i));

const make_users = make_data((i) => ({
  id: `${i}`,
  name: `用户 ${1}`,
}));

const make_projs = make_data((i) => ({
  id: `${i}`,
  name: `项目 ${i}`,
}));

const lastReportOfDay = {
  projs: [
    {
      projId: '0',
      timeConsuming: 4,
      contentOfWork: '测试一下0',
    },
    {
      projId: '7',
      timeConsuming: 9,
      contentOfWork: '测试一下9',
    },
    {
      projId: 'not exist',
      timeConsuming: 10,
      contentOfWork: '测试一下',
    },
  ],
};

const makeRadomReportOfDay = () => {
  const randomNumber = (s: number) => Math.floor(Math.random() * 10) % s;
  const random0to9 = () => randomNumber(10);

  return R.range(0, 10).map((i) => {
    const projId = i.toString();
    const timeConsuming = random0to9();
    const contentOfWork = timeConsuming ? `test ${projId}` : undefined;
    return {
      projId,
      projName: `项目 ${projId}`,
      timeConsuming,
      contentOfWork,
    };
  });
};

export default {
  'GET /api/simple_users': make_users(10),
  'GET /api/self/projs': make_projs(10),
  'GET /api/self/report/latest': lastReportOfDay,
  'PUT /api/self/report/:date': (req: Request, res: Response) => {
    res.sendStatus(200);
  },
  'GET /api/self/report/days': R.range(1, 10).map((i) => `2020120${i}`),
  'GET /api/self/report/:date': (req: Request, res: Response) => {
    const date = req.params['date'];
    const testDate = R.range(1, 10).map((i) => `2020120${i}`);
    if (testDate.includes(date)) {
      res.send({ date: '20201208', projs: makeRadomReportOfDay() });
    } else {
      res.sendStatus(404);
    }
  },
  'POST /api/graphql': (req: Request, res: Response) => {
    const data = req.body
    if('query' in data) {
      graphql(schema, data.query, root).then(r => res.send(r))
    } else {
      res.send('ok')
    }
  }
};
