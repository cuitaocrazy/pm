export const projType: [string, string][] = [
  ['preSale', '售前'],
  ['onSale', '售中'],
  ['afterSale', '售后'],
  ['research', '研发'],
  ['comprehensive', '综合'],
];

export const getTypeDisplayName = (stage: string) => {
  const st = projType.find((s) => s[0] === stage);
  return st ? st[1] : stage;
};
