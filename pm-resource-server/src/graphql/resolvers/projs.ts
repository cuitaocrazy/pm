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
  Region,
  RegionOne,
} from "../../mongodb";
import { dbid2id, id2dbid, getMaxGroup } from "../../util/utils";
import { ObjectId } from "mongodb";

const getTodoProjects = (projects: any[]) => {
  const projectResult = projects.filter((project) => {
    const reg =
      /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
    const result = reg.exec(project.id || "");
    if (project.proState === 2) {
      return true;
    }
    if (result?.groups?.projType === "SZ") {
      // 售中 验收期与当前日期小于90天，返回该条数据
      if (project.acceptDate) {
        const dayDiff = moment(project.acceptDate).diff(new Date(), "day");
        if (dayDiff <= 90 && dayDiff > 0) {
          return true;
        }
      }
    } else if (result?.groups?.projType === "SH") {
      // 售后 服务周期 启动日期
      // console.log(project.serviceCycle,'project.serviceCycle llll')
      if (project.startTime && project.serviceCycle) {
       
        const today = new Date();
        // 启动周期和当前时间的差值，已服务了几个月
        const monthDiff = moment(today).diff(project.startTime, "month");
        // 服务周期-已服务了的，如果小于等于3个月，大于0个月，就返回该条数据
        if (
          project.serviceCycle - monthDiff <= 3 &&
          project.serviceCycle - monthDiff > -1
        ) {
          return true;
        }
      }
    }
    return false
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
    projs: async (_: any, __: any, context: AuthContext) => {
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
      const result = await Project.find(filter)
        .sort({ createDate: -1, _id: 1 })
        .map(dbid2id)
        .toArray();
        // const result = await Project.find(filter)
        // .skip(skip)
        // .limit(pageSize)
        // .sort({ createDate: -1 })
        // .map(dbid2id)
        // .toArray();
      const projIds = (result as any).map((proj) => proj.id);
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
          const oneResult = (result as any).find((res) => res.id === pa._id);
          oneResult.agreements = agreement;
        })
      );
      return result

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
        isPrint,
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
      // if (contractState) {
      //   filter["contractState"] = Number(contractState);
      // }
      if (confirmYear) {
        if(confirmYear == 'NDDD'){
          filter["confirmYear"] = { '$in': [confirmYear, null] };
        }else{
          filter["confirmYear"] = confirmYear;
        }
        
      }
      if (isPrint == '0' || isPrint == '1') {
        filter["printState"] = isPrint;
      }else if(isPrint == '2'){
        filter["printState"] = { $exists: false };
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
      // filter["_id"] = { $in: regexArray, $not: /-ZH-/ };
      

      const maxGroup = getMaxGroup(user.groups);
      let subordinateIds: string[] = [];
      // console.dir(maxGroup,{depth:null,color:true})
      // console.dir(maxGroup[0].split("/").length,{depth:null,color:true})
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
            $or: [{ proState: 1 }, { proState: { $exists: false } }, { proState: null }],
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
            $or: [{ proState: 1 }, { proState: { $exists: false } },{ proState: null }],
          },
        ];
      }
      (filter['$and'] as any).push({
        _id: { $in: regexArray, $not: /-ZH-/ }
      });
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

      // console.dir(filter,{depth:null,color:true})
      const proagree_ = await ProjectAgreement.find({}).toArray();
      let proAgreeProIds = proagree_.map(agreement => agreement._id)
      // console.log(proAgreeProIds,'proAgreeProIds LLLL')
      if(contractState) {
        if (contractState == '0') {
          // contractState 为 0，排除 excludeIds
          (filter['$and'] as any).push({
            _id: {
              '$nin': proAgreeProIds, // 不在 excludeIds 中
            }
          });
        } else if (contractState == '1') {
          // contractState 为 1，必须在 excludeIds 中
          (filter['$and'] as any).push({
            _id: {
              '$in': proAgreeProIds, // 必须在 excludeIds 中
            }
          });
        }
      }
      // console.dir(filter,{depth:null,color:true})
      const result = await Project.find(filter)
      .sort({ createDate: -1, _id: 1 })
        .skip(skip)
        .limit(pageSize)
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
      // let result_:any[] = []
      // for (let item of result) {
      //   if(contractState){
      //     const projAggrement = await ProjectAgreement.find({
      //       _id: item.id,
      //     }).toArray();
      //     // console.dir(projAggrement,{depth:null,color:true})
      //     // console.log('=====')
      //       if(contractState == '0' ){//未签署
      //         if(projAggrement.length == 0){
      //           result_.push(item)
      //         }
      //       }else if(contractState == '1' ){//已签署
      //         if(projAggrement.length > 0){
      //           result_.push(item)
      //         }
      //       }
      //   }else{
      //     result_.push(item)
      //   }
      // }
      const total = await Project.find(filter).map(dbid2id).toArray();
      // console.log(total,'total MMMMM')
      let total_:any[] = []
      for (let item of total) {
        if(contractState){
          const projAggrement = await ProjectAgreement.find({
            _id: item.id,
          }).toArray();
          // console.dir(projAggrement,{depth:null,color:true})
          // console.log('=====')
            if(contractState == '0' ){//未签署
              if(projAggrement.length == 0){
                total_.push(item)
              }
            }else if(contractState == '1' ){//已签署
              if(projAggrement.length > 0){
                total_.push(item)
              }
            }
        }else{
          total_.push(item)
        }
      }

      return {
        result,
        page,
        total:total_.length,
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
      .sort({ createDate: -1, _id: 1  })
        .skip(skip)
        .limit(pageSize)
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
        contractState,
      } = __;
      // console.log(contractState,'dddd')

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
      if (!projTypes || projTypes.length == 0) projTypes = ["SH", "SZ","SQ",'YF','ZH','QT'];

      projTypes = projTypes.filter(
        (projType) => projType === "SH" || projType === "SZ" || projType === "SQ"  || projType === "YF"  || projType === "ZH" || projType === "QT"
      );
      if (confirmYear) {
        if(confirmYear == 'NDDD'){
          filter["confirmYear"] = { '$in': [confirmYear, null] };
        }else{
          filter["confirmYear"] = confirmYear;
        }
        
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
        .sort({ createDate: -1, _id: 1 })
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
      let result_:any[] = []
      for (let item of result) {
        if(contractState){
          const projAggrement = await ProjectAgreement.find({
            _id: item.id,
          }).toArray();
          // console.dir(projAggrement,{depth:null,color:true})
          // console.log('=====')
            if(contractState == '0' ){//未签署
              if(projAggrement.length == 0){
                result_.push(item)
              }
            }else if(contractState == '1' ){//已签署
              if(projAggrement.length > 0){
                result_.push(item)
              }
            }
        }else{
          result_.push(item)
        }
      }
      
      const total = result_.length;
      let result__ = result_.slice(skip, pageSize + skip);
      return {
        result:result__,
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
        regionones,
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
        conName,
        isPrint,
      } = __
      if (!page || page === 0) {
        page = 1
      }
      if (!pageSize || pageSize === 0) {
        pageSize = 10
      }
      const skip = (page - 1) * pageSize
      let regionsT = []
      let regiononesT = []
      if (regions) {
        regionsT = JSON.parse(JSON.stringify(regions))
      }
      if (regionones) {
        regiononesT = JSON.parse(JSON.stringify(regionones))
      }
      const regexArray: RegExp[] = []
      const proIds: (string | number)[] = []
      if (!regions || regions.length == 0) regions = ["\\w*"];
      if (!regionones || regionones.length == 0) regionones = ["\\w*"];
      if (!industries || industries.length == 0) industries = ["\\w*"];
      if (!projTypes || projTypes.length == 0) projTypes = ["\\w*"];
      if (confirmYear) {
        if(confirmYear == 'NDDD'){
          filter["confirmYear"] = { '$in': [confirmYear, null] };
        }else{
          filter["confirmYear"] = confirmYear;
        }
        
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
        filter["incomeConfirm"] = incomeConfirm;
      }
      if (isPrint == '0' || isPrint == '1') {
        filter["printState"] = isPrint;
      }else if(isPrint == '2'){
        filter["printState"] = { $exists: false };
      }
      // if (contractState) {
      //   filter["contractState"] = Number(contractState);
      // }
      /**
       * 合同名称：
       * 合同名称去找合同表，拿到合同ID
       * 根据合同ID去找中间表，找到项目ID，
       * 根据项目ID去找项目
       * 和regexArray进行合并，去重
       */
      /**
       * 搜索条件合同状态：
       * 遍历每个项目，拿项目的ID去中间表和合同表查
       * filter有合同的或者没合同的
       */
      /**
       * 如果一级区域有值，二级区域没值，拿着一级区域去找二级区域的表，找出来符合的二级区域
       * 符合的二级区域合并到regions里，且去重
      */
      let newregions = [] as any
      if ((regiononesT && regiononesT.length > 0) && (!regionsT || regionsT.length === 0)) {
        const regions_ = await Region.find({ isDel: false, parentId: { $in: regiononesT } })
          .sort({ sort: 1 })
          .map(dbid2id)
          .toArray()
        const regionsCode = regions_.map(item => item.code)
        newregions = [...regionsCode]
      } else if ((regiononesT && regiononesT.length > 0) && (regionsT && regionsT.length > 0)) {
        newregions = [...regionsT]
      }else if((!regiononesT || regiononesT.length === 0) && (regionsT && regionsT.length > 0)){
        newregions = [...regionsT]
      }
      // console.dir(newregions,{depth:null,color:true})
      if (!newregions || newregions.length === 0) {
        newregions = ['\\w*']
      }
      for (let i = 0; i < newregions.length; i++) {
        for (let j = 0; j < industries.length; j++) {
          for (let k = 0; k < projTypes.length; k++) {
            // if(industries[j] !== '\\w*' || newregions[i] !== '\\w*' || projTypes[k] !== '\\w*'){
              const regexStr = `^${industries[j]}-${newregions[i]}-${projTypes[k]}-.*`;
              regexArray.push(new RegExp(regexStr))
            // }
            
          }
        }
      }
      if(conName) {
        let agreements = await Agreement.find({
          name: { $regex: conName },
          isDel:false,
        }).sort({ sort: 1 })
        .map(dbid2id)
        .toArray()
        if(agreements.length > 0){
          for (const item of agreements) {
            
            let proAgrs = await ProjectAgreement.find({
              agreementId: Buffer.isBuffer(item.id)?item.id.toHexString(): item.id.toString(),
            }).sort({ sort: 1 })
            .map(dbid2id)
            .toArray()
            
            if(proAgrs.length > 0){
              proAgrs.map(item=>proIds.push(item.id))
              
            }
            
          }
        }
        
      }
        
        // (filter["id"] as any[]).push({
        //   $or: [
        //     { _id: { $in: proIds }},
        //     { _id: { $in: regexArray == [] ? '' : regexArray, $not: /-ZH-/ } }
        //   ],
        // })
        // filter["id"] = {_id: { $in: regexArray == [] ? '' : regexArray, $not: /-ZH-/ }}
        // filter["_id"] = { $in: regexArray, $not: /-ZH-/ };
        // (filter['$and'] as any).push({_id:{$in: regexArray, $not: /-ZH-/}},)
        //   if(proIds.length > 0 ){
        //     (filter['$and'] as any).push({_id:{$in: proIds }})
        //   }
        
        
        // console.log(proIds,{depth:null,color:true})
        (filter['$and'] as any).push({
          _id: { $in: regexArray, $not: /-ZH-/ }
        });
        const proagree_ = await ProjectAgreement.find({}).toArray();
      let proAgreeProIds = proagree_.map(agreement => agreement._id)
      // console.log(proAgreeProIds,'proAgreeProIds LLLL')
      if(contractState) {
        if (contractState == '0') {
          // contractState 为 0，排除 excludeIds
          (filter['$and'] as any).push({
            _id: {
              '$nin': proAgreeProIds, // 不在 excludeIds 中
            }
          });
        } else if (contractState == '1') {
          // contractState 为 1，必须在 excludeIds 中
          (filter['$and'] as any).push({
            _id: {
              '$in': proAgreeProIds, // 必须在 excludeIds 中
            }
          });
        }
      }
      if(conName){
        if(proIds.length>0){
          (filter['$and'] as any).push({
            _id: {
              '$in': proIds, // 必须在 excludeIds 中
            }
          });
        }
        
      }
        console.dir(filter,{depth:null,color:true})
      const result = await Project.find(filter)
      .sort({ createDate: -1,_id: 1 })
        .skip(skip)
        .limit(pageSize)
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
          // console.dir(oneResult,{depth:null,color:true})
          const customer = await Customer.findOne({
            $or: [
              { _id: new ObjectId(oneResult.customer) },
              { _id: oneResult.customer },
            ],
          })
          const regionTemp = await Region.findOne({code: oneResult.id.split('-')[1], // 添加查询条件
            // 其他条件（如需要）
            isDel: false,})
          const regionOneTemp = await RegionOne.findOne({
            $or: [
              { _id: new ObjectId(regionTemp?.parentId) },
            ],
          })
          // console.dir(regionOneTemp,{depth:null,color:true})
          if(regionOneTemp) oneResult.regionOneName = regionOneTemp.name
          if (customer) oneResult.customerObj = dbid2id(customer);
        }),
      )
      // let result_:any[] = []
      // for (let item of result) {
      //   if(contractState){
      //     const projAggrement = await ProjectAgreement.find({
      //       _id: item.id,
      //     }).toArray();
      //     // console.dir(projAggrement,{depth:null,color:true})
      //     // console.log('=====')
      //       if(contractState == '0' ){//未签署
      //         if(projAggrement.length == 0){
      //           result_.push(item)
      //         }
      //       }else if(contractState == '1' ){//已签署
      //         if(projAggrement.length > 0){
      //           result_.push(item)
      //         }
      //       }
      //   }else{
      //     result_.push(item)
      //   }
      // }
      // let result__:any[] = []
      // for (const item of result) {
      //   if(conName){
      //     if(proIds.length > 0 && proIds.includes(item.id)){
      //         result__.push(item)
      //     }
      // }else{
      //   result__.push(item)
      // }
      // }
      
      const total = await Project.find(filter).map(dbid2id).toArray();
      let total_:any[] = []
      for (let item of total) {
        if(contractState){
          const projAggrement = await ProjectAgreement.find({
            _id: item.id,
          }).toArray();
          // console.dir(projAggrement,{depth:null,color:true})
          // console.log('=====')
            if(contractState == '0' ){//未签署
              if(projAggrement.length == 0){
                total_.push(item)
              }
            }else if(contractState == '1' ){//已签署
              if(projAggrement.length > 0){
                total_.push(item)
              }
            }
        }else{
          total_.push(item)
        }
      }
      // console.dir(result__,{depth:null,color:true})
      return {
        result:(contractState && proAgreeProIds.length == 0) || (conName && proIds.length == 0) ? [] : result,
        page,
        total:total_.length,
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
      .sort({ createDate: -1, _id: 1  })
        .skip(skip)
        .limit(pageSize)
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
        if(confirmYear == 'NDDD'){
          filter["confirmYear"] = { '$in': [confirmYear, null] };
        }else{
          filter["confirmYear"] = confirmYear;
        }
        
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
     
      const result = await Project.find(filter)
        .sort({ createDate: -1, _id: 1  })
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
        .sort({ createDate: -1, _id: 1  })
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
        .sort({ createDate: -1, _id: 1  })
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
      
      // 删除 `oldId` 对应的数据
      if (oldId) {
        await Project.deleteOne({ _id: oldId });
      }
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
        return id || res.upsertedId._id;
      });
    },
    checkProj: async (_: any, args: any, context: AuthContext) => {
     
      let { id, checkState, reason, incomeConfirm,printState } = args;
      return Project.updateOne(
        { _id: id },
        { $set: { proState: checkState, reason, incomeConfirm,printState } },
        { upsert: true }
      )
        .then((res) => id || res.upsertedId._id)
        .catch((e) => {
          
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
    printProject:async (_: any, args: any, context: AuthContext) => {
      // console.log(args,'args MMM')
      // console.log(context,'context NNN')
      return Project.updateOne(
        { _id: args.proj.id },
        { $set: { printName: context.user?.name,printTime:moment().format('YYYY-MM-DD HH:mm:ss'),printState: args.proj.printState} },
        { upsert: true }
      ).then((res) => args.proj.id || res.upsertedId._id);
      return 'sss'
    }
  },
};
