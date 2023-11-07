import moment from 'moment'
import { isNil, includes, length } from 'ramda';
import { AuthContext, protect } from '../../auth/oauth';
import { Market, EventLog } from '../../mongodb'
import { ObjectId } from 'mongodb'
import { dbid2id, id2dbid, addEventLog } from '../../util/utils'

export default {
  Query: {
    marketsBySuper: (_: any, __: any, context: AuthContext) => {
      return Market
      .find({ isDel: false })
      .sort({ createDate: -1 })
      .map(dbid2id).toArray()
    },
    markets: (_: any, __: any, context: AuthContext) => { 
      return Market
      .find({ leader: context.user!.id, isDel: false })
      .sort({ createDate: -1 })
      .map(dbid2id).toArray()
    },
  },
  Mutation: {
    pushMarket: async (_: any, args: any, context: AuthContext) => {
      const { id, ...market } = args.market
      // 判断是否有此项目，如果没有则为第一次创建
      let repeat = await Market.findOne({ $or: [ { _id: new ObjectId(id) }, { _id: id }] })
      if (isNil(repeat)) {
        market.createDate = moment().utc().utcOffset(8 * 60).format('YYYYMMDD')
        market.isDel = false
        // 记录新增日志
        addEventLog({
          changeUser: context.user!.id,
          type: 'add',
          target: 'market',
          oldValue: '' ,
          newValue: JSON.stringify(args.market),
          description: '新增市场客户'
        })
      } else {
        market.createDate = repeat.createDate
        market.isDel = repeat.isDel
        // 记录修改日志
        addEventLog({
          changeUser: context.user!.id,
          type: 'edit',
          target: 'market',
          oldValue: JSON.stringify(repeat),
          newValue: JSON.stringify(args.market),
          description: '修改市场客户'
        })
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
      const id = args.id
      const market = await Market.findOne({ $or: [ { _id: new ObjectId(id) }, { _id: id }] })
      // 记录删除日志
      addEventLog({
        changeUser: context.user!.id,
        type: 'delete',
        target: 'market',
        oldValue: JSON.stringify(market),
        newValue: '',
        description: '删除市场客户'
      })
      return Market.updateOne({ $or: [{_id: new ObjectId(id) }, { _id: id }] }, { $set: { isDel: true } }, { upsert: true }).then((res) => args.id || res.upsertedId._id)
    },
  },
}
