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

export interface IProject {
  /**
   * id
   */
  _id: string;
  /**
   * 负责人
   */
  leader: string;
  /**
   * 销售负责人
   */
  salesLeader: string;
  /**
   * 客户信息
   */
  customer: string;
  /**
   * 项目名称
   */
  name: string;
  /**
   * 合同名称
   */
  contName: string;
  /**
   * 项目状态
   */
  projStatus: string;
  /**
   * 合同状态
   */
  contStatus: string;
  /**
   * 验收状态
   */
  acceStatus: string;
  /**
   * 合同金额
   */
  contAmount: number;
  /**
   * 确认收入金额
   */
  recoAmount: number;
  /**
   * 项目预算
   */
  projBudget: number;
  /**
   * 预算费用
   */
  budgetFee: number;
  /**
   * 预算成本
   */
  budgetCost: number;

  /**
   * 实际成本
   */
  actualCost: number;
  /**
   * 税后金额
   */
  taxAmount: number;
  /**
   * 创建日期
   */
  createDate: Date;
  /**
   * 更新时间
   */
  updateTime: Date;
  /**
   * 参与人员
   */
  participants: string[];
  /**
   * 收入确认年度
   */
  confirmYear: string;
  /**
   * 联系人
   */
  contacts: [
    {
      /**
       * 姓名
       */
      name: string;
      /**
       * 职务
       */
      duties?: string;
      /**
       * 电话
       */
      phone?: string;
    }
  ];
  /**
   * 项目状态
   */
  status?: "onProj" | "endProj";
  /**
   * 是否归档
   */
  isArchive: Boolean;
  /**
   * 归档时间
   */
  archiveTime: string;
  /**
   * 归档人
   */
  archivePerson: string;
  /**
   * 总工时
   */
  timeConsuming: number;
  /**
   * 实施年度
   */
  doYear: string;
  /**
   * 人力费用
   */
  humanFee: number;
  /**
   * 项目费用
   */
  projectFee: number;

  group: string;

  projectClass: string;
}

export const Project = client.db().collection<IProject>(pluralize("Project"));
