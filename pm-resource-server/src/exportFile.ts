const ExcelJS = require('exceljs');
import moment from 'moment'
import { MarketPlan } from './mongodb'
import { ObjectId } from 'mongodb'

const colum = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const columW = [ 10, 20, 20, 15, 15, 30, 30, 30]
// 设置边框颜色
const border = {
  top: { style: 'thin', color: { argb: 'FF000000' } }, // 绿色边框
  left: { style: 'thin', color: { argb: 'FF000000' } }, // 红色边框
  bottom: { style: 'thin', color: { argb: 'FF000000' } }, // 蓝色边框
  right: { style: 'thin', color: { argb: 'FF000000' } }, // 青色边框
};
const statusName = {
  'track': '跟踪',
  'stop': '终止',
  'transfer': '转销售'
};

const colColor = {
  '跟踪': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E2EFDA' }},
  '终止': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FCE4D6' }},
  '转销售': { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2CC' }}
};

export default (app, express) => {
  app.get('/api/export', async (req, res) => {
    const { id, reportName } = req.query
    const marketPlan = await MarketPlan.findOne({ $or: [ { _id: new ObjectId(id) }, { _id: id }] })
    if (marketPlan) {
      const data = marketPlan?.weekPlans.map((w, index) => 
      [index+1, w.marketName, w.projectName, w.projectScale, statusName[w.projectStatus], w.projectPlan, w.weekWork, w.nextWeekPlan]) || []
      // 创建一个新的工作簿
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('周报');
      worksheet.properties.defaultFont = {
        size: 12, // 设置全局字体大小
      };
      // 设置列宽
      worksheet.columns = colum.map((c, i) => {return { key: `col${i+1}`, width: columW[i] } } );
      // 合并单元格
      worksheet.mergeCells('A1:H1');
      worksheet.getCell('A1').value = '工作周报';
      // worksheet.getCell('A1')
      worksheet.getRow(1).height = 20
      // 设置标题行
      worksheet.addRow(['序号', '客户名称', '项目名称', '项目预算', '项目状态', '项目计划', '上周工作内容', '本周工作计划']);
      worksheet.getRow(2).height = 20
      colum.forEach(c => worksheet.getCell(`${c}2`).border = border)
      // 添加数据
      data.map((p, index) => {
        worksheet.addRow(p);
        // 设置样式
        colum.forEach(c => {
          const tmCell = worksheet.getCell(`${c}${index+3}`)
          tmCell.border = border
          tmCell.fill = colColor[p[4]]
          tmCell.font = { size: 9 }
        })
        worksheet.getRow(index+3).height = 40
      })
      const len = data.length
      worksheet.getCell(`A${len+3}`).value = '报告人'
      worksheet.getCell(`B${len+3}`).value = reportName
      worksheet.getCell(`D${len+3}`).value = '开始日期'
      worksheet.getCell(`E${len+3}`).value = moment(marketPlan.week).weekday(1).format('YYYY/MM/DD')
      worksheet.getCell(`D${len+4}`).value = '截止日期'
      worksheet.getCell(`E${len+4}`).value = moment(marketPlan.week).weekday(7).format('YYYY/MM/DD')

      worksheet.mergeCells(`A${len+5}:A${len+7}`);
      worksheet.getCell(`A${len+5}`).value = '项目状态'
      worksheet.getCell(`A${len+5}`).alignment = { vertical: 'middle', horizontal: 'center' };
      let i = 1;
      for (let key in colColor) {
        worksheet.getCell(`B${len+4+i}}`).fill = colColor[key]
        worksheet.getCell(`C${len+4+i}}`).value = key
        i++
      }

      // 设置整个工作表中的单元格内容居中对齐
      worksheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
        });
      });
    
      // 设置响应头，告诉浏览器响应是一个Excel文件
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=' + encodeURIComponent('导出数据.xlsx'));
    
      // 将工作簿数据流写入响应
      workbook.xlsx.write(res).then(() => {
        res.end();
      });
    } else {

    }
  });
  app.post('/api/downLoad', async (req, res) => {
    console.log(req,'req llll')
    // 创建工作簿及工作表
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet1');

  // 设置表头，对应数据对象的键
  worksheet.columns = [
    { header: '序号', key: 'index', width: 10 },
    { header: '项目名称', key: 'name', width: 30 },
    { header: '项目ID', key: 'id_', width: 50 },
    { header: '审核状态', key: 'proState', width: 10 },
    { header: '预算人天', key: 'estimatedWorkload', width: 10 },
    { header: '实际人天', key: 'timeConsuming', width: 10 },
    { header: '阶段状态', key: 'status', width: 10 },
    { header: '项目预算', key: 'projBudget_', width: 10 },
    { header: '项目状态', key: 'projStatus', width: 10 },
    { header: '合同状态', key: 'contractState', width: 10 },
    { header: '验收状态', key: 'acceStatus', width: 10 },
    { header: '确认年度', key: 'confirmYear', width: 10 },
    { header: '合同金额(含税)', key: 'contractAmount', width: 20 },
    { header: '合同金额(不含税)', key: 'afterTaxAmount', width: 20 },
    { header: '确认金额(含税)', key: 'recoAmount_', width: 20 },
    { header: '投产日期', key: 'productDate', width: 10 },
    { header: '合同签订日期', key: 'contractSignDate', width: 10 },
    { header: '项目部门', key: 'group', width: 40 },
    { header: '客户名称', key: 'customer', width: 10 },
    { header: '项目经理', key: 'leader', width: 10 },
    { header: '市场经理', key: 'salesLeader', width: 10 },
  ];

  // 要导出的数据
  // const data = JSON.parse(req.query.datas);

  // 添加数据行
  req.body.datas.forEach(item => {
    worksheet.addRow(item);
  });

  try {
    // 将工作簿内容写入内存中的 Buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // 设置响应头，指定下载文件名和文件类型
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=output.xlsx');

    // 返回 Buffer 数据
    await workbook.xlsx.write(res);
    res.end(); // 明确结束响应
  } catch (err) {
    console.error('生成 Excel 文件时出错：', err);
    res.status(500).send('生成 Excel 文件失败');
  }
  })
}

