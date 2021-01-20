import { isNil, union, difference } from 'ramda'
import { Config } from '../../mongodb'
import { dbid2id, id2dbid } from '../../util/utils'

export default {
  Query: {
    config: async (_: any, { configId }: any) => {
      const config = await Config.findOne({ _id: configId })
      return isNil(config)
        ? ({
            id: configId,
            data: [],
          })
        : dbid2id(config)
    },
  },
  Mutation: {
    pushConfig: async (_: any, { config }: any) => {
      const oldConfig = await Config.findOne({ _id: config.id })
      if (!isNil(oldConfig)) {
        config.data = union(oldConfig.data, config.data)
      }
      return Config.replaceOne({ _id: config.id }, id2dbid(config), { upsert: true }).then(() => config.id)
    },
    deleteConfig: async (_: any, { config }: any) => {
      const oldConfig = await Config.findOne({ _id: config.id })
      if (!isNil(oldConfig)) {
        config.data = difference(oldConfig.data, config.data)
      }
      return Config.replaceOne({ _id: config.id }, id2dbid(config), { upsert: true }).then(() => config.id)
    },
  },
}
