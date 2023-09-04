import axios from 'axios';
import type { ProjectInput} from '@/apollo';
import moment from 'moment';

type Dic = Record<string, string>;

// 行业代码（启动的数据，用于项目下拉选）
// let orgCode: Dic = {};
// 行业代码（所有数据，用于展示名称）
const orgCodeAll: Dic = {};

// 区域代码（启动的数据，用于项目下拉选）
// let zoneCode: Dic = {};
// 区域代码（所有数据，用于展示名称）
const zoneCodeAll: Dic = {}

// 项目类型（启用的数据，用于项目下拉选）
// let projType: Dic = {};
// 项目类型（所有数据，用于展示名称）
const projTypeAll: Dic = {};

function getCodeName(code: string, codeDic: Dic, errMsgFn: () => string) {
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
  const temp = localStorage.getItem('industries')
  const industries = (JSON.parse(temp ? temp : '{}') || [])
  industries.forEach((industy: any) => {
    orgCodeAll[industy.code] = industy.name
  })
  return getCodeName(org, orgCodeAll, () => `没有找到行业代码${org}`);
}

function getZoneName(zone: string) {
  const temp = localStorage.getItem('regions')
  const regions = JSON.parse(temp ? temp : '{}') || []
  regions.forEach((industy: any) => {
    zoneCodeAll[industy.code] = industy.name
  })
  return getCodeName(zone, zoneCodeAll, () => `没有找到区域代码${zone}`);
}

function getProjTypeName(type: string) {
  const temp = localStorage.getItem('status')
  const status = JSON.parse(temp ? temp : '{}') || []
  status.forEach((industy: any) => {
    projTypeAll[industy.code] = industy.name
  })
  return getCodeName(type, projTypeAll, () => `没有找到项目类型代码${type}`);
}

export function buildProjName(id: string, name: string) {
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

// 筛选待办事项
export function filterTodoProject (data: any[]) {
  const reg = /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
  const resDate = data.filter(proj => {
    const result = reg.exec(proj?.id || '');
    if (result?.groups?.projType === 'SZ') {  // 售中
      if (proj.acceptDate) {
        const monthDiff =  moment(proj.acceptDate).diff(new Date(), 'month')
        if (monthDiff <= 2) {
          proj.todoTip = '验收日期不足三个月，请及时签署维护合同'
          return true
        }
      }
    } else if (result?.groups?.projType === 'SH') {  // 售后
      if (proj.startTime && proj.serviceCycle) {
        const monthDiff =  moment(new Date()).diff(proj.startTime, 'month')
        if ((proj.serviceCycle - monthDiff) <= 3) {
          proj.todoTip = '维护服务即将不足三个月，请及时巡检'
          return true
        }
      }
      return false
    }
    return false
  })
  return resDate;
}

// 附件上传
export const attachmentUpload = async (proj: ProjectInput) => {
  console.log(proj.actives)
  for (const [index, act] of (proj.actives || []).entries()) {
    const formData = new FormData();
    // 临时变量
    let fileArr:any = []
    // 拼接附件存储路径
    formData.append('directory',`/${buildProjName(proj.id, proj.name)}/${index}/`);
    act.fileList?.forEach((file: any) => {
      if (file.originFileObj) {
        formData.append('uids[]', file.uid);
        formData.append('files', file.originFileObj);
        fileArr.push(file.originFileObj)
      }
    });
    // 批量上传附件
    if (fileArr.length) {
      const { data } = await axios.post('/api/upload/active', formData)
      if (data.code === 1000) {
        fileArr = data.data
      }
    }
    act.fileList = JSON.parse(JSON.stringify(act?.fileList))
    act?.fileList?.forEach((item: any) => {
      delete item.originFileObj
      delete item.fileRaw
      delete item.lastModified
      delete item.size
      delete item.type
      delete item.response
      delete item.percent
      delete item.raw
      delete item.uploadTime
      // item.status = 'done'
      const sameId = fileArr.find((chItem: any) => chItem.uid === item.uid)
      if (sameId) {
        item.url = sameId.path
      }
    })
  }
  return proj
}

export const projectTypeStr = (proj) => {
  const reg = /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
  const projType = reg.exec(proj?.id || '')?.groups?.projType;
  return projType
}