type Dic = Record<string, string>;
export const orgCode: Dic = {
  BOC: '中行',
  YADA: '亚大',
  SL: '首旅',
  YADASK: '亚大数科',
};

export const zoneCode: Dic = {
  AH: '安徽',
  BJ: '北京',
  DLC: '大连',
  FJ: '福建',
  GS: '甘肃',
  GD: '广东',
  GX: '广西',
  GZ: '贵州',
  HI: '海南',
  HE: '河北',
  HA: '河南',
  HL: '黑龙江',
  HB: '湖北',
  HN: '湖南',
  JL: '吉林',
  JS: '江苏',
  JX: '江西',
  LN: '辽宁',
  NM: '内蒙',
  NGB: '宁波',
  NX: '宁夏',
  TAO: '青岛',
  QH: '青海',
  SD: '山东',
  SX: '山西',
  SN: '陕西',
  SH: '上海',
  SZX: '深圳',
  SC: '四川',
  SZH: '苏州',
  TJ: '天津',
  XZ: '西藏',
  XJ: '新疆',
  XA: '雄安',
  YN: '云南',
  ZJ: '浙江',
  CQ: '重庆',
  MO: '澳门',
  HK: '香港',
  TW: '台湾',
  SG: '新加坡',
};

export const projType: Dic = {
  SQ: '售前',
  SZ: '售中',
  SH: '售后',
  YF: '研发',
  ZH: '综合',
};

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
  return getCodeName(org, orgCode, () => `没有找到机构代码${org}`);
}

function getZoneName(zone: string) {
  return getCodeName(zone, zoneCode, () => `没有找到区域代码${zone}`);
}

function getProjTypeName(type: string) {
  return getCodeName(type, projType, () => `没有找到项目类型代码${type}`);
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
