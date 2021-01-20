import React from 'react';
import { Table, Badge, Button } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import * as R from 'ramda';
import moment, { Moment } from 'moment';

interface DayTableProps {
  height: number
  days: string[]
  months: string[]
  setDate: (date: Moment) => void
  handleRemove: (date: string) => void
}

const daysToDate = (days: string[]) => R.map(date => ({
  date,
  type: R.includes(moment(date, 'YYYYMMDD').weekday(), [moment().day("星期六").weekday(), moment().day("星期日").weekday()]) ? 'w' : 'h',
}), days)

const DayTable: React.FC<DayTableProps> = (props) => {

  const { height, days, months, setDate, handleRemove } = props;

  const columns = [
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => moment(text, 'YYYYMMDD').format('YYYY-MM-DD'),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (text: string) => R.equals(text, 'w') ?
        <Badge count="班" /> :
        <Badge count="休" style={{ backgroundColor: '#52c41a' }} />,
    },
    {
      title: '操作',
      dataIndex: 'date',
      key: 'x',
      render: (text: string) => R.includes(moment(text, 'YYYYMMDD').format('YYYYMM'), months) ?
        <></> :
        <Button type="link" icon={<DeleteOutlined />} onClick={() => handleRemove(text)} />,
    }
  ];

  return (
    <div style={{ height, overflow: "scroll" }}>
      <Table
        pagination={false}
        rowKey={record => record.date}
        columns={columns}
        dataSource={daysToDate(days)}
        onRow={record => ({
          onClick: () => setDate(moment(record.date, 'YYYYMMDD'))
        })}
      />
    </div>
  )
}

export default DayTable;
