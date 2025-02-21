const ExcelJS = require('exceljs');
import moment from 'moment'
import { MarketPlan,ProjectAgreement,Agreement,Customer,Project,Statu,YearManage,Industry,Region,RegionOne } from './mongodb'
import { ObjectId } from 'mongodb'
import { dbid2id, id2dbid, getMaxGroup } from "./util/utils";
import {
  AuthContext,
  getAllGroups,
  getGroupUsers,
  getUsersByGroups,
} from "./auth/oauth";

const colum = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const columW = [ 10, 20, 20, 15, 15, 30, 30, 30]
// 设置边框颜色
const border = {
  top: { style: 'thin', color: { argb: 'FF000000' } }, // 绿色边框
  left: { style: 'thin', color: { argb: 'FF000000' } }, // 红色边框
  bottom: { style: 'thin', color: { argb: 'FF000000' } }, // 蓝色边框
  right: { style: 'thin', color: { argb: 'FF000000' } }, // 青色边框
};
const statusName = {
  'track': '跟踪',
  'stop': '终止',
  'transfer': '转销售'
};

const colColor = {
  '跟踪': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' }},
  '终止': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE4D6' }},
  '转销售': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' }}
};
const superProjs = async(archive,params,me)=>{
  console.log(archive,'archive ???')
  let filter = {};
  if (archive == '1' || archive === '0') {
    filter["isArchive"] = archive === '1' ? true : false;
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
    leaders,
    contractState,
    incomeConfirm,
  } = params;
  // if (!page || page === 0) {
  //   page = 1;
  // }
  // if (!pageSize || pageSize === 0) {
  //   pageSize = 10;
  // }
  // const skip = (page - 1) * pageSize;
  const user = me;

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
  if (confirmYear) {
    if(confirmYear == 'NDDD'){
      filter["confirmYear"] = { '$in': [confirmYear, null] };
    }else{
      filter["confirmYear"] = confirmYear;
    }
    
  }
  for (let i = 0; i < regions.length; i++) {
    for (let j = 0; j < industries.length; j++) {
      for (let k = 0; k < projTypes.length; k++) {
        const regexStr = `^${industries[j]}-${regions[i]}-${projTypes[k]}-.*`;
        regexArray.push(new RegExp(regexStr));
      }
    }
  }
  
  const maxGroup = getMaxGroup(user.groups);
  let subordinateIds: string[] = [];
  
  // 一级部门和二级部门可以看到同级全部，但3级部门职能看到自己领导的
  if (maxGroup[0].split("/").length < 4) {
    const subordinate = await getUsersByGroups(user, maxGroup);
    subordinateIds = subordinate.map((subordinate) => subordinate.id);
  }

  
  if (filter["$or"]) {
    filter["$and"] = [
      {
        $or: filter["$or"].concat([
          { participants: { $elemMatch: { $eq: user!.id } } },
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
          { participants: { $elemMatch: { $eq: user!.id } } },
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

  
  const proagree_ = await ProjectAgreement.find({}).toArray();
  let proAgreeProIds = proagree_.map(agreement => agreement._id)
 
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

  return result;

}
const iLeadProjs = async (archive,params,me)=>{
  const user = me;
  const maxGroup = getMaxGroup(user.groups);
  let subordinateIds: string[] = [];
  // 一级部门和二级部门可以看到同级全部，但3级部门职能看到自己领导的
  if (maxGroup[0].split("/").length < 4) {
    const subordinate = await getUsersByGroups(user, maxGroup);
    subordinateIds = subordinate.map((subordinate) => subordinate.id);
  }
  const filter = {
    isArchive: archive ? (archive === '1' ? true : false) : false,
    $or: [
      { leader: me!.id },
      { salesLeader: me!.id },
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
  }

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
  } = params
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
        
  (filter['$and'] as any).push({
    _id: { $in: regexArray, $not: /-ZH-/ }
  });
  const proagree_ = await ProjectAgreement.find({}).toArray();
  let proAgreeProIds = proagree_.map(agreement => agreement._id)
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
  const result = await Project.find(filter)
  .sort({ createDate: -1,_id: 1 })
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
      if(regionOneTemp) oneResult.regionOneName = regionOneTemp.name
      if (customer) oneResult.customerObj = dbid2id(customer);
    }),
  )
  console.log(result,'result===')
  console.log(filter,'filter===')
  console.log(contractState,'contractState===')
  console.log(proAgreeProIds.length == 0,'proAgreeProIds.length == 0===')
  console.log(conName,'conName===')
  console.log(proIds.length == 0,'proIds.length == 0===')
  console.log((contractState && proAgreeProIds.length == 0) || (conName && proIds.length == 0),'(contractState && proAgreeProIds.length == 0) || (conName && proIds.length == 0)===')
  return (contractState && proAgreeProIds.length == 0) || (conName && proIds.length == 0) ? [] : result
        
}

const datasFormat = async (projs,me)=>{
  const status:any[] = await Statu.find().sort({ sort: 1 }).map(dbid2id).toArray();
  const projectAgreements:any[] = await ProjectAgreement.find({}).map(dbid2id).toArray();
  const agreements:any[] = await Agreement.find().sort({ sort: 1 }).map(dbid2id).toArray();
  const yearManages:any[] = await YearManage.find({ isDel: false }).sort({ sort: 1 }).map(dbid2id).toArray();
  const confirmYearOptions = yearManages.filter((item) => item.enable == true);
  const subordinates = await getGroupUsers(me)
  const industries = await Industry.find({ isDel: false }).sort({ sort: 1 }).map(dbid2id).toArray();
  const regions = await Region.find({ isDel: false }).sort({ sort: 1 }).map(dbid2id).toArray();
  const projStatus: [string, string][] = [
    ['onProj', '启动'],
    ['endProj', '关闭'],
  ];
  let orgCodeAll = {};
  let projTypeAll = {};
  let zoneCodeAll = {};
status.forEach(statu => {
  if (statu.pId === '0') {
    projTypeAll[statu.code] = statu.name
  }
})
industries.forEach(industy => {
  orgCodeAll[industy.code] = industy.name
})
regions.forEach(region => {
  zoneCodeAll[region.code] = region.name
})
const getStatusDisplayName = (stage: string) => {
  const st = projStatus.find((s) => s[0] === stage);
  return st ? st[1] : '未启动';
};
function getCodeName(code: string, codeDic, errMsgFn: () => string) {
  const name = codeDic[code];

  if (name === undefined) {
    // eslint-disable-next-line no-console
    console.warn(errMsgFn());
    return code;
    // throw Error(errMsgFn());
  }

  return name;
}
function getOrgName(org: string) {
  return getCodeName(org, orgCodeAll, () => `没有找到行业代码${org}`);
}

function getZoneName(zone: string) {
  return getCodeName(zone, zoneCodeAll, () => `没有找到区域代码${zone}`);
}

function getProjTypeName(type: string) {

  return getCodeName(type, projTypeAll, () => `没有找到项目类型代码${type}`);
}
const buildProjName = (id: string, name: string)=> {
  const reg = /^(?<org>\w+)-(?<zone>\w+)-(?<type>\w+)-(?<name>\w+)-(?<date>\d+)$/;
  const regExpExec = reg.exec(id);
  if (regExpExec === null) {
    // eslint-disable-next-line no-console
    console.warn(`id: ${id} 格式错误`);
    return name;
  }

  return `${getOrgName(regExpExec.groups!.org!)}-${getZoneName(
    regExpExec.groups!.zone!,
  )}-${getProjTypeName(regExpExec.groups!.type!)}-${name}-${regExpExec.groups!.date!}`;
}
    let projs_ = JSON.parse(JSON.stringify(projs))
    projs_.map(((item,index_)=>{
        // console.log(item,'item ====')
        item.index = index_+1
        let id = JSON.parse(JSON.stringify(item.id))
        let name = JSON.parse(JSON.stringify(item.name))
        item.id_ = buildProjName(id, name)
        item.proState = item.proState == 0
        ? '待审核'
        : item.proState == 1 || !item.proState
        ? '审核通过'
        : item.proState == 2
        ? '审核不通过'
        : '---';
        item.estimatedWorkload = item.estimatedWorkload ? item.estimatedWorkload  : 0;
        item.timeConsuming = item.timeConsuming ? ((item.timeConsuming - 0) / 8).toFixed(2) : 0
        item.status = getStatusDisplayName(item.status)
        item.projBudget_ = item.projBudget ? new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((Number(item.projBudget))) : 0.0;
        item.projStatus = status?.find((statu) => statu.id === item.projStatus)?.name;
        let agreementId = projectAgreements.filter(item_=>{return item_.id==item.id}) || []//console.log(item_.id,'??',item);
        // console.log(agreementId,'agreementId MMM')
        let contract: string | any[] = []
        if(agreementId.length > 0){
          contract = agreements.filter(item_=>item_.id == agreementId[0].agreementId) || []
        }
        // console.log(contract,'contract MMM')
        if(contract.length > 0){
          item.contractState =  '已签署'
        }else{
          item.contractState =  '未签署'
        }
        item.acceStatus = status?.find((statu) => statu.id === item.acceStatus)?.name;
        item.confirmYear = confirmYearOptions.filter(item_=>item_.code==item.confirmYear).length?confirmYearOptions.filter(item_=>item_.code==item.confirmYear)[0].name:'---';
        if (projectAgreements && agreements && agreements.length != 0) {
          let contract = projectAgreements?.filter((item_) => item_.id == item.id);
          let amount = agreements?.filter((item_) => item_.id == contract[0]?.agreementId);
          if(amount[0]?.contractAmount){
              item.contractAmount = new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((Number(amount[0]?.contractAmount)));
          }else{
            item.contractAmount = new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((0.00));
          }
        } else {
          item.contractAmount = '---';
        }
        if (projectAgreements && agreements && agreements.length != 0) {
          let contract = projectAgreements?.filter((item_) => item_.id == item.id);
          let amount = agreements?.filter((item_) => item_.id == contract[0]?.agreementId);
          if(amount[0]?.afterTaxAmount){
            item.afterTaxAmount =  new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((amount[0]?.afterTaxAmount));
          }else{
            item.afterTaxAmount =  new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((0.00));
          }

        } else {
          item.afterTaxAmount =  '---';
        }
        item.recoAmount_ = new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((item.recoAmount?item.recoAmount: 0.0));
        item.productDate = item.productDate ? moment(item.productDate).format('YYYY-MM-DD') : '---';
        if (projectAgreements && agreements && agreements.length != 0) {
          let contract = projectAgreements.filter((item_) => item_.id == item.id);
          let amount = agreements?.filter((item_) => item_.id == contract[0]?.agreementId);
          if(amount.length > 0){
            item.contractSignDate =  moment(amount[0]?.contractSignDate).format('YYYY-MM-DD');
          }else{
            item.contractSignDate =  '---'
          }

        } else {
          item.contractSignDate =  '---';
        } 
        item.customer = item.customerObj ? item.customerObj.name : '';
        item.leader = subordinates.find((user: { id: string }) => user.id === item.leader)?.name;
        item.salesLeader = subordinates.find((user: { id: string }) => user.id === item.salesLeader)?.name;
        item.printState_ = item.printState == '0' ? '否' : item.printState == '1' ? '是' : '---'
    }))
    let totalNumber1 = projs_.reduce((sum, item_) => {
      if (projectAgreements && agreements && agreements.length != 0) {
        let contract = projectAgreements?.filter((item) => item.id == item_.id);
        let amount = agreements?.filter((item) => item.id == contract[0]?.agreementId);
        if(amount[0]?.contractAmount){
            return sum + Number(amount[0]?.contractAmount);
        }else{
          return sum + 0;
        }
      }
    },0);
    let totalNumber2 = projs_.reduce((sum, item_) => {
      if (projectAgreements && agreements && agreements.length != 0) {
        let contract = projectAgreements?.filter((item) => item.id == item_.id);
        let amount = agreements?.filter((item) => item.id == contract[0]?.agreementId);
        if(amount[0]?.afterTaxAmount){
          return sum + Number(amount[0]?.afterTaxAmount);
        }else{
          return sum + 0
        }

      }
    },0)
    let totalNumber3 = projs_.reduce((sum, item_) => {
      return item_.recoAmount?sum + item_.recoAmount: sum + 0.0
    },0)
    let projBudget1 = projs_.reduce((sum, item_) => {
      return sum + item_.projBudget
    },0)
    // console.log(totalNumber3,'totalNumber3 MMM')
    projs_.push({
      index:'合计',
      contractAmount:new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalNumber1),
      afterTaxAmount:new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalNumber2),
      recoAmount_:new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalNumber3),
      projBudget_:new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(projBudget1)
    })
  return projs_
}
export default (app, express) => {
  app.get('/api/export', async (req, res) => {
    const { id, reportName } = req.query
    const marketPlan = await MarketPlan.findOne({ $or: [ { _id: new ObjectId(id) }, { _id: id }] })
    if (marketPlan) {
      const data = marketPlan?.weekPlans.map((w, index) => 
      [index+1, w.marketName, w.projectName, w.projectScale, statusName[w.projectStatus], w.projectPlan, w.weekWork, w.nextWeekPlan]) || []
      // 创建一个新的工作簿
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('周报');
      worksheet.properties.defaultFont = {
        size: 12, // 设置全局字体大小
      };
      // 设置列宽
      worksheet.columns = colum.map((c, i) => {return { key: `col${i+1}`, width: columW[i] } } );
      // 合并单元格
      worksheet.mergeCells('A1:H1');
      worksheet.getCell('A1').value = '工作周报';
      // worksheet.getCell('A1')
      worksheet.getRow(1).height = 20
      // 设置标题行
      worksheet.addRow(['序号', '客户名称', '项目名称', '项目预算', '项目状态', '项目计划', '上周工作内容', '本周工作计划']);
      worksheet.getRow(2).height = 20
      colum.forEach(c => worksheet.getCell(`${c}2`).border = border)
      // 添加数据
      data.map((p, index) => {
        worksheet.addRow(p);
        // 设置样式
        colum.forEach(c => {
          const tmCell = worksheet.getCell(`${c}${index+3}`)
          tmCell.border = border
          tmCell.fill = colColor[p[4]]
          tmCell.font = { size: 9 }
        })
        worksheet.getRow(index+3).height = 40
      })
      const len = data.length
      worksheet.getCell(`A${len+3}`).value = '报告人'
      worksheet.getCell(`B${len+3}`).value = reportName
      worksheet.getCell(`D${len+3}`).value = '开始日期'
      worksheet.getCell(`E${len+3}`).value = moment(marketPlan.week).weekday(1).format('YYYY/MM/DD')
      worksheet.getCell(`D${len+4}`).value = '截止日期'
      worksheet.getCell(`E${len+4}`).value = moment(marketPlan.week).weekday(7).format('YYYY/MM/DD')

      worksheet.mergeCells(`A${len+5}:A${len+7}`);
      worksheet.getCell(`A${len+5}`).value = '项目状态'
      worksheet.getCell(`A${len+5}`).alignment = { vertical: 'middle', horizontal: 'center' };
      let i = 1;
      for (let key in colColor) {
        worksheet.getCell(`B${len+4+i}}`).fill = colColor[key]
        worksheet.getCell(`C${len+4+i}}`).value = key
        i++
      }

      // 设置整个工作表中的单元格内容居中对齐
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      });
    
      // 设置响应头，告诉浏览器响应是一个Excel文件
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent('导出数据.xlsx'));
    
      // 将工作簿数据流写入响应
      workbook.xlsx.write(res).then(() => {
        res.end();
      });
    } else {

    }
  });
  app.post('/api/downLoad', async (req, res) => {
    // console.log(req.body,'req llll')
    //isAdmin:true为全部项目页面，false为项目维护页面
    //archive:0为项目，1为归档项目，2为待办项目
    /**
     * 先看基础的filter有哪些，加上搜索条件，把符合的数据倒序拿出来，再进行加工
     */
    let datas:any[] = []
    let {isAdmin,archive,params,me} = req.body
    if(isAdmin){
      //走super
      let projs = await superProjs(archive,params,me)
      //组装数据
      datas = await datasFormat(projs,me)
      console.log(datas,'datas///')
    }else{
      //走iLead
      let projs = await iLeadProjs(archive,params,me)
      datas = await datasFormat(projs,me)
      console.log(datas,'datas///')
    }
    // 创建工作簿及工作表
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');
  // 设置表头，对应数据对象的键
  let columns = [
    { header: '序号', key: 'index', width: 10 },
    { header: '项目名称', key: 'name', width: 30 },
    { header: '项目ID', key: 'id', width: 50 },
    { header: '项目全称', key: 'id_', width: 50 },
    { header: '审核状态', key: 'proState', width: 10 },
    { header: '预算人天', key: 'estimatedWorkload', width: 10 },
    { header: '实际人天', key: 'timeConsuming', width: 10 },
    { header: '阶段状态', key: 'status', width: 10 },
    { header: '项目预算', key: 'projBudget_', width: 10 },
    { header: '项目状态', key: 'projStatus', width: 10 },
    { header: '合同状态', key: 'contractState', width: 10 },
    { header: '验收状态', key: 'acceStatus', width: 10 },
    { header: '确认年度', key: 'confirmYear', width: 10 },
    { header: '合同金额(含税)', key: 'contractAmount', width: 20 },
    { header: '合同金额(不含税)', key: 'afterTaxAmount', width: 20 },
    { header: '确认金额(含税)', key: 'recoAmount_', width: 20 },
    { header: '投产日期', key: 'productDate', width: 10 },
    { header: '合同签订日期', key: 'contractSignDate', width: 10 },
    { header: '项目部门', key: 'group', width: 40 },
    { header: '客户名称', key: 'customer', width: 10 },
    { header: '项目经理', key: 'leader', width: 10 },
    { header: '市场经理', key: 'salesLeader', width: 10 },
  ];
  if(me.access.includes('realm:print')){
    columns.splice(2, 0, { header: '是否打印', key: 'printState_', width: 10 })
  }
  worksheet.columns = columns

  // 要导出的数据
  // const data = JSON.parse(req.query.datas);

  // 添加数据行
  datas.forEach(item => {
    worksheet.addRow(item);
  });

  try {
    // 将工作簿内容写入内存中的 Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 设置响应头，指定下载文件名和文件类型
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=output.xlsx');

    // 返回 Buffer 数据
    await workbook.xlsx.write(res);
    res.end(); // 明确结束响应
  } catch (err) {
    console.error('生成 Excel 文件时出错：', err);
    res.status(500).send('生成 Excel 文件失败');
  }
  })
}

