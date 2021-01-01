import moment from 'moment'
import { ObjectId } from 'mongodb'
import { AuthContext, getGroupUsers } from '../../auth/oauth'
import { Cost, Project } from '../../mongodb'

export default {
  Query: {
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
