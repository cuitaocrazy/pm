import moment from 'moment'
import { isNil } from 'ramda'
import { AuthContext } from '../../auth/oauth'
import { ObjectId } from 'mongodb'
import { Agreement, ProjectAgreement } from '../../mongodb'
import { dbid2id } from '../../util/utils'

export default {
  Query: {
    agreements: (_: any, __: any, context: AuthContext) => Agreement
      .find({ isDel: false })
      .sort({ sort: 1 })
      .map(dbid2id)
      .toArray(),
  },
  Mutation: {
    pushAgreement: async (_: any, args: any, context: AuthContext) => {
      const { id, ...agreement } = args.agreement
      if (!id) {
        agreement.createDate = moment().utc().utcOffset(8 * 60).format('YYYYMMDD')
        agreement.isDel = false
      }
      const _id = new ObjectId(id)
      // 先清除旧的绑定关系
      await ProjectAgreement.deleteMany({ agreementId: _id.toString() })
      agreement.contactProj.forEach(async proID => {
        // 重新绑定
        await ProjectAgreement.updateOne({ _id: proID }, { $set: { agreementId: _id.toString() } }, { upsert: true }).then((res) => id || res.upsertedId._id)
      });
      delete agreement.contactProj
      return Agreement.updateOne({ $or: [{ _id: _id }, { _id: id }] }, { $set: agreement }, { upsert: true }).then((res) => id || res.upsertedId._id)
    },
    deleteAgreement: (_: any, args: any, context: AuthContext) => {
      const _id = new ObjectId(args.id)
      ProjectAgreement.deleteMany({ agreementId: _id.toString() })
      return Agreement.updateOne({ _id: _id }, { $set: { isDel: true } }, { upsert: true }).then((res) => args.id || res.upsertedId._id)
      // return Statu.deleteOne({ _id: new ObjectId(args.id) }).then(() => args.id)
    },
  },
}
