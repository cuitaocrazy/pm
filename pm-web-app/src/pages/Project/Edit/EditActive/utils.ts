import type { ProjectInput } from '@/apollo';
import axios from 'axios';

export const projStatus: [string, string][] = [
  ['onProj', '启动'],
  ['endProj', '关闭'],
];
export const getStatusDisplayName = (stage: string) => {
  const st = projStatus.find((s) => s[0] === stage);
  return st ? st[1] : '未启动';
};

const flat = (source: any[]) => {
  let res: any = []
  source.forEach(el=>{
      res.push(el)
      el.children && res.push(...flat(el.children))
  })
  return res
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
export const attachmentUpload = async (proj: ProjectInput, buildProjName: any) => {
  for (let [index, act] of (proj.actives || []).entries()) {
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
      let { data } = await axios.post('/api/upload/active', formData)
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
  return proj
}