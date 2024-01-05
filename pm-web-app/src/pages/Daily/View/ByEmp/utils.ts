import * as R from 'ramda';

export const projStatus: [string, string][] = [
  ['onProj', '启动'],
  ['endProj', '关闭'],
];
export const getStatusDisplayName = (stage: string) => {
  const st = projStatus.find((s) => s[0] === stage);
  return st ? st[1] : '未启动';
};

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