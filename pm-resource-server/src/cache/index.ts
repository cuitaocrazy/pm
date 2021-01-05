import NodeCache from 'node-cache'

export default new NodeCache({ stdTTL: 10 * 60, checkperiod: 2 * 60 })
