import moment from 'moment'
import { isNil } from 'ramda'
import { AuthContext } from '../../auth/oauth'
import { ObjectId } from 'mongodb'
import { Tag } from '../../mongodb'

export default {
  Query: {
    tags: (_: any, __: any, context: AuthContext) => Tag
      .find().map(tag => tag.name).toArray(),
  },
  Mutation: {
    pushTags: async (_: any, args: any, context: AuthContext) => {
      const tags = args.tags
      tags.forEach(async tag => {
        let repeat = await Tag.findOne({ name: tag })
        if (isNil(repeat)) {
          let tagObj = {
            name: tag,
            createDate: moment().utc().utcOffset(8 * 60).format('YYYYMMDD')
          }
          await Tag.updateOne({ _id: new ObjectId() }, { $set: tagObj }, { upsert: true }).then((res) => res.upsertedId._id)
        }
      });
    }
  },
}
