export const projStatus: [string, string][] = [
  ['track', '跟踪'],
  ['stop', '终止'],
  ['transfer', '转销售'],
];
export const getStatusDisplayName = (stage: string) => {
  const st = projStatus.find((s) => s[0] === stage);
  return st ? st[1] : '无';
};
