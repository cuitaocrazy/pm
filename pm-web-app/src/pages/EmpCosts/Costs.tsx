import React from 'react';
import { Table } from 'antd';
import { ProjectCost } from '@/apollo';
import * as R from 'ramda';
import moment from 'moment';

interface CostsProps {
  loading: boolean
  costs: ProjectCost[]
}

const columns = [
  {
    title: '项目',
    dataIndex: ['project', 'name'],
  },
  {
    title: '金额(元)',
    dataIndex: 'amount',
    sorter: {
      compare: (a: ProjectCost, b: ProjectCost) => R.subtract(a.amount, b.amount),
      multiple: 1,
    },
  },
  {
    title: '创建日期',
    dataIndex: 'createDate',
    sorter: {
      compare: (a: ProjectCost, b: ProjectCost) => R.subtract(moment(a.createDate, 'YYYYMMDD').unix(), moment(b.createDate, 'YYYYMMDD').unix()),
      multiple: 2,
    },
    render: (text: string) => moment(text, 'YYYYMMDD').format('YYYY-MM-DD'),
  },
  {
    title: '类型',
    dataIndex: 'type',
  },
  {
    title: '描述',
    dataIndex: 'description',
  },
];

const Costs: React.FC<CostsProps> = (props) => {

  const { loading, costs } = props;

  return (
    <Table
      rowKey={record => record.index}
      loading={loading}
      columns={columns}
      dataSource={costs.map((c, index) => ({ ...c, index }))}
    />
  )
}

export default Costs;
