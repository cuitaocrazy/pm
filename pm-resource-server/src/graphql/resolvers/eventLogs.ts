import moment from 'moment'
import { isNil, includes, length } from 'ramda';
import { AuthContext, protect } from '../../auth/oauth';
import { EventLog } from '../../mongodb'
import { ObjectId } from 'mongodb'
import { dbid2id, id2dbid } from '../../util/utils'
export default {
  Query: {
    eventLogs: (_: any, __: any, context: AuthContext) => { 
      return EventLog
      .find()
      .sort({ changeDate: -1 })
      .map(dbid2id).toArray()
    },
  },
  Mutation: {
    pushEventLog: async (_: any, args: any, context: AuthContext) => {
      const { id, ...eventLog } = args.EventLog
      // 判断是否有此项目，如果没有则为第一次创建
      let repeat = await EventLog.findOne({ $or: [ { _id: new ObjectId(id) }, { _id: id }] })
      if (isNil(repeat)) {
        eventLog.changeDate = moment().utc().utcOffset(8 * 60).format('YYYY-MM-DD HH:mm:ss')
      }
      return EventLog.updateOne({ $or: [ {_id: new ObjectId(id) }, { _id: id }] }, { $set: eventLog }, { upsert: true }).then((res) => id || res.upsertedId._id)
    },
    deleteEventLog: async (_: any, args: any, context: AuthContext) => {
      const id = args.id
      return EventLog.updateOne({ $or: [{_id: new ObjectId(id) }, { _id: id }] }, { $set: { isDel: true } }, { upsert: true }).then((res) => args.id || res.upsertedId._id)
    },
  },
}
