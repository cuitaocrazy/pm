export const projStage: [string, string][] = [
  ['requirement', '需求'],
  ['dev', '开发'],
  ['test', '测试'],
  ['acceptance', '验收'],
  ['complete', '结项'],
];

export const getStageDisplayName = (stage: string) => {
  const st = projStage.find((s) => s[0] === stage);
  return st ? st[1] : stage;
};
