import moment from 'moment'
import { isNil, includes, length } from 'ramda';
import { AuthContext, protect } from '../../auth/oauth';
import { Market } from '../../mongodb'
import { ObjectId } from 'mongodb'
import { dbid2id, id2dbid } from '../../util/utils'
export default {
  Query: {
    marketsBySuper: (_: any, __: any, context: AuthContext) => { 
      return Market
      .find()
      .sort({ createDate: -1 })
      .map(dbid2id).toArray()
    },
    markets: (_: any, __: any, context: AuthContext) => { 
      return Market
      .find({ leader: context.user!.id })
      .sort({ createDate: -1 })
      .map(dbid2id).toArray()
    },
  },
  Mutation: {
    pushMarket: async (_: any, args: any, context: AuthContext) => {
      const { id, ...market } = args.market
      // 判断是否有此项目，如果没有则为第一次创建
      let repeat = await Market.findOne({ _id: id })
      if (isNil(repeat)) {
        market.createDate = moment().utc().utcOffset(8 * 60).format('YYYYMMDD')
      } else {
        market.createDate = repeat.createDate
      }
      let isRep = false;
      let proMap = {};
      (market.projects || []).forEach(pro => {
        if (proMap[pro.name]) isRep = true
        else proMap[pro.name] = true
      });
      if (isRep) return new Error(`同一机构下项目名称不可重复！`);
      market.updateTime = moment().utc().utcOffset(8 * 60).format('YYYY-MM-DD HH:mm:ss')
      return Market.updateOne({ $or: [ {_id: new ObjectId(id) }, { _id: id }] }, { $set: market }, { upsert: true }).then((res) => id || res.upsertedId._id)
    },
    deleteMarket: async (_: any, args: any, context: AuthContext) => {
      return Market.deleteOne({ $or: [ {_id: new ObjectId(args.id) }, { _id: args.id }] }).then(() => args.id)
    },
  },
}
