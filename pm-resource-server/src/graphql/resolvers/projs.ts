import moment from 'moment'
import { AuthContext } from '../../auth/oauth'
import { Project } from '../../mongodb'
import { dbid2id, id2dbid } from '../../util/utils'

export default {
  Query: {
    myProjs: (_: any, __: any, context: AuthContext) => Project
      .find()
      .map(data => ({ id: data._id, name: data.name, isAssignMe: data.participants.includes(context.user!.id) }))
      .sort({ name: -1 })
      .toArray().then(datas => datas.sort(data => data.isAssignMe ? -1 : 1)),
    iLeaderProjs: (_: any, __: any, context: AuthContext) => Project
      .find({ leader: context.user!.id }).map(dbid2id).toArray(),
  },
  Mutation: {
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
  },
}
