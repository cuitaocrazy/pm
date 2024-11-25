import { MongoClient, ObjectId } from "mongodb";
import config from "../config/mongodb";
import pluralize from "../util/pluralize";

export const client = new MongoClient(config.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect();

export interface ProjDaily {
  projId: string;
  timeConsuming: number;
  content: string;
}

/**
 * 员工日报
 */
export interface IEmployeeDaily {
  _id: string;
  dailies: {
    date: string;
    projs: ProjDaily[];
  }[];
}

export const EmployeeDaily = client
  .db()
  .collection<IEmployeeDaily>(pluralize("EmployeeDaily"));

/**
 * 项目
 */
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

  startTime: string;

  acceptDate: string;

  serviceCycle: number;
}

export const Project = client.db().collection<IProject>(pluralize("Project"));

export interface ISettledDaily {
  _id: string;
  emps: [
    {
      empId: string;
      contents: [ProjDaily];
    }
  ];
}

export const SettledDaily = client
  .db()
  .collection<ISettledDaily>(pluralize("SettledDaily"));

/**
 * 开支
 */
export interface ICost {
  _id: ObjectId;
  assignee: string;
  createDate: string;
  participant: string;
  projs: {
    id: string;
    amount: number;
    type: string;
    description?: string;
  }[];
}

export const Cost = client.db().collection<ICost>(pluralize("Cost"));

/**
 * 配置
 */
export interface IConfig {
  _id: string;
  data: any;
}

export const Config = client.db().collection<IConfig>(pluralize("Config"));

/**
 * 状态
 */
export interface IStatu {
  _id: ObjectId;
  /**
   * 父id
   */
  pId: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 代码
   */
  code: string;
  /**
   * 备注
   */
  remark: string;
  /**
   * 是否删除
   */
  isDel: Boolean;
  /**
   * 排序
   */
  sort: number;
  /**
   * 创建日期
   */
  createDate: Date;
}

export const Statu = client.db().collection<IStatu>(pluralize("Statu"));

/**
 * 行业
 */
export interface IIndustry {
  _id: ObjectId;
  /**
   * 名称
   */
  name: string;
  /**
   * 代码
   */
  code: string;
  /**
   * 备注
   */
  remark: string;
  /**
   * 是否启用
   */
  enable: Boolean;
  /**
   * 是否删除
   */
  isDel: Boolean;
  /**
   * 排序
   */
  sort: number;
  /**
   * 创建日期
   */
  createDate: Date;
}

export const Industry = client
  .db()
  .collection<IIndustry>(pluralize("Industry"));

/**
 * 区域
 */
export interface IRegion {
  _id: ObjectId;
  /**
   * 名称
   */
  name: string;
  /**
   * 代码
   */
  code: string;
  /**
   * 备注
   */
  remark: string;
  /**
   * 是否启用
   */
  enable: Boolean;
  /**
   * 是否删除
   */
  isDel: Boolean;
  /**
   * 排序
   */
  sort: number;
  /**
   * 创建日期
   */
  createDate: Date;
  /**
   * 一级区域ID
   */
  parentId: string;
}

export const Region = client.db().collection<IRegion>(pluralize("Region"));
/**
 * 一级区域
 */
export interface IRegionOne {
  _id: ObjectId;
  /**
   * 名称
   */
  name: string;
  /**
   * 代码
   */
  code: string;
  /**
   * 备注
   */
  remark: string;
  /**
   * 是否启用
   */
  enable: Boolean;
  /**
   * 是否删除
   */
  isDel: Boolean;
  /**
   * 排序
   */
  sort: number;
  /**
   * 创建日期
   */
  createDate: Date;
}

export const RegionOne = client
  .db()
  .collection<IRegionOne>(pluralize("RegionOne"));
/**
 * 年度管理
 */
export interface IYearManage {
  _id: ObjectId;
  /**
   * 名称
   */
  name: string;
  /**
   * 代码
   */
  code: string;
  /**
   * 备注
   */
  remark: string;
  /**
   * 是否启用
   */
  enable: Boolean;
  /**
   * 是否删除
   */
  isDel: Boolean;
  /**
   * 排序
   */
  sort: number;
  /**
   * 创建日期
   */
  createDate: Date;
}

export const YearManage = client
  .db()
  .collection<IYearManage>(pluralize("YearManage"));
/**
 * 季度管理
 */
