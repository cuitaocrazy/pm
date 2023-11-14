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
}

