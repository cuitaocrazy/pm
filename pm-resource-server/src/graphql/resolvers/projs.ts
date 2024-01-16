import moment from "moment";
import { isNil } from "ramda";
import {
  AuthContext,
  getAllGroups,
  getGroupUsers,
  getUsersByGroups,
} from "../../auth/oauth";
import { Project, ProjectAgreement } from "../../mongodb";
import { dbid2id, id2dbid, getMaxGroup } from "../../util/utils";
export default {
  Query: {
    projs: (_: any, __: any, context: AuthContext) => {
      let filter = {};

      if (__.isArchive === true || __.isArchive === false) {
        filter["isArchive"] = __.isArchive;
      }
      return Project.find(filter)
        .sort({ createDate: -1 })
        .map(dbid2id)
        .toArray();
    },
    superProjs: async (_: any, __: any, context: AuthContext) => {
      let filter = {};
      if (__.isArchive === true || __.isArchive === false) {
        filter["isArchive"] = __.isArchive;
      }

      let {
        regions,
        industries,
        projTypes,
        page,
        pageSize,
        confirmYear,
        group,
        status,
        name,
      } = __;
      if (!page || page === 0) {
        page = 1;
      }
      if (!pageSize || pageSize === 0) {
        pageSize = 10;
      }
      const skip = (page - 1) * pageSize;
      const user = context.user!;

      const regexArray: RegExp[] = [];
      if (!regions || regions.length == 0) regions = ["\\w*"];
      if (!industries || industries.length == 0) industries = ["\\w*"];
      if (!projTypes || projTypes.length == 0) projTypes = ["\\w*"];

      if (confirmYear) {
        filter["confirmYear"] = confirmYear;
      }
      if (status) {
        filter["status"] = status;
      }
      if (group) {
        filter["group"] = new RegExp(group, "g");
      }
      if (name) {
        filter["name"] = new RegExp(name, "g");
      }

      for (let i = 0; i < regions.length; i++) {
        for (let j = 0; j < industries.length; j++) {
          for (let k = 0; k < projTypes.length; k++) {
            const regexStr = `^${industries[j]}-${regions[i]}-${projTypes[k]}-.*`;
            regexArray.push(new RegExp(regexStr));
          }
        }
      }
      // filter = { _id: { $not: /-ZH-/ } };
      filter["_id"] = { $in: regexArray, $not: /-ZH-/ };

      const maxGroup = getMaxGroup(user.groups);
      let subordinateIds: string[] = [];

      // 一级部门和二级部门可以看到同级全部，但3级部门职能看到自己领导的
      if (maxGroup[0].split("/").length < 4) {
        const subordinate = await getUsersByGroups(user, maxGroup);
        subordinateIds = subordinate.map((subordinate) => subordinate.id);
      }
      filter["$or"] = [];
      if (filter["$or"]) {
        filter["$or"] = filter["$or"].concat([
          { participants: { $elemMatch: { $eq: context.user!.id } } },
          { leader: { $in: subordinateIds } },
        ]);
      } else {
        filter["$or"] = [
          { participants: { $elemMatch: { $eq: context.user!.id } } },
          { leader: { $in: subordinateIds } },
        ];
      }
      const result = await Project.find(filter)
        .skip(skip)
        .limit(pageSize)
        .sort({ createDate: -1 })
        .map(dbid2id)
        .toArray();
      const total = await Project.find(filter).count();
      return {
        result,
        page,
        total,
      };

      // return Project.find(filter)
      //   .skip(skip)
      //   .limit(pageSize)
      //   .sort({ createDate: -1 })
      //   .map(dbid2id)
      //   .toArray();
    },
    iLeadProjs: async (_: any, __: any, context: AuthContext) => {
      const user = context.user!;
      const maxGroup = getMaxGroup(user.groups);
      let subordinateIds: string[] = [];
      // 一级部门和二级部门可以看到同级全部，但3级部门职能看到自己领导的
      if (maxGroup[0].split("/").length < 4) {
        const subordinate = await getUsersByGroups(user, maxGroup);
        subordinateIds = subordinate.map((subordinate) => subordinate.id);
      }

      const filter = {
        _id: { $not: /-ZH-/ },
        isArchive: __.isArchive ? __.isArchive : false,
        $or: [
          { leader: context.user!.id },
          { salesLeader: context.user!.id },
          { leader: { $in: subordinateIds } },
        ],
      };

      let {
        regions,
        industries,
        projTypes,
        page,
        pageSize,
        confirmYear,
        group,
        status,
        name,
      } = __;

      if (!page || page === 0) {
        page = 1;
      }
      if (!pageSize || pageSize === 0) {
        pageSize = 10;
      }
      const skip = (page - 1) * pageSize;

      const regexArray: RegExp[] = [];
      if (!regions || regions.length == 0) regions = ["\\w*"];
      if (!industries || industries.length == 0) industries = ["\\w*"];
      if (!projTypes || projTypes.length == 0) projTypes = ["\\w*"];

      if (confirmYear) {
        filter["confirmYear"] = confirmYear;
      }
      if (status) {
        filter["status"] = status;
      }
      if (group) {
        filter["group"] = group;
      }
      if (name) {
        filter["name"] = new RegExp(name, "g");
      }

      for (let i = 0; i < regions.length; i++) {
        for (let j = 0; j < industries.length; j++) {
          for (let k = 0; k < projTypes.length; k++) {
            const regexStr = `^${industries[j]}-${regions[i]}-${projTypes[k]}-.*`;
            regexArray.push(new RegExp(regexStr));
          }
        }
      }

      const result = await Project.find(filter)
        .skip(skip)
        .limit(pageSize)
        .sort({ createDate: -1 })
        .map(dbid2id)
        .toArray();

      const total = await Project.find(filter).count();
      return {
        result,
        page,
        total,
      };
    },
    filterProjs: async (_: any, __: any, context: AuthContext) => {
      const user = context.user!;
      const maxGroup = getMaxGroup(user.groups);
      let subordinateIds: string[] = [];
      // 一级部门和二级部门可以看到同级全部，但3级部门职能看到自己领导的
      if (maxGroup[0].split("/").length < 4) {
        const subordinate = await getUsersByGroups(user, maxGroup);
        subordinateIds = subordinate.map((subordinate) => subordinate.id);
      }
      const filter = {
        isArchive: false,
        $or: [
          { leader: context.user!.id },
          { salesLeader: context.user!.id },
          { participants: { $elemMatch: { $eq: context.user!.id } } },
          { leader: { $in: subordinateIds } },
        ],
      };
      let {
        regions,
        industries,
        projType,
        page,
        pageSize,
        confirmYear,
        group,
        status,
        name,
      } = __;

      if (confirmYear) {
        filter["confirmYear"] = confirmYear;
      }
      if (status) {
        filter["status"] = status;
      }
      if (group) {
        filter["group"] = group;
      }
      if (name) {
        filter["name"] = new RegExp(name, "g");
      }

      if (!page || page === 0) {
        page = 1;
      }
      if (!pageSize || pageSize === 0) {
        pageSize = 10;
      }
      const skip = (page - 1) * pageSize;
      const regexArray: RegExp[] = [];
      if (!regions || regions.length == 0) regions = ["\\w*"];
      if (!industries || industries.length == 0) industries = ["\\w*"];
      if (projType == null) {
        projType = "SQ";
      }
      const projTypes = [projType];
      for (let i = 0; i < regions.length; i++) {
        for (let j = 0; j < industries.length; j++) {
          for (let k = 0; k < projTypes.length; k++) {
            const regexStr = `^${industries[j]}-${regions[i]}-${projTypes[k]}-.*`;
            regexArray.push(new RegExp(regexStr));
          }
        }
      }

      filter["_id"] = { $in: regexArray, $not: /-ZH-/ };
      const result = await Project.find(filter)
        .sort({ createDate: -1 })
        .map(dbid2id)
        .skip(skip)
        .limit(pageSize)
        .toArray();
      const total = await Project.find(filter).count();
      return {
        result,
        page,
        total,
      };
    },
    filterProjsByType: (_: any, __: any, context: AuthContext) =>
      Project.find({
        isArchive: false,
        _id: {
          $regex: `^[0-9A-Za-z]*-[0-9A-Za-z]*-${__.projType}+-[0-9A-Za-z]*-[0-9A-Za-z]*$`,
        },
      })
        .sort({ createDate: -1 })
        .map(dbid2id)
        .toArray(),
    filterProjsByApp: (_: any, __: any, context: AuthContext) => {
      let or =
        __.type === "active"
          ? [
              { leader: context.user!.id },
              { salesLeader: context.user!.id },
              { participants: { $elemMatch: { $eq: context.user!.id } } },
            ]
          : [{ leader: context.user!.id }, { salesLeader: context.user!.id }];
      let filter = __.isAdmin
        ? { isArchive: false }
        : { isArchive: false, $or: or };
      if (__.org || __.projType) {
        // ^[0-9A-Za-z]*-[0-9A-Za-z]*-[0-9A-Za-z]*-[0-9A-Za-z]*-[0-9A-Za-z]*$
        let regex =
          __.org && __.projType
            ? `^${__.org}+-[0-9A-Za-z]*-${__.projType}+-[0-9A-Za-z]*-[0-9A-Za-z]*$`
            : __.org
            ? `^${__.org}+-[0-9A-Za-z]*-[0-9A-Za-z]*-[0-9A-Za-z]*-[0-9A-Za-z]*$`
            : `^[0-9A-Za-z]*-[0-9A-Za-z]*-${__.projType}+-[0-9A-Za-z]*-[0-9A-Za-z]*$`;
        filter["_id"] = { $regex: regex };
      }
      if (__.customerId) {
        filter["customer"] = __.customerId;
      }
      filter["_id"] = { $not: /-ZH-/ };
      return Project.find(filter)
        .sort({ createDate: -1 })
        .map(dbid2id)
        .toArray();
    },
    findOneProjectById: (_: any, __: any, context: AuthContext) =>
      Project.findOne({
        _id: __.id,
      }).then((proj) => dbid2id(proj)),
  },
  Mutation: {
    pushProject: async (_: any, args: any, context: AuthContext) => {
      const { id, ...proj } = args.proj;
      proj.participants = proj.participants || [];
      proj.contacts = proj.contacts || [];
      // 判断是否有此项目，如果没有则为第一次创建
      let repeat = await Project.findOne({ _id: id });
      if (isNil(repeat)) {
        proj.createDate = moment()
          .utc()
          .utcOffset(8 * 60)
          .format("YYYYMMDD");
        proj.isArchive = false;
      } else {
        proj.createDate = repeat.createDate;
        proj.isArchive = repeat.isArchive;
      }
      proj.updateTime = moment()
        .utc()
        .utcOffset(8 * 60)
        .format("YYYY-MM-DD HH:mm:ss");
      // 判断参与人员里是否有操作人/市场经理，没有则添加进去
      if (!proj.participants.includes(context.user!.id)) {
        proj.participants = proj.participants.concat(
          context.user!.id,
          proj.salesLeader
        );
      }
      if (!proj.participants.includes(proj.salesLeader)) {
        proj.participants = proj.participants.concat(proj.salesLeader);
      }
      // 判断是否关联了合同，若关联则更新，没关联则删除（废除，项目内不控制合同关联关系）
      // if (proj.contName) {
      //   await ProjectAgreement.updateOne({ _id: proj.id }, { $set: { agreementId: proj.contName } }, { upsert: true })
      // } else {
      //   await ProjectAgreement.deleteOne({ _id: proj.id })
      // }
      delete proj.contName;
      return Project.updateOne(
        { _id: id },
        { $set: proj },
        { upsert: true }
      ).then((res) => id || res.upsertedId._id);
    },
    archiveProject: async (_: any, args: any, context: AuthContext) => {
      let archiveTime = moment()
        .utc()
        .utcOffset(8 * 60)
        .format("YYYY-MM-DD HH:mm:ss");
      return Project.updateOne(
        { _id: args.id },
        {
          $set: {
            isArchive: true,
            archiveTime,
            archivePerson: context.user!.id,
          },
        },
        { upsert: true }
      ).then((res) => args.id || res.upsertedId._id);
    },
    deleteProject: async (_: any, args: any, context: AuthContext) => {
      let deletProj = await Project.findOne({ _id: args.id });
      if (deletProj?.timeConsuming) {
        return new Error(`项目已存在工时，无法删除！`);
      }
      // 清除合同的绑定关系
      await ProjectAgreement.deleteMany({ _id: args.id });
      return Project.deleteOne({ _id: args.id }).then(() => args.id);
    },
    // 废弃（20230906）
    restartProject: async (_: any, args: any, context: AuthContext) => {
      // 清除合同的绑定关系
      await ProjectAgreement.deleteMany({ _id: args.id });
      return Project.updateOne(
        { _id: args.id },
        { $set: { status: undefined } },
        { upsert: true }
      ).then((res) => args.id || res.upsertedId._id);
    },
  },
};
