import moment from 'moment'
import { isNil } from 'ramda'
import { AuthContext } from '../../auth/oauth'
import { ObjectId } from 'mongodb'
import { Industry } from '../../mongodb'
import { dbid2id } from '../../util/utils'

export default {
  Query: {
    industries: (_: any, __: any, context: AuthContext) => Industry
      .find({ isDel: false })
      .sort({ sort: 1 })
      .map(dbid2id)
      .toArray(),
  },
  Mutation: {
    pushIndustry: async (_: any, args: any, context: AuthContext) => {
      const { id, ...industry } = args.industry
      if (!id) {
        let repeat = await Industry.findOne({ code: industry.code })
        if (!isNil(repeat)) {
          return new Error(`行业编码重复！`)
        }
        industry.createDate = moment().utc().utcOffset(8 * 60).format('YYYYMMDD')
        industry.isDel = false
      }
      return Industry.updateOne({ $or: [{_id: new ObjectId(id) }, { _id: id }] }, { $set: industry }, { upsert: true }).then((res) => id || res.upsertedId._id)
    },
    deleteIndustry: (_: any, args: any, context: AuthContext) => {
      // console.log(args)
      return Industry.updateOne({ _id: new ObjectId(args.id) }, { $set: { isDel: true } }, { upsert: true }).then((res) => args.id || res.upsertedId._id)
      // return Statu.deleteOne({ _id: new ObjectId(args.id) }).then(() => args.id)
    },
  },
}
