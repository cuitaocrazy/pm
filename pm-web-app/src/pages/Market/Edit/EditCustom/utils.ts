import type { MarketInput } from '@/apollo';
import axios from 'axios';
import * as R from 'ramda';
import moment from 'moment';


export const projStatus: [string, string][] = [
  ['track', '跟踪'],
  ['stop', '终止'],
  ['transfer', '转销售'],
];
export const getStatusDisplayName = (stage: string) => {
  const st = projStatus.find((s) => s[0] === stage);
  return st ? st[1] : '无';
};

const flat = (source: any[]) => {
  let res: any = []
  source.forEach(el=>{
      res.push(el)
      el.children && res.push(...flat(el.children))
  })
  return res
}

// 数据转为名称分组形式
export const projectClassify = (data: any[]) => {
  let tempProj = {}
  data.forEach(item => {
    if (tempProj[item.name]) {
      tempProj[item.name].push(item)
    } else {
      tempProj[item.name] = [item]
    }
  });
  let classProjs: any = []
  R.mapObjIndexed((value: any, key: string) => {
    classProjs.push({
      name: key,
      projects: value
    })
  }, tempProj || {});
  let result: any = []
  classProjs.forEach((item: any) => {
    item.projects.forEach((chItem: any, index: number) => {
      result.push({
        ...chItem,
        props: {
          allIndex: item.projects.length,
          index: index
        }
      })
    })
  });
  return result;
}

// 数据转树型并且扁平化
export const convert = (data: any[]) => {
  let result:any[] = [];
  let map = {};
  data.forEach(item => {
      map[item.id] = item;
  });
  data.forEach(item => {
      // item.pid 为null时 返回underfined
      let parent = map[item.pId];
      if (parent) {
        (parent.children || (parent.children = [])).push(item);
      } else {
          // 这里push的item是pid为null的数据
          result.push(item);
      }
  });
  result = flat(result).map((el: any) => {
    el.hasChildren = el.children ? true : false
    delete el.children
    return el
  })
  return result;
}

// 附件上传
export const  attachmentUpload = async (market: MarketInput) => {
  for (let [index, act] of (market.projects || []).entries()) {
    const formData = new FormData();
    // 临时变量
    let fileArr:any = []
    // 拼接附件存储路径
    formData.append('directory',`/${ market.name}/${act.name}/`);
    act.fileList?.forEach((file: any) => {
      if (file.originFileObj) {
        formData.append('uids[]', file.uid);
        formData.append('files', file.originFileObj);
        fileArr.push(file.originFileObj)
      }
    });
    // 批量上传附件
    if (fileArr.length) {
      let { data } = await axios.post('/api/upload/market', formData)
      if (data.code === 1000) {
        fileArr = data.data
      }
    }
    act?.fileList?.forEach((item: any) => {
      delete item.originFileObj
      let sameId = fileArr.find((chItem: any) => chItem.uid === item.uid)
      if (sameId) {
        item.url = sameId.path
      }
    })
  }
  return market
}

// 筛选待办事项
export const filterTodoProject = (data: any[]) => {
  const reg = /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
  const resDate = data.filter(proj => {
    const result = reg.exec(proj?.id || '');
    if (result?.groups?.projType === 'SZ') {  // 售中
      if (proj.acceptDate) {
        let monthDiff =  moment(proj.acceptDate).diff(new Date(), 'month')
        if (monthDiff <= 2) {
          proj.todoTip = '验收日期不足三个月，请及时签署维护合同'
          return true
        }
      }
    } else if (result?.groups?.projType === 'SH') {  // 售后
      if (proj.startTime && proj.serviceCycle) {
        let monthDiff =  moment(new Date()).diff(proj.startTime, 'month')
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

// 统计日报数据
export const formatDailiesDate = (data: any[]) => {
  return data.map(item => {
    const timeArr = R.map(da => {
      const tempArr = R.map(it => it.timeConsuming, da.dailyItems) || []
      return R.reduce(R.add, 0, tempArr)
    }, item.dailies) || []
    const employeeIds = R.map(da => R.map(it => it.employee.id, da.dailyItems) || [], item.dailies) || []
   item.employeeIds =R.reduce(R.unionWith(R.equals), [], employeeIds)
   item.allTime = R.reduce(R.add, 0, timeArr)
   return item
  })
}
