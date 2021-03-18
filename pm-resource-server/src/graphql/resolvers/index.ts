import * as R from 'ramda'
import { IResolvers } from 'apollo-server-express'
import me from './me'
import misc from './misc'
import dailies from './dailies'
import projs from './projs'
import expenses from './expenses'
import dailiesViewer from './dailies-viewer'
import projDailies from './projDailies'
import config from './config'
import costsProject from './costs-project'
import costsEmployee from './costs-employee'
import changePm from './changePm'
import charts from './charts'

const merge = (...args: IResolvers[]) => {
  return args.reduce(R.mergeDeepRight)
}

export default merge(me, misc, dailies, projs, expenses, dailiesViewer, projDailies, config, costsProject, costsEmployee, changePm, charts)
