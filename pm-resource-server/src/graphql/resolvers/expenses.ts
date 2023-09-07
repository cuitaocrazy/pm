import { find, propEq, isNil } from 'ramda'
import moment from 'moment'
import { ObjectId } from 'mongodb'
import { AuthContext, getGroupUsers } from '../../auth/oauth'
import { Cost, Project } from '../../mongodb'
import { dbid2id } from '../../util/utils'

export default {
  Query: {
    expenses: (_: any, __: any, context: AuthContext) =>
      Cost.find({ assignee: context.user!.id }).toArray()
        .then(async costs => costs.map(cost =>
          ({
            id: cost._id,
            assignee: cost.assignee,
            createDate: cost.createDate,
            userId: cost.participant,
            items: cost.projs.map(proj => ({ ...proj, projId: proj.id })),
          }),
        )),
  },
  Expense: {
    participant: async ({ userId }: any, _: any, context: AuthContext) => {
      const user = context.user!
      const users = await getGroupUsers(user)
      const participant = find(propEq('id', userId), users)
      // TODO 当日报中对应的用户不存在时的临时处理方案
      return isNil(participant)
        ? ({
            id: userId,
            name: userId,
          })
        : participant
    },
  },
  ExpenseItem: {
    project: async ({ projId }: any) => {
      const project = await Project.findOne({ _id: projId })
      // TODO 当费用中对应的项目不存在时的临时处理方案
      return isNil(project)
        ? ({
            id: projId,
            name: projId,
          })
        : dbid2id(project)
    },
  },
  Mutation: {
    pushCost: (_: any, args: any, context: AuthContext) => {
      const { id, ...cost } = args.cost
      if (!id) {
        cost.createDate = moment().utc().utcOffset(8 * 60).format('YYYYMMDD')
        cost.assignee = context.user!.id
      }
      return Cost.updateOne({ $or: [{_id: new ObjectId(id) }, { _id: id }] }, { $set: cost }, { upsert: true }).then((res) => id || res.upsertedId._id)
    },
    deleteCost: (_: any, args: any, context: AuthContext) => {
      const id = args.id
      return Cost.deleteOne({ $or: [{_id: new ObjectId(id) }, { _id: id }], assignee: context.user!.id }).then(() => args.id)
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
