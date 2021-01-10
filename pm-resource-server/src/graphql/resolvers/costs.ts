import moment from 'moment'
import { ObjectId } from 'mongodb'
import { AuthContext, getGroupUsers } from '../../auth/oauth'
import { Cost, Project } from '../../mongodb'

// TODO: 需按graphql进行重构，project应按id去解析器再次进行查询
export default {
  Query: {
    costs: (_: any, __: any, context: AuthContext) => Cost.find({ assignee: context.user!.id }).toArray().then(async costs => {
      const us = await getGroupUsers(context.user!)
      const projs = (await Project.find().project({ id: '$_id', name: 1, _id: 0 }).toArray()) as any as {id: string, name: string}[]

      return costs.map(cost => (
        {
          id: cost._id,
          assignee: cost.assignee,
          createDate: cost.createDate,
          participant: us.find(u => u.id === cost.participant),
          projs: cost.projs.map(proj => ({ ...proj, proj: projs.find(p => p.id === proj.id) })),
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

// 可用聚合方法，太长，以后备用。。
// await client.db().collection('costs').aggregate([{
//   $lookup: {
//     from: 'projects',
//     localField: 'projs.id',
//     foreignField: '_id',
//     as: 'projInfos',
//   },
// },
// {
//   $project: {
//     _id: 0,
//     id: '$_id',
//     assignee: 1,
//     createDate: 1,
//     participant: 1,
//     projs: {
//       $let: {
//         vars: {
//           zipP: {
//             $zip: {
//               inputs: ['$projs', '$projInfos'],
//             },
//           },
//         },
//         in: {
//           $map: {
//             input: '$$zipP',
//             as: 'obj',
//             in: {
//               $mergeObjects: [
//                 {
//                   $arrayElemAt: ['$$obj', 0],
//                 },
//                 {
//                   proj: {
//                     $let: {
//                       vars: {
//                         proj: {
//                           $arrayElemAt: ['$$obj', 1],
//                         },
//                       },
//                       in: {
//                         $mergeObjects: [
//                           {
//                             id: '$$proj._id',
//                           },
//                           '$$proj',
//                         ],
//                       },
//                     },
//                   },
//                 },
//               ],
//             },
//           },
//         },
//       },
//     },
//   },
// },
// ]).toArray()
