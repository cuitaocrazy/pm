import moment from 'moment'
import { isNil } from 'ramda'
import { AuthContext } from '../../auth/oauth'
import { ObjectId } from 'mongodb'
import { Attachment } from '../../mongodb'
import { dbid2id } from '../../util/utils'

export default {
  Query: {
    attachments: (_: any, __: any, context: AuthContext) => Attachment
      .find({ isDel: false })
      .sort({ sort: 1 })
      .map(dbid2id)
      .toArray(),
  },
  Mutation: {
    pushAttachment: async (_: any, args: any, context: AuthContext) => {
      const { id, ...attachment } = args.attachment
      if (!id) {
        attachment.createDate = moment().utc().utcOffset(8 * 60).format('YYYYMMDD')
        attachment.isDel = false
      }
      const _id = new ObjectId(id)
      return Attachment.updateOne({ _id: _id }, { $set: attachment }, { upsert: true }).then((res) => id || res.upsertedId._id)
    },
    deleteAttachment: (_: any, args: any, context: AuthContext) => {
      // console.log(args)
      const _id = new ObjectId(args.id)
      return Attachment.updateOne({ _id: _id }, { $set: { isDel: true } }, { upsert: true }).then((res) => args.id || res.upsertedId._id)
      // return Statu.deleteOne({ _id: new ObjectId(args.id) }).then(() => args.id)
    },
  },
}
