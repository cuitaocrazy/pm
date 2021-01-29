import { MongoClient } from 'mongodb'
import config from '../config/mongodb'
import pluralize from '../util/pluralize'

export const client = new MongoClient(config.url, { useNewUrlParser: true, useUnifiedTopology: true })
client.connect()

export interface ProjDaily {
  projId: string
  timeConsuming: number
  content: string
}

/**
 * 员工日报
 */
export interface IEmployeeDaily {
  _id: string
  dailies: {
    date: string
    projs: ProjDaily[]
  }[]
}

export const EmployeeDaily = client.db().collection<IEmployeeDaily>(pluralize('EmployeeDaily'))

/**
 * 配置
 */
export interface IConfig {
  _id: string
  data: any
}

export const Config = client.db().collection<IConfig>(pluralize('Config'))
