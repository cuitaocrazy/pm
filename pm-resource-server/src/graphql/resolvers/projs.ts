import moment from "moment";
import { isNil } from "ramda";
import {
  AuthContext,
  getAllGroups,
  getGroupUsers,
  getUsersByGroups,
} from "../../auth/oauth";
import {
  Project,
  ProjectAgreement,
  Agreement,
  Customer,
  IProject,
} from "../../mongodb";
import { dbid2id, id2dbid, getMaxGroup } from "../../util/utils";
import { ObjectId } from "mongodb";

const getTodoProjects = (projects: any[]) => {
  const projectResult = projects.filter((project) => {
    const reg =
      /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
    const result = reg.exec(project.id || "");
    if (result?.groups?.projType === "SZ") {
      // 售中
      if (project.acceptDate) {
        const dayDiff = moment(project.acceptDate).diff(new Date(), "day");
        if (dayDiff <= 90 && dayDiff > 0) {
          return true;
        }
      }
    } else if (result?.groups?.projType === "SH") {
      if (project.startTime && project.serviceCycle) {
        const today = new Date();
        const monthDiff = moment(today).diff(project.startTime, "month");
        if (
          project.serviceCycle - monthDiff <= 3 &&
          project.serviceCycle - monthDiff > -1
        ) {
          return true;
        }
      }
    }
  });
  return projectResult;
};

