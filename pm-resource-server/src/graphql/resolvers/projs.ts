import moment from 'moment'
import { isNil } from 'ramda';
import { AuthContext } from '../../auth/oauth'
import { Project, ProjectAgreement } from '../../mongodb'
import { dbid2id, id2dbid } from '../../util/utils'
export default {
  Query: {
    projs: (_: any, __: any, context: AuthContext) => { 
      let filter = {}
      if (__.isArchive === true || __.isArchive === false) { filter['isArchive'] = __.isArchive }
      return Project
      .find(filter)
      .sort({ createDate: -1 })
      .map(dbid2id).toArray()
    },
    iLeadProjs: (_: any, __: any, context: AuthContext) => Project
      .find({
        isArchive: __.isArchive ? __.isArchive : false,
        $or: [ { leader: context.user!.id, }, { salesLeader: context.user!.id } ],
      })
      .sort({ createDate: -1 })
      .map(dbid2id).toArray(),
    filterProjs: (_: any, __: any, context: AuthContext) => Project
      .find({
        isArchive: false,
        $or: [ { leader: context.user!.id, }, { salesLeader: context.user!.id, }, { participants: { $elemMatch: { $eq: context.user!.id } } } ],
        _id: { $regex: '(?:[^-]+-){1}'+__.projType+'' },
      })
      .sort({ createDate: -1 })
      .map(dbid2id).toArray(),
    filterProjsByApp: (_: any, __: any, context: AuthContext) => {
      let or = __.type === 'active' ? 
        [ { leader: context.user!.id, }, { salesLeader: context.user!.id, }, { participants: { $elemMatch: { $eq: context.user!.id } } } ]:
        [{ leader: context.user!.id, }, { salesLeader: context.user!.id } ]
      let filter = {
        isArchive: false,
        $or: or,
      }
      if (__.org || __.projType) {
        // ^[0-9A-Za-z]*-[0-9A-Za-z]*-[0-9A-Za-z]*-[0-9A-Za-z]*-[0-9A-Za-z]*$
        let regex = __.org && __.projType ? 
          `^${__.org}+-[0-9A-Za-z]*-${__.projType}+-[0-9A-Za-z]*-[0-9A-Za-z]*$`:
          __.org ?
          `^${__.org}+-[0-9A-Za-z]*-[0-9A-Za-z]*-[0-9A-Za-z]*-[0-9A-Za-z]*$` :
          `^[0-9A-Za-z]*-[0-9A-Za-z]*-${__.projType}+-[0-9A-Za-z]*-[0-9A-Za-z]*$`
        filter['_id'] = { $regex: regex }
      }
      return Project
      .find(filter)
      .sort({ createDate: -1 })
      .map(dbid2id).toArray()
    }
  },
  Mutation: {
    pushProject: async (_: any, args: any, context: AuthContext) => {
      const { id, ...proj } = args.proj
      proj.participants = proj.participants || []
      proj.contacts = proj.contacts || []
      // 判断是否有此项目，如果没有则为第一次创建
      let repeat = await Project.findOne({ _id: id })
      if (isNil(repeat)) {
        proj.createDate = moment().utc().utcOffset(8 * 60).format('YYYYMMDD')
        proj.isArchive = false
      } else {
        proj.createDate = repeat.createDate
        proj.isArchive = repeat.isArchive
      }
      proj.updateTime = moment().utc().utcOffset(8 * 60).format('YYYY-MM-DD HH:mm:ss')
      // 判断参与人员里是否有操作人，没有则添加进去
      if (!proj.participants.includes(context.user!.id)) {
        proj.participants = proj.participants.concat(context.user!.id)
      }
      // 判断是否关联了合同，若关联则更新，没关联则删除（废除，项目内不控制合同关联关系）
      // if (proj.contName) {
      //   await ProjectAgreement.updateOne({ _id: proj.id }, { $set: { agreementId: proj.contName } }, { upsert: true })
      // } else {
      //   await ProjectAgreement.deleteOne({ _id: proj.id })
      // }
      delete proj.contName
      return Project.updateOne({ _id: id }, { $set: proj }, { upsert: true }).then((res) => id || res.upsertedId._id)
    },
    archiveProject: async (_: any, args: any, context: AuthContext) => {
      let archiveTime = moment().utc().utcOffset(8 * 60).format('YYYY-MM-DD HH:mm:ss')
      return Project.updateOne({ _id: args.id }, { $set: { isArchive: true, archiveTime, archivePerson: context.user!.id } }, { upsert: true }).then((res) => args.id || res.upsertedId._id)
    },
    deleteProject: async (_: any, args: any, context: AuthContext) => {
      // 清除合同的绑定关系
      await ProjectAgreement.deleteMany({ _id: args.id })
      return Project.deleteOne({ _id: args.id }).then(() => args.id)
    },
    // 废弃（20230906）
    restartProject: async (_: any, args: any, context: AuthContext) => {
      // 清除合同的绑定关系
      await ProjectAgreement.deleteMany({ _id: args.id })
      return Project.updateOne({ _id: args.id }, { $set: { status: undefined } }, { upsert: true }).then((res) => args.id || res.upsertedId._id)
    },
  },
}
