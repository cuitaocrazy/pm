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
import status from './status'
import industries from './industries'
import regions from './regions'
import customers from './customers'
import agreements from './agreements'
import projectAgreements from './projectAgreements'
import attachments from './attachments'
import tags from './tags'
import markets from './markets'




const merge = (...args: IResolvers[]) => {
  return args.reduce(R.mergeDeepRight)
}

export default merge(me, misc, dailies, projs, expenses, empDailies, projDailies, config, projExpenses, empExpenses, changePm, charts, status, industries, regions, customers, agreements, projectAgreements, attachments, tags, markets)
