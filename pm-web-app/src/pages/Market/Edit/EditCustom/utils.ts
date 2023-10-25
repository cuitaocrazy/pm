import type { MarketInput } from '@/apollo';
import axios from 'axios';

export const projStatus: [string, string][] = [
  ['track', '跟踪'],
  ['stop', '终止'],
  ['transfer', '转销售'],
];
export const getStatusDisplayName = (stage: string) => {
  const st = projStatus.find((s) => s[0] === stage);
  return st ? st[1] : '无';
};

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
