import * as R from 'ramda'
import { IResolvers } from 'apollo-server-express'
import me from './me'
import misc from './misc'
import dailies from './dailies'
import projs from './projs'
import costs from './costs'

const merge = (...args: IResolvers[]) => {
  return args.reduce(R.mergeDeepRight)
}
export default merge(me, misc, dailies, projs, costs)
