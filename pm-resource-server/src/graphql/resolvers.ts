import moment from 'moment'
import { ObjectId } from 'mongodb'
import { AuthContext, getGroupUsers } from '../auth/oauth'
import { Project, EmployeeDaily, ProjDaily, Cost } from '../mongodb'
import { dbid2id, id2dbid } from '../util/utils'

const resolvers = {
  Query: {
    me: (_: any, __: any, context: AuthContext) => ({ id: context.user!.id, name: context.user!.name, access: context.user!.roles }),
    myProjs: (_: any, __: any, context: AuthContext) => Project
      .find()
      .map(data => ({ id: data._id, name: data.name, isAssignMe: data.participants.includes(context.user!.id) }))
      .sort({ name: -1 })
      .toArray().then(datas => datas.sort(data => data.isAssignMe ? -1 : 1)),
    iLeaderProjs: (_: any, __: any, context: AuthContext) => Project
      .find({ leader: context.user!.id }).map(dbid2id).toArray(),
    myDailies: (_: any, { date }: { date?: string }, context: AuthContext) => EmployeeDaily.findOne({ _id: context.user!.id }).then(ed => {
      if (ed !== null) {
        const { _id, ...other } = ed
        other.dailies = date ? other.dailies.filter(daily => daily.date === date) : other.dailies
        return { id: _id, ...other }
      }
      return {
        id: context.user!.id,
        dailies: [],
      }
    }),
    subordinates: (_: any, __: any, context: AuthContext) => getGroupUsers(context.user!),
    costs: (_: any, __: any, context: AuthContext) => Cost.find({ assignee: context.user!.id }).toArray().then(async costs => {
      const us = await getGroupUsers(context.user!)
      const projs = await Project.find().map(p => ({ id: p._id, name: p.name })).toArray()

      return costs.map(cost => (
        {
          id: cost._id,
          assignee: cost.assignee,
          amount: cost.amount,
          createDate: cost.createDate,
          description: cost.description,
          participants: cost.participants.map(id => ({ id, name: us.find(u => u.id === id)?.name || id })),
          projs: cost.projs.map(proj => ({ proj: { id: proj.id, name: projs.find(p => p.id === proj.id)?.name }, scale: proj.scale })),
        }
      ))
    }),
  },
  Mutation: {
    pushDaily: (_: any, { date, projDailies }: { date: string, projDailies: ProjDaily[] }, context: AuthContext) => EmployeeDaily.findOne({ _id: context.user!.id }).then(d => {
      const curEd = d || { _id: context.user!.id, dailies: [] }
      const index = curEd.dailies.findIndex(d => d.date === date)
      if (index === -1) {
        curEd.dailies = curEd.dailies.concat({ date, projs: projDailies }).sort((a, b) => a.date > b.date ? 1 : -1)
      } else {
        curEd.dailies[index] = { date, projs: projDailies }
      }
      curEd.dailies = curEd.dailies
        .map(pds => ({ date: pds.date, projs: pds.projs.filter(p => p.timeConsuming !== 0) }))
        .filter(pds => pds.projs.reduce((s, e) => s + e.timeConsuming, 0))
      return EmployeeDaily.replaceOne({ _id: context.user!.id }, curEd, { upsert: true }).then(() => context.user!.id)
    }),
    pushProject: (_: any, args: any, context: AuthContext) => {
      const proj = args.proj
      proj.participants = proj.participants || []
      proj.contacts = proj.contacts || []
      proj.leader = context.user!.id
      proj.createDate = moment().utc().utcOffset(8 * 60).format('YYYYMMDD')
      if (!proj.participants.includes(context.user!.id)) {
        proj.participants = proj.participants.concat(context.user!.id)
      }
      return Project.replaceOne({ _id: proj.id }, id2dbid(proj), { upsert: true }).then(() => proj.id)
    },
    deleteProject: (_: any, args: any, context: AuthContext) => {
      return Project.deleteOne({ _id: args.id, leader: context.user!.id }).then(() => args.id)
    },
    pushCost: (_: any, args: any, context: AuthContext) => {
      const { id, ...cost } = args.cost

      if (!id) {
        cost.createDate = moment().utc().utcOffset(8 * 60).format('YYYYMMDD')
        cost.assignee = context.user!.id
      }

      return Cost.updateOne({ _id: new ObjectId(id) }, { $set: cost }, { upsert: true }).then((res) => id || res.upsertedId._id)
    },
    deleteCost: (_: any, args: any, context: AuthContext) => {
      return Cost.deleteOne({ _id: new ObjectId(args.id), assignee: context.user!.id }).then(() => args.id)
    },
  },
}

export default resolvers