export default {
  Query: {
    isExistProjID: async (_: any, __: any, context: AuthContext) => {
      let filter = { _id: __.id };
      const proj = await Project.findOne(filter);
      return proj ? true : false;
    },
    projs: (_: any, __: any, context: AuthContext) => {
      let filter = {};

      if (__.isArchive === true || __.isArchive === false) {
        filter["isArchive"] = __.isArchive;
      }
      // 添加 proState 为 1 或为空的条件
      filter["$or"] = [
        { proState: 1 }, // proState 为 1
        { proState: { $exists: false } }, // proState 字段不存在
        { proState: null }, // proState 为 null
      ];
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
      // filter['proState'] = 1
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
        leaders,
        contractState,
        incomeConfirm,
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
      if (leaders && leaders.length > 0) {
        filter["leader"] = { $in: leaders };
      }
      if (contractState) {
        filter["contractState"] = Number(contractState);
      }
      if (incomeConfirm) {
        filter["incomeConfirm"] = incomeConfirm;
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

      // filter["$or"] = [];
      if (filter["$or"]) {
        filter["$and"] = [
          {
            $or: filter["$or"].concat([
              { participants: { $elemMatch: { $eq: context.user!.id } } },
              { leader: { $in: subordinateIds } },
            ]),
          },
          {
            $or: [{ proState: 1 }, { proState: { $exists: false } }],
          },
        ];
      } else {
        filter["$and"] = [
          {
            $or: [
              { participants: { $elemMatch: { $eq: context.user!.id } } },
              { leader: { $in: subordinateIds } },
            ],
          },
          {
            $or: [{ proState: 1 }, { proState: { $exists: false } }],
          },
        ];
      }
      // filter["$or"] = [];
      // if (filter["$or"]) {
      //   filter["$or"] = filter["$or"].concat([
      //     { participants: { $elemMatch: { $eq: context.user!.id } } },
      //     { leader: { $in: subordinateIds } },
      //   ]);
      // } else {
      //   filter["$or"] = [
      //     { participants: { $elemMatch: { $eq: context.user!.id } } },
      //     { leader: { $in: subordinateIds } },
      //   ];
      // }

      // console.dir(filter, { depth: null, colors: true });
      const result = await Project.find(filter)
        .skip(skip)
        .limit(pageSize)
        .sort({ createDate: -1 })
        .map(dbid2id)
        .toArray(); //项目数据

      const projIds = result.map((proj) => proj.id); //项目的ID
      const projAggrement = await ProjectAgreement.find({
        _id: { $in: projIds },
      }).toArray(); //中间的表，有合同ID和项目ID，根据项目ID去查
      await Promise.all(
        projAggrement.map(async (pa) => {
          const agreement = await Agreement.find({
            _id: new ObjectId(pa.agreementId),
          })
            .map(dbid2id)
            .toArray(); //合同数据
          // console.dir(agreement, { depth: null, colors: true });
          const oneResult = result.find((res) => res.id === pa._id);
          oneResult.agreements = agreement;
        })
      );
      await Promise.all(
        result.map(async (oneResult) => {
          const customer = await Customer.findOne({
            $or: [
              { _id: new ObjectId(oneResult.customer) },
              { _id: oneResult.customer },
            ],
          });
          if (customer) oneResult.customerObj = dbid2id(customer);
        })
      );
      // console.dir(filter, { depth: null, colors: true });
      const total = await Project.find(filter).count();

      return {
        result,
        page,
        total,
      };
    },
    //获取待审核的项目（其他的限制条件都一样）
    awaitingReviewProjs: async (_: any, __: any, context: AuthContext) => {
      const user = context.user!;
      const maxGroup = getMaxGroup(user.groups);
      let subordinateIds: string[] = [];
      // 一级部门和二级部门可以看到同级全部，但3级部门职能看到自己领导的
      if (maxGroup[0].split("/").length < 4) {
        const subordinate = await getUsersByGroups(user, maxGroup);
        subordinateIds = subordinate.map((subordinate) => subordinate.id);
      }

      const filter = {
        isArchive: __.isArchive ? __.isArchive : false,
        $or: [
          { leader: context.user!.id },
          { salesLeader: context.user!.id },
          { leader: { $in: subordinateIds } },
        ],
      };
      filter["proState"] = 0;

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
        leaders,
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
        filter["group"] = new RegExp(group, "g");
      }
      if (name) {
        filter["name"] = new RegExp(name, "g");
      }
      if (leaders) {
        filter["leader"] = { $in: leaders };
      }

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
        .skip(skip)
        .limit(pageSize)
        .sort({ createDate: -1 })
        .map(dbid2id)
        .toArray();
      const projIds = result.map((proj) => proj.id);
      const projAggrement = await ProjectAgreement.find({
        _id: { $in: projIds },
      }).toArray();
      await Promise.all(
        projAggrement.map(async (pa) => {
          const agreement = await Agreement.find({
            _id: new ObjectId(pa.agreementId),
          })
            .map(dbid2id)
            .toArray();
          const oneResult = result.find((res) => res.id === pa._id);
          oneResult.agreements = agreement;
        })
      );

      await Promise.all(
        result.map(async (oneResult) => {
          const customer = await Customer.findOne({
            $or: [
              { _id: new ObjectId(oneResult.customer) },
              { _id: oneResult.customer },
            ],
          });
          if (customer) oneResult.customerObj = dbid2id(customer);
        })
      );

      const total = await Project.countDocuments(filter);

      return {
        result,
        page,
        total,
      };
    },
    iLeadTodoProjs: async (_: any, __: any, context: AuthContext) => {
      const user = context.user!;
      const maxGroup = getMaxGroup(user.groups);
      let subordinateIds: string[] = [];
      // 一级部门和二级部门可以看到同级全部，但3级部门职能看到自己领导的
      if (maxGroup[0].split("/").length < 4) {
        const subordinate = await getUsersByGroups(user, maxGroup);
        subordinateIds = subordinate.map((subordinate) => subordinate.id);
      }

      const filter = {
        isArchive: __.isArchive ? __.isArchive : false,
        $or: [
          { leader: context.user!.id },
          { salesLeader: context.user!.id },
          { leader: { $in: subordinateIds } },
        ],
      };

      let todoTotalResult = await Project.find(filter).map(dbid2id).toArray();
      todoTotalResult = getTodoProjects(todoTotalResult);

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
        leaders,
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
      if (!projTypes || projTypes.length == 0) projTypes = ["SH", "SZ"];

      projTypes = projTypes.filter(
        (projType) => projType === "SH" || projType === "SZ"
      );
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
      if (leaders) {
        filter["leader"] = { $in: leaders };
      }

      for (let i = 0; i < regions.length; i++) {
        for (let j = 0; j < industries.length; j++) {
          for (let k = 0; k < projTypes.length; k++) {
            const regexStr = `^${industries[j]}-${regions[i]}-${projTypes[k]}-.*`;
            regexArray.push(new RegExp(regexStr));
          }
        }
      }
      filter["_id"] = { $in: regexArray, $not: /-ZH-/ };
      let result = await Project.find(filter)
        .sort({ createDate: -1 })
        .map(dbid2id)
        .toArray();
      result = getTodoProjects(result);

      const projIds = result.map((proj) => proj.id);
      const projAggrement = await ProjectAgreement.find({
        _id: { $in: projIds },
      }).toArray();
      await Promise.all(
        projAggrement.map(async (pa) => {
          const agreement = await Agreement.find({
            _id: new ObjectId(pa.agreementId),
          })
            .map(dbid2id)
            .toArray();
          const oneResult = result.find((res) => res.id === pa._id);
          oneResult.agreements = agreement;
        })
      );

      await Promise.all(
        result.map(async (oneResult) => {
          const customer = await Customer.findOne({
            $or: [
              { _id: new ObjectId(oneResult.customer) },
              { _id: oneResult.customer },
            ],
          });
          if (customer) oneResult.customerObj = dbid2id(customer);
        })
      );

      const total = result.length;
      result = result.slice(skip, pageSize + skip);
      return {
        result,
        page,
        total,
        todoTotal: todoTotalResult.length,
      };
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
        leaders,
        incomeConfirm,
        contractState,
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
        filter["group"] = new RegExp(group, "g");
      }
      if (name) {
        filter["name"] = new RegExp(name, "g");
      }
      if (leaders) {
        filter["leader"] = { $in: leaders };
      }
      if (incomeConfirm) {
        filter["incomeConfirm"] = Number(incomeConfirm);
      }
      if (contractState) {
        filter["contractState"] = Number(contractState);
      }

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
        .skip(skip)
        .limit(pageSize)
        .sort({ createDate: -1 })
        .map(dbid2id)
        .toArray();
      const projIds = result.map((proj) => proj.id);
      const projAggrement = await ProjectAgreement.find({
        _id: { $in: projIds },
      }).toArray();
      await Promise.all(
        projAggrement.map(async (pa) => {
          const agreement = await Agreement.find({
            _id: new ObjectId(pa.agreementId),
          })
            .map(dbid2id)
            .toArray();
          const oneResult = result.find((res) => res.id === pa._id);
          oneResult.agreements = agreement;
        })
      );

      await Promise.all(
        result.map(async (oneResult) => {
          const customer = await Customer.findOne({
            $or: [
              { _id: new ObjectId(oneResult.customer) },
              { _id: oneResult.customer },
            ],
          });
          if (customer) oneResult.customerObj = dbid2id(customer);
        })
      );

      const total = await Project.countDocuments(filter);

      return {
        result,
        page,
        total,
      };
    },
    iLeadProjs_: async (_: any, __: any, context: AuthContext) => {
      const user = context.user!;
      const maxGroup = getMaxGroup(user.groups);
      let subordinateIds: string[] = [];
      // 一级部门和二级部门可以看到同级全部，但3级部门职能看到自己领导的
      if (maxGroup[0].split("/").length < 4) {
        const subordinate = await getUsersByGroups(user, maxGroup);
        subordinateIds = subordinate.map((subordinate) => subordinate.id);
      }

      const filter = {
        isArchive: __.isArchive ? __.isArchive : false,
        $or: [
          { leader: context.user!.id },
          { salesLeader: context.user!.id },
          { leader: { $in: subordinateIds } },
        ],
        $and: [
          {
            $or: [
              { proState: 1 }, // proState 为 1
              { proState: { $exists: false } }, // proState 不存在
              { proState: null }, // proState 为 null
            ],
          },
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
        leaders,
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
        filter["group"] = new RegExp(group, "g");
      }
      if (name) {
        filter["name"] = new RegExp(name, "g");
      }
      if (leaders) {
        filter["leader"] = { $in: leaders };
      }

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
        .skip(skip)
        .limit(pageSize)
        .sort({ createDate: -1 })
        .map(dbid2id)
        .toArray();
      const projIds = result.map((proj) => proj.id);
      const projAggrement = await ProjectAgreement.find({
        _id: { $in: projIds },
      }).toArray();
      await Promise.all(
        projAggrement.map(async (pa) => {
          const agreement = await Agreement.find({
            _id: new ObjectId(pa.agreementId),
          })
            .map(dbid2id)
            .toArray();
          const oneResult = result.find((res) => res.id === pa._id);
          oneResult.agreements = agreement;
        })
      );

      await Promise.all(
        result.map(async (oneResult) => {
          const customer = await Customer.findOne({
            $or: [
              { _id: new ObjectId(oneResult.customer) },
              { _id: oneResult.customer },
            ],
          });
          if (customer) oneResult.customerObj = dbid2id(customer);
        })
      );

      const total = await Project.countDocuments(filter);

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
        $and: [
          {
            $or: [
              { proState: 1 }, // proState 为 1
              { proState: { $exists: false } }, // proState 不存在
              { proState: null }, // proState 为 null
            ],
          },
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
        filter["group"] = new RegExp(group, "g");
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
      console.dir(filter, { depth: null, colors: true });
      const result = await Project.find(filter)
        .sort({ createDate: -1 })
        .map(dbid2id)
        .skip(skip)
        .limit(pageSize)
        .toArray();
      const projIds = result.map((proj) => proj.id);
      const projAggrement = await ProjectAgreement.find({
        _id: { $in: projIds },
      }).toArray();
      await Promise.all(
        projAggrement.map(async (pa) => {
          const agreement = await Agreement.find({
            _id: new ObjectId(pa.agreementId),
          })
            .map(dbid2id)
            .toArray();
          const oneResult = result.find((res) => res.id === pa._id);
          oneResult.agreements = agreement;
        })
      );
      await Promise.all(
        result.map(async (oneResult) => {
          const customer = await Customer.findOne({
            $or: [
              { _id: new ObjectId(oneResult.customer) },
              { _id: oneResult.customer },
            ],
          });
          if (customer) oneResult.customerObj = dbid2id(customer);
        })
      );

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
      // if (!proj.participants.includes(context.user!.id)) {
      //   proj.participants = proj.participants.concat(
      //     context.user!.id,
      //     proj.salesLeader
      //   );
      // }
      // if (!proj.participants.includes(proj.salesLeader)) {
      //   proj.participants = proj.participants.concat(proj.salesLeader);
      // }
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
    applyAgain: async (_: any, args: any, context: AuthContext) => {
      const { id, ...proj } = args.proj;
      proj.participants = proj.participants || [];
      proj.contacts = proj.contacts || [];

      // 获取旧项目数据
      const oldId = proj.oldId;
      // console.dir(oldId, { depth: null, colors: true });
      // 删除 `oldId` 对应的数据
      if (oldId) {
        await Project.deleteOne({ _id: oldId });
      }
      // 判断是否有此项目，如果没有则为第一次创建
      let repeat = await Project.findOne({ _id: id });
      // console.dir(repeat, { depth: null, colors: true });

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
      // console.dir(proj, { depth: null, colors: true });
      // console.dir(id, { depth: null, colors: true });
      // return 123;
      // // 更新或新增项目
      proj.updateTime = moment()
        .utc()
        .utcOffset(8 * 60)
        .format("YYYY-MM-DD HH:mm:ss");
      delete proj.contName;

      // // 插入新数据
      return Project.updateOne(
        { _id: id },
        { $set: proj },
        { upsert: true }
      ).then((res) => {
        console.dir(res, { depth: null, colors: true });
        console.dir(id, { depth: null, colors: true });
        return id || res.upsertedId._id;
      });
    },
    checkProj: async (_: any, args: any, context: AuthContext) => {
      // console.dir(args, { depth: null, colors: true });
      let { id, checkState, reason, incomeConfirm } = args;
      return Project.updateOne(
        { _id: id },
        { $set: { proState: checkState, reason, incomeConfirm } },
        { upsert: true }
      )
        .then((res) => id || res.upsertedId._id)
        .catch((e) => {
          // console.dir(e, { depth: null, colors: true });
        });
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
    incomeConfirmProj: async (_: any, args: any, context: AuthContext) => {
      return Project.updateOne(
        { _id: args.id },
        {
          $set: {
            incomeConfirm: 2,
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