export interface IQuarterManage {
  _id: ObjectId;
  /**
   * 名称
   */
  name: string;
  /**
   * 代码
   */
  code: string;
  /**
   * 备注
   */
  remark: string;
  /**
   * 是否启用
   */
  enable: Boolean;
  /**
   * 是否删除
   */
  isDel: Boolean;
  /**
   * 排序
   */
  sort: number;
  /**
   * 创建日期
   */
  createDate: Date;
}

export const QuarterManage = client
  .db()
  .collection<IQuarterManage>(pluralize("QuarterManage"));
/**
 * 付款状态管理
 */
export interface IPayStateManage {
  _id: ObjectId;
  /**
   * 名称
   */
  name: string;
  /**
   * 代码
   */
  code: string;
  /**
   * 备注
   */
  remark: string;
  /**
   * 是否启用
   */
  enable: Boolean;
  /**
   * 是否删除
   */
  isDel: Boolean;
  /**
   * 排序
   */
  sort: number;
  /**
   * 创建日期
   */
  createDate: Date;
}

export const PayStateManage = client
  .db()
  .collection<IPayStateManage>(pluralize("PayStateManage"));
/**
 * 项目确认状态管理
 */
export interface IProConfirmStateManage {
  _id: ObjectId;
  /**
   * 名称
   */
  name: string;
  /**
   * 代码
   */
  code: string;
  /**
   * 备注
   */
  remark: string;
  /**
   * 是否启用
   */
  enable: Boolean;
  /**
   * 是否删除
   */
  isDel: Boolean;
  /**
   * 排序
   */
  sort: number;
  /**
   * 创建日期
   */
  createDate: Date;
}

export const ProConfirmStateManage = client
  .db()
  .collection<IProConfirmStateManage>(pluralize("ProConfirmStateManage"));
/**
 * 回款季度管理
 */
export interface ICollectionQuarterManage {
  _id: ObjectId;
  /**
   * 名称
   */
  name: string;
  /**
   * 代码
   */
  code: string;
  /**
   * 备注
   */
  remark: string;
  /**
   * 是否启用
   */
  enable: Boolean;
  /**
   * 是否删除
   */
  isDel: Boolean;
  /**
   * 排序
   */
  sort: number;
  /**
   * 创建日期
   */
  createDate: Date;
}

export const CollectionQuarterManage = client
  .db()
  .collection<ICollectionQuarterManage>(pluralize("CollectionQuarterManage"));

/**
 * 区域
 */
export interface IProjectClass {
  _id: ObjectId;
  /**
   * 名称
   */
  name: string;
  /**
   * 代码
   */
  code: string;
  /**
   * 备注
   */
  remark: string;
  /**
   * 是否启用
   */
  enable: Boolean;
  /**
   * 是否删除
   */
  isDel: Boolean;
  /**
   * 排序
   */
  sort: number;
  /**
   * 创建日期
   */
  createDate: Date;
}
export const ProjectClass = client
  .db()
  .collection<IProjectClass>(pluralize("ProjectClass"));

/**
 * 客户信息
 */
export interface ICustomer {
  _id: ObjectId;
  /**
   * 名称
   */
  name: string;
  /**
   * 行业编码
   */
  industryCode: string;
  /**
   * 区域编码
   */
  regionCode: string;
  /**
   * 销售负责人
   */
  salesman: string[];
  /**
   * 办公地址
   */
  officeAddress: string;
  /**
   * 客户联系人
   */
  contacts: [
    {
      /**
       * 姓名
       */
      name: string;
      /**
       * 电话
       */
      phone: string;
      /**
       * 职务
       */
      tags?: string[];
      /**
       * 录入人
       */
      recorder?: string;
      /**
       * 备注
       */
      remark: string;
    }
  ];
  /**
   * 备注
   */
  remark: string;
  /**
   * 是否启用
   */
  enable: Boolean;
  /**
   * 是否删除
   */
  isDel: Boolean;
  /**
   * 创建日期
   */
  createDate: Date;
}

export const Customer = client
  .db()
  .collection<ICustomer>(pluralize("customers"));

/**
 * 合同信息
 */
export interface IAgreement {
  _id: ObjectId;
  /**
   * 名称
   */
  name: string;
  /**
   * 关联客户
   */
  customer: string;
  /**
   * 合同类型
   */
  type: string;
  /**
   * 文件列表
   */
  fileList: [
    {
      /**
       * uid
       */
      uid: string;
      /**
       * 名称
       */
      name: string;
      /**
       * 状态
       */
      status: string;
      /**
       * 地址
       */
      url: string;
    }
  ];
  /**
   * 开始时间
   */
  startTime: Date;
  /**
   * 结束时间
   */
  endTime: Date;
  /**
   * 备注
   */
  remark: string;
  /**
   * 是否删除
   */
  isDel: Boolean;
  /**
   * 创建日期
   */
  createDate: Date;
}

