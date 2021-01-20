import { MongoClient, ObjectId } from 'mongodb'
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
 * 项目
 */
export interface IProject {
  /**
   * id
   */
  _id: string
  /**
   * 名称
   */
  name: string
  /**
   * 负责人
   */
  leader: string
  /**
   * 预算
   */
  budget: number
  /**
   * 创建日期
   */
  createDate: Date
  /**
   * 项目类型
   */
  type: 'preSale' | 'onSale' | 'afterSale' | 'research' | 'comprehensive'
  /**
   * 参与人员
   */
  participants: string[]
  /**
   * 联系人
   */
  contacts: [{
    /**
     * 姓名
     */
    name: string
    /**
     * 职务
     */
    duties?: string
    /**
     * 电话
     */
    phone?: string
  }]
}

export const Project = client.db().collection<IProject>(pluralize('Project'))

export interface ISettledDaily {
  _id: string
  emps: [{
    empId: string
    contents: [ProjDaily]
  }]
}

export const SettledDaily = client.db().collection<ISettledDaily>(pluralize('SettledDaily'))

/**
 * 开支
 */
export interface ICost {
  _id: ObjectId
  assignee: string
  createDate: string
  participant: string
  projs: {
    id: string
    amount: number
    type: string
    description?: string
  }[]
}

export const Cost = client.db().collection<ICost>(pluralize('Cost'))

/**
 * 配置
 */
export interface IConfig {
  _id: string
  data: string[]
}

export const Config = client.db().collection<IConfig>(pluralize('Config'))
