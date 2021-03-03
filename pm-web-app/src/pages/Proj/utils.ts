export const projStatus: [string, string][] = [
  ['endProj', '已结项'],
  ['onProj', '未结项'],
];
export const getStatusDisplayName = (stage: string) => {
  const st = projStatus.find((s) => s[0] === stage);
  return st ? st[1] : stage;
};