export const Agreement = client
  .db()
  .collection<IAgreement>(pluralize("Agreement"));

/**
 * 项目合同关联关系
 */
export interface IProjectAgreement {
  _id: ObjectId;
  /**
   * 合同id
   */
  agreementId: string;
}

export const ProjectAgreement = client
  .db()
  .collection<IProjectAgreement>(pluralize("ProjectAgreement"));

/**
 * 文件表
 */
export interface IAttachment {
  _id: ObjectId;
  /**
   * 名称
   */
  name: string;
  /**
   * 文件目录
   */
  directory: string;
  /**
   * 存储地址
   */
  path: string;
}

export const Attachment = client
  .db()
  .collection<IAttachment>(pluralize("Attachment"));

/**
 * 标签表
 */
export interface ITags {
  _id: ObjectId;
  /**
   * 名称
   */
  name: string;
  /**
   * 创建日期
   */
  createDate: string;
}

export const Tag = client.db().collection<ITags>(pluralize("Tag"));

/**
 * 市场信息
 */
export interface IMarket {
  /**
   * 机构id
   */
  _id: ObjectId;
  /**
   * 负责人
   */
  leader: string;
  /**
   * 机构名称
   */
  name: string;
  /**
   * 机构项目
   */
  projects: [
    {
      /**
       * 项目名称
       */
      name: string;
      /**
       * 项目简介
       */
      introduct: string;
      /**
       * 项目规模
       */
      scale: string;
      /**
       * 项目计划
       */
      plan: string;
      /**
       * 项目状态
       */
      status?: "track" | "stop" | "transfer";
      /**
       * 项目资料
       */
      fileList: [
        {
          /**
           * uid
           */
          uid: string;
          /**
           * 名称
           */
          name: string;
          /**
           * 状态
           */
          status: string;
          /**
           * 地址
           */
          url: string;
          /**
           * 缩略地址
           */
          thumbUrl: String;
        }
      ];
      /**
       * 拜访记录
       */
      visitRecord: [
        {
          /**
           * 拜访时间
           */
          date: string;
          /**
           * 拜访内容
           */
          content: string;
        }
      ];
    }
  ];
  /**
   * 机构联系人
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
      duties?: string[];
      /**
       * 电话
       */
      phone?: string;
      /**
       * 备注
       */
      remark?: string;
    }
  ];
  /**
   * 创建日期
   */
  createDate?: Date;
  /**
   * 更新时间
   */
  updateTime?: Date;
  /**
   * 是否删除
   */
  isDel: Boolean;
}

export const Market = client.db().collection<IMarket>(pluralize("Market"));

/**
 * 市场项目计划
 */
export interface IMarketPlan {
  /**
   * 计划id
   */
  _id: ObjectId;
  /**
   * 填写人
   */
  leader: string;
  /**
   * 周编码
   */
  week: string;
  /**
   * 机构ID
   */
  weekPlans: [
    {
      /**
       * 机构ID
       */
      marketId: string;
      /**
       * 机构名称
       */
      marketName: string;
      /**
       * 项目名称
       */
      projectName: string;
      /**
       * 项目预算
       */
      projectScale: string;
      /**
       * 项目状态
       */
      projectStatus: string;
      /**
       * 项目计划
       */
      projectPlan: string;
      /**
       * 本周工作
       */
      weekWork: string;
      /**
       * 下周计划
       */
      nextWeekPlan: string;
    }
  ];
  /**
   * 创建日期
   */
  createDate?: Date;
  /**
   * 更新时间
   */
  updateTime?: Date;
}

export const MarketPlan = client
  .db()
  .collection<IMarketPlan>(pluralize("MarketPlan"));

/**
 * 操作日志
 */
export interface IEventLog {
  /**
   * 日志id
   */
  _id: ObjectId;
  /**
   * 操作用户
   */
  changeUser: string;
  /**
   * 操作类型
   */
  type: string;
  /**
   * 操作对象
   */
  target: string;
  /**
   * 原始值
   */
  oldValue: string;
  /**
   * 新值
   */
  newValue: string;
  /**
   * 操作描述
   */
  description: string;
  /**
   * 额外信息
   */
  information: string;
  /**
   * 操作时间
   */
  changeDate?: string;
}

export const EventLog = client
  .db()
  .collection<IEventLog>(pluralize("EventLog"));
