import React from 'react';
import { Statistic, Divider, Table } from 'antd';
import ProCard from '@ant-design/pro-card';
import { Pie } from '@ant-design/charts';
import { EmployeeCost } from '@/apollo';
import * as R from 'ramda';
import moment from 'moment';
import numeral from 'numeral';

interface CostsProps {
  loading: boolean
  title: string | undefined
  costs: EmployeeCost[]
}

const Costs: React.FC<CostsProps> = (props) => {

  const { loading, title, costs } = props;

  const config = React.useMemo(() => {
    const group = R.groupBy(R.pathOr('', ['user', 'name']), costs)
    const data = R.keys(group).map(key => ({
      type: key,
      value: R.sum(group[key].map(v => v.amount))
    }))
    return ({
      appendPadding: 10,
      data,
      angleField: 'value',
      colorField: 'type',
      radius: 0.8,
      label: {
        type: 'outer',
        content: (d: any) => `${d.type} ¥${numeral(d.value).format('0,0.00')}`,
      },
      tooltip: {
        formatter: (d: any) => ({ name: d.type, value: numeral(d.value).format('0,0.00') })
      },
      interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
    })
  }, [costs]);

  const columns = React.useMemo(() => [
    {
      title: '人员',
      dataIndex: ['user', 'name'],
      filters: R.uniq(R.map(cost => ({ text: cost.user.name, value: cost.user.id }), costs)),
      onFilter: (value: string | number | boolean, record: EmployeeCost) => R.equals(value, record.user.id),
    },
    {
      title: '金额(元)',
      dataIndex: 'amount',
      sorter: {
        compare: (a: EmployeeCost, b: EmployeeCost) => R.subtract(a.amount, b.amount),
        multiple: 1,
      },
      render: (text: number) => numeral(text).format('0,0.00')
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      sorter: {
        compare: (a: EmployeeCost, b: EmployeeCost) => R.subtract(moment(a.createDate, 'YYYYMMDD').unix(), moment(b.createDate, 'YYYYMMDD').unix()),
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
  ], [costs]);

  return (
    <>
      <ProCard.Group bordered>
        <ProCard size="small" colSpan={{ sm: 18 }}>
          <Pie {...config} />
        </ProCard>
        <ProCard.Divider />
        <ProCard title={title} colSpan={{ sm: 6 }}>
          <Statistic title="人员个数" value={R.length(R.uniq(costs.map(cost => cost.user.id)))} />
          <Divider />
          <Statistic title="合计金额(元)" value={R.sum(costs.map(cost => cost.amount))} precision={2} prefix="¥" />
        </ProCard>
      </ProCard.Group>
      <Table
        rowKey={record => record.index}
        loading={loading}
        columns={columns}
        dataSource={costs.map((c, index) => ({ ...c, index }))}
        pagination={{ pageSize: 5 }}
      />
    </>
  )
}

export default Costs;
