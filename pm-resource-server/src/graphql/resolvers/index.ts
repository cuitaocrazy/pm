import * as R from 'ramda'
import { IResolvers } from 'apollo-server-express'
import me from './me'
import misc from './misc'
import dailies from './dailies'
import projs from './projs'
import costs from './costs'
import dailiesViewer from './dailies-viewer'
import dailiesProject from './dailies-project'
import config from './config'
import costsProject from './costs-project'
import costsEmployee from './costs-employee'
import changePm from './changePm'

const merge = (...args: IResolvers[]) => {
  return args.reduce(R.mergeDeepRight)
}

export default merge(me, misc, dailies, projs, costs, dailiesViewer, dailiesProject, config, costsProject, costsEmployee,changePm)
