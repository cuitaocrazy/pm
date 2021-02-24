const columnNames = [
  '员工号', // 0
  '年月', // 1
  '一级部门', // 2
  '二级部门', // 3
  '部门', // 4
  '姓名', // 5
  '月工资标准', // 6
  '餐补', // 7
  '月度绩效', // 8
  '其他补发合计', // 9
  '过节费', // 10
  '转正试用差额扣款', // 11
  '考勤扣款合计', // 12
  '其他税前代扣', // 13
  '应发工资', // 14
  '个人养老小计', // 15
  '个人失业小计', // 16
  '个人医疗小计', // 17
  '个人公积金小计', // 18
  '公积金税后代扣', // 19
  '子女教育抵扣', // 20
  '继续教育抵扣', // 21
  '大病医疗抵扣', // 22
  '住房贷款抵扣', // 23
  '住房租金抵扣', // 24
  '赡养老人抵扣', // 25
  '累计收入', // 26
  '累计专项扣除', // 27
  '累计减除费用', // 28
  '累计已预扣税额', // 29
  '个人所得税', // 30
  '实发工资', // 31
  '账号', // 32
  '开户银行', // 33
  '笔记本补助', // 34
  '话费', // 35
  '养老公司  扣款(元)16%', // 36
  '失业公司扣款(元)0.8%', // 37
  '工伤公司扣款0.002', // 38
  '生育公司 扣款(元)0.008', // 39
  '医疗公司扣款(元)0.1', // 40
  '公积金公司', // 41
];

const stringColumns = [0, 1, 2, 3, 4, 5, 32, 33];
const negateColumns = [11, 12, 13, 15, 16, 17, 18, 30];

function payrollParse(row: string[]) {
  return row.map((c, i) => {
    if (stringColumns.includes(i)) {
      return c;
    }
    if (c === '') {
      return 0;
    }
    const n = parseFloat(c);
    if (Number.isNaN(n)) {
      throw new Error(`员工: ${row[0]} 的 ${columnNames[i]} 错误`);
    } else if (negateColumns.includes(i)) {
      return -n;
    } else {
      return n;
    }
  });
}

function check(leftIds: number[], rightIds: number[], row: any[]) {
  const ret =
    Math.fround(leftIds.reduce((s, e) => s + row[e], 0) * 100) ===
    Math.fround(rightIds.reduce((s, e) => s + row[e], 0) * 100);
  if (!ret) {
    throw new Error(
      `员工: ${row[0]} 的 ${leftIds.map((id) => columnNames[id]).join(' + ')} 不等于 ${rightIds
        .map((id) => columnNames[id])
        .join(' + ')}`,
    );
  }
}

const addChecks = [
  [[6, 7, 8, 9, 10, 11, 12, 13], [14]],
  [[14, 15, 16, 17, 18, 30], [31]],
];

export function payrollTranform(data: string) {
  const rows = data.split('\n').map((row) => row.split(','));
  rows.shift();
  const payrollData = rows.map(payrollParse);
  payrollData
    .map((cols) => cols[0] as string)
    .reduce((s, e) => {
      if (s[e] === undefined) {
        return { ...s, e: 1 };
      }
      throw new Error(`员工: ${e} 重复`);
    }, {} as any);
  payrollData.forEach((row) => addChecks.forEach((cond) => check(cond[0], cond[1], row)));
  return payrollData;
}
