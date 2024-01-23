import React, { forwardRef, useState, useImperativeHandle, useEffect } from 'react';
import { Table, DatePicker, Space, Input } from 'antd';
import type { MarketProject, MarketProjectVisit, User } from '@/apollo';
import moment from 'moment';

type ProjVisitProps = {
  proj: MarketProject;
  subordinates: User[]
  // onHoursChange: (hours: number) => void;
  // onContentOfWorkChange: (content: string) => void;
};

type VisitTable = MarketProjectVisit & {
  index: number
  isEdite: Boolean
};

export type ProjVisitHandle = {
  addVisit: () => void;
};
const ProjVisitTable: React.ForwardRefRenderFunction<ProjVisitHandle, ProjVisitProps> = (props, ref) => {
  let data: VisitTable[] = []
  const changeData = () => {
    const proVisit = props.proj.visitRecord || []
    data = [...proVisit].reverse().map((visit, index) => {
      return { ...visit, index, isEdite: false }
    }) || []
  }
  changeData()
  const [tableData, setTableData] = useState(data || '')

  useEffect(() => {
    changeData()
    setTableData(data)
  }, [props.proj]);

  useImperativeHandle(ref, () => ({
    addVisit() {
      
      // let temData = R.clone(tableData);
      // temData.unshift({ index: -1, date: '', content: '', isEdite: false })
      // const data = temData.map((visit, index) => {
      //   return { ...visit, index, isEdite: false }
      // }) || []
      // setTableData(data)
    },
  }));

  // const saveVisit = (index: number) => {
  
  //   // saveProjectVisit(props.proj, tableData)
  // }

  // const editVisit = (index: number) => {
  //   let temData = R.clone(tableData);
  //   temData[index].isEdite = true
  //   setTableData(temData)
  // }

  // const changeDate = (visit: VisitTable, e: any) => {
  //   let temData = R.clone(tableData);
  //   temData[visit.index].date = e
  //   setTableData(temData)
  // }
  // const changeContent = (visit: VisitTable, e: any) => {
  //   let temData = R.clone(tableData);
  //   temData[visit.index].content = e.target.value || ''
  //   setTableData(temData)
  // }
   
  const columns = [
    {
      title: '填写人员',
      dataIndex: 'recorder',
      key: 'recorder',
      width: '10%',
      render: (value: string, visit: VisitTable) => {
        return props.subordinates.find((user) => user.id === visit.recorder)?.name;
      },
    },
    {
      title: '拜访时间',
      dataIndex: 'date',
      key: 'date',
      width: '18%',
      render: (value: string, visit: VisitTable) => {
        const dateValue = moment(visit.date).format('YYYY-MM-DD HH:mm:ss')
        return dateValue
        // return <DatePicker
        //           disabled={!visit.isEdite}
        //           value={dateValue}
        //           showTime
        //           format="YYYY-MM-DD HH:mm:ss"
        //           style={{ width: '100%' }}
        //           onChange={(e) => changeDate(visit, e)}
        //         />
      }
    },
  
    {
      title: '拜访内容',
      dataIndex: 'content',
      key: 'content',
      width: '65%',
      render: (value: string, visit: VisitTable) => {
        return value
        // return <Input.TextArea
        //           disabled={!visit.isEdite}
        //           value={visit.content}
        //           rows={2}
        //           placeholder="需包含：地点--人物---事件"
        //           onChange={(e) => changeContent(visit, e)}
        //         />
      }
    },
    // {
    //   title: '操作',
    //   dataIndex: 'index',
    //   key: 'index',
    //   render: (index: number, visit: VisitTable) => (
    //     <Space> 
    //       {visit.isEdite ?
    //         <a key="save" onClick={() => saveVisit(index)}>
    //           保存
    //         </a> :
    //         <a key="edit" onClick={() => editVisit(index)}>
    //           编辑
    //         </a>
    //       }
    //     </Space>
    //   ),
    //   fixed: 'right' as 'right',
    //   with: '5%'
    // },
  ];

  return (
    <Table
      rowKey={(record) => record.date}
      columns={columns}
      dataSource={ tableData }
      pagination={false}
      size="small"
    />
  );
};

export default forwardRef(ProjVisitTable);
