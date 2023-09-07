import moment from 'moment'
import { isNil } from 'ramda'
import { AuthContext } from '../../auth/oauth'
import { ObjectId } from 'mongodb'
import { Customer } from '../../mongodb'
import { dbid2id } from '../../util/utils'

export default {
  Query: {
    customers: (_: any, __: any, context: AuthContext) => Customer
      .find({ isDel: false })
      .sort({ sort: 1 })
      .map(dbid2id)
      .toArray(),
  },
  Mutation: {
    pushCustomer: (_: any, args: any, context: AuthContext) => {
      const { id, ...customer } = args.customer
      if (!id) {
        customer.createDate = moment().utc().utcOffset(8 * 60).format('YYYYMMDD')
        customer.isDel = false
      }
      return Customer.updateOne({ $or: [{_id: new ObjectId(id) }, { _id: id }] }, { $set: customer }, { upsert: true }).then((res) => id || res.upsertedId._id)
    },
    deleteCustomer: (_: any, args: any, context: AuthContext) => {
      const id = args.id
      return Customer.updateOne({ $or: [{_id: new ObjectId(id) }, { _id: id }] }, { $set: { isDel: true } }, { upsert: true }).then((res) => args.id || res.upsertedId._id)
      // return Statu.deleteOne({ _id: new ObjectId(args.id) }).then(() => args.id)
    },
  },
}
