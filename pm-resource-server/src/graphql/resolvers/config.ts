import { isNil, union, difference } from 'ramda'
import { Config } from '../../mongodb'

const getConfigData = async (configId: string) => {
  const config = await Config.findOne({ _id: configId })
  return isNil(config)
    ? []
    : config.data
}

export default {
  Query: {
    workCalendar: () => getConfigData('workCalendar'),
    settleMonth: () => getConfigData('settleMonth'),
  },
  Mutation: {
    pushWorkCalendar: async (_: any, { data }: any) => {
      const oldData = await getConfigData('workCalendar')
      return Config.replaceOne({ _id: 'workCalendar' }, { _id: 'workCalendar', data: union(oldData, data) }, { upsert: true })
        .then(() => 'workCalendar')
    },
    deleteWorkCalendar: async (_: any, { data }: any) => {
      const oldData = await getConfigData('workCalendar')
      return Config.replaceOne({ _id: 'workCalendar' }, { _id: 'workCalendar', data: difference(oldData, data) }, { upsert: true })
        .then(() => 'workCalendar')
    },
  },
}
