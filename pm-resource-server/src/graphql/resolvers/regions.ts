import moment from 'moment'
import { isNil } from 'ramda'
import { AuthContext } from '../../auth/oauth'
import { ObjectId } from 'mongodb'
import { Region } from '../../mongodb'
import { dbid2id } from '../../util/utils'

export default {
  Query: {
    regions: (_: any, __: any, context: AuthContext) => Region
      .find({ isDel: false })
      .sort({ sort: 1 })
      .map(dbid2id)
      .toArray(),
  },
  Mutation: {
    pushRegion: async (_: any, args: any, context: AuthContext) => {
      const { id, ...region } = args.region
      if (!id) {
        let repeat = await Region.findOne({ code: region.code })
        if (!isNil(repeat)) {
          return new Error(`区域编码重复！`)
        }
        region.createDate = moment().utc().utcOffset(8 * 60).format('YYYYMMDD')
        region.isDel = false
      }
      return Region.updateOne({ $or: [{_id: new ObjectId(id) }, { _id: id }] }, { $set: region }, { upsert: true }).then((res) => id || res.upsertedId._id)
    },
    deleteRegion: (_: any, args: any, context: AuthContext) => {
      const id = args.id
      return Region.updateOne({ $or: [{_id: new ObjectId(id) }, { _id: id }] }, { $set: { isDel: true } }, { upsert: true }).then((res) => args.id || res.upsertedId._id)
      // return Statu.deleteOne({ _id: new ObjectId(args.id) }).then(() => args.id)
    },
  },
}
