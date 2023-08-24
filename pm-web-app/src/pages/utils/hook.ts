import { useModel } from 'umi';
type Dic = Record<string, string>;

// 行业代码（启动的数据，用于项目下拉选）
// let orgCode: Dic = {};
// 行业代码（所有数据，用于展示名称）
let orgCodeAll: Dic = {};

// 区域代码（启动的数据，用于项目下拉选）
// let zoneCode: Dic = {};
// 区域代码（所有数据，用于展示名称）
let zoneCodeAll: Dic = {}

// 项目类型（启用的数据，用于项目下拉选）
// let projType: Dic = {};
// 项目类型（所有数据，用于展示名称）
let projTypeAll: Dic = {};

export let agreementType: Dic = {
  DGHT: '订购类合同',
  XMHT: '项目类合同',
  WHHT: '维护类合同',
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
  return getCodeName(org, orgCodeAll, () => `没有找到行业代码${org}`);
}

function getZoneName(zone: string) {
  return getCodeName(zone, zoneCodeAll, () => `没有找到区域代码${zone}`);
}

function getProjTypeName(type: string) {

  return getCodeName(type, projTypeAll, () => `没有找到项目类型代码${type}`);
}

function buildProjName(id: string, name: string) {
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

// 处理属性数据，用于展示项目子元素
function dataForTree(data: any[], id?: string, parentId?: string, children?: string) {
  const config = {
    id: id || 'id',
    pId: parentId || 'pId',
    children: children || 'children',
  };
  const tempData: any[] = JSON.parse(JSON.stringify(data));
  const resData: any[] = [];
  const idMapping = tempData.reduce((acc, el, i) => {
    acc[el[config.id]] = i;
    return acc;
  }, {});
  tempData.forEach((el) => {
    // 判断根节点
    if (el[config.pId] === '0' || el[config.id] === '' || el[config.id] === undefined) {
      resData.push(el);
      return;
    }
    // 用映射表找到父元素
    const parentEl = tempData[idMapping[el[config.pId]]] || {};
    // 把当前元素添加到父元素的`children`数组中
    if (parentEl[config.id]) {
      parentEl[config.children] = [...(parentEl[config.children] || []), el];
    }
  });
  return resData;
}

export function useBaseState() {
  const { initialState } = useModel('@@initialState');
  const status = initialState?.status || [];
  const industries = initialState?.industries || [];
  const regions = initialState?.regions || [];
  let orgCode = {}
  let zoneCode = {}
  let projType = {}

  status.forEach(statu => {
    if (statu.pId === '0') {
      projTypeAll[statu.code] = statu.name
      if (statu.enable) {
        projType[statu.code] = statu.name
      }
    }
  })
  industries.forEach(industy => {
    orgCodeAll[industy.code] = industy.name
    if (industy.enable) {
      orgCode[industy.code] = industy.name
    }
  })
  regions.forEach(region => {
    zoneCodeAll[region.code] = region.name
    if (region.enable) {
      zoneCode[region.code] = region.name
    }
  })

  return {
    status,
    industries,
    regions,
    orgCode,
    zoneCode,
    projType,
    buildProjName,
    dataForTree
  }
}

