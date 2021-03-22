import React from 'react';
import { Statistic, Divider, Table } from 'antd';
import ProCard from '@ant-design/pro-card';
import Pie from '@ant-design/charts/es/Pie';
import type { Project, EmployeeOfExpensesItem } from '@/apollo';
import * as R from 'ramda';
import moment from 'moment';
import numeral from 'numeral';
import { buildProjName } from '@/pages/utils';

type CostsProps = {
  loading: boolean;
  title: string | undefined;
  costs: EmployeeOfExpensesItem[];
};

const Costs: React.FC<CostsProps> = (props) => {
  const { loading, title, costs } = props;

  const config = React.useMemo(() => {
    const group = R.groupBy(
      R.pathOr('', ['project', 'name']),
      costs.map((c) => ({
        ...c,
        project: {
          ...c.project,
          name: buildProjName(c.project.id, c.project.name),
        },
      })),
    );
    const data = R.keys(group).map((key) => ({
      type: key,
      value: R.sum(group[key].map((v) => v.amount)),
    }));
    return {
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
        formatter: (d: any) => ({ name: d.type, value: numeral(d.value).format('0,0.00') }),
      },
      interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
    };
  }, [costs]);

  const columns = React.useMemo(
    () => [
      {
        title: '项目',
        dataIndex: 'project',
        filters: R.uniq(
          R.map((cost) => ({ text: cost.project.name, value: cost.project.id }), costs),
        ),
        onFilter: (value: string | number | boolean, record: EmployeeOfExpensesItem) =>
          R.equals(value, record.project.id),
        render: (pro: Project) => buildProjName(pro.id, pro.name),
      },
      {
        title: '金额(元)',
        dataIndex: 'amount',
        sorter: {
          compare: (a: EmployeeOfExpensesItem, b: EmployeeOfExpensesItem) =>
            R.subtract(a.amount, b.amount),
          multiple: 1,
        },
        render: (text: number) => numeral(text).format('0,0.00'),
      },
      {
        title: '创建日期',
        dataIndex: 'createDate',
        sorter: {
          compare: (a: EmployeeOfExpensesItem, b: EmployeeOfExpensesItem) =>
            R.subtract(
              moment(a.createDate, 'YYYYMMDD').unix(),
              moment(b.createDate, 'YYYYMMDD').unix(),
            ),
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
    ],
    [costs],
  );

  return (
    <>
      <ProCard.Group bordered>
        <ProCard size="small" colSpan={{ sm: 18 }}>
          <Pie {...config} />
        </ProCard>
        <ProCard.Divider />
        <ProCard title={title} colSpan={{ sm: 6 }}>
          <Statistic
            title="项目个数"
            value={R.length(R.uniq(costs.map((cost) => cost.project.id)))}
          />
          <Divider />
          <Statistic
            title="合计金额(元)"
            value={R.sum(costs.map((cost) => cost.amount))}
            precision={2}
            prefix="¥"
          />
        </ProCard>
      </ProCard.Group>
      <Table
        rowKey={(record) => record.index}
        loading={loading}
        columns={columns}
        dataSource={costs.map((c, index) => ({ ...c, index }))}
        pagination={false}
      />
    </>
  );
};

export default Costs;
