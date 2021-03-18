import * as R from 'ramda'
import { IResolvers } from 'apollo-server-express'
import me from './me'
import misc from './misc'
import dailies from './dailies'
import projs from './projs'
import expenses from './expenses'
import empDailies from './empDailies'
import projDailies from './projDailies'
import config from './config'
import projExpenses from './projExpenses'
import empExpenses from './empExpenses'
import changePm from './changePm'
import charts from './charts'

const merge = (...args: IResolvers[]) => {
  return args.reduce(R.mergeDeepRight)
}

export default merge(me, misc, dailies, projs, expenses, empDailies, projDailies, config, projExpenses, empExpenses, changePm, charts)
