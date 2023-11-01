import moment from 'moment'
import { isNil } from 'ramda';
import { AuthContext } from '../../auth/oauth'
import { MarketPlan } from '../../mongodb'
import { ObjectId } from 'mongodb'
import { dbid2id, id2dbid } from '../../util/utils'
export default {
  Query: {
    marketPlansBySuper: (_: any, __: any, context: AuthContext) => MarketPlan
      .find()
      .sort({ week: -1 })
      .map(dbid2id).toArray(),
    marketPlans: (_: any, __: any, context: AuthContext) => MarketPlan
      .find({ leader: context.user!.id })
      .sort({ week: -1 })
      .map(dbid2id).toArray(),
  },
  Mutation: {
    pushMarketPlan: async (_: any, args: any, context: AuthContext) => {
      const { id, ...marketPlan } = args.marketPlan
      // 判断是否有此项目，如果没有则为第一次创建
      marketPlan.week = moment(marketPlan.week).format('YYYY-[W]W')
      marketPlan.updateTime = moment().utc().utcOffset(8 * 60).format('YYYY-MM-DD HH:mm:ss')

      const repeatWeek = await MarketPlan.findOne({ leader: marketPlan.leader, week: marketPlan.week })
      if (repeatWeek && (!id || (id !== repeatWeek._id.toString()))) {
        return new Error(`已经存在选中周的计划，请重新选择周！`);
      }

      const repeat = await MarketPlan.findOne({ $or: [ { _id: new ObjectId(id) }, { _id: id }] })
      if (isNil(repeat)) {
        marketPlan.leader = context.user!.id
        marketPlan.createDate = moment().utc().utcOffset(8 * 60).format('YYYYMMDD')
      }
      return MarketPlan.updateOne({ $or: [ { _id: new ObjectId(id) }, { _id: id }] }, { $set: marketPlan }, { upsert: true }).then((res) => id || res.upsertedId._id)
    },
    deleteMarketPlan: async (_: any, args: any, context: AuthContext) => {
      return MarketPlan.deleteOne({ $or: [ {_id: new ObjectId(args.id) }, { _id: args.id }] }).then(() => args.id)
    },
  },
}
