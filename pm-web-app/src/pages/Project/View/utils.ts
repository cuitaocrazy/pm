export const projStatus: [string, string][] = [
  ['onProj', '启动'],
  ['endProj', '关闭'],
];
export const getStatusDisplayName = (stage: string) => {
  const st = projStatus.find((s) => s[0] === stage);
  return st ? st[1] : '未启动';
};
