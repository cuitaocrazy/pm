import React from 'react';
import ProCard from '@ant-design/pro-card';
import Column from '@ant-design/charts/es/Column';
import { Empty } from 'antd';
import * as R from 'ramda';
import moment from 'moment';

type ChartKeyValue = {
  key: string;
  value: number;
};

type MonthCostsProps = {
  year: number;
  monthAmounts: ChartKeyValue[];
  monthCosts: ChartKeyValue[];
  title?: string;
  height?: number;
};

const getValueByKey = (key: string, list: ChartKeyValue[]) => {
  const data = R.find(R.propEq('key', key), list);
  return R.isNil(data) ? undefined : data.value;
};

const MonthCosts: React.FC<MonthCostsProps> = (props) => {
  const { year, monthAmounts, monthCosts, title, height = 400 } = props;

  const data = React.useMemo(() => {
    const months = R.range(0, 12).map((i) => moment().year(year).month(i).format('YYYYMM'));
    return [
      ...months.map((month) => ({
        key: month,
        type: '项目费用',
        value: getValueByKey(month, monthCosts),
      })),
      ...months.map((month) => ({
        key: month,
        type: '人员成本',
        value: getValueByKey(month, monthAmounts),
      })),
      ...months.map((month) => ({
        key: month,
        type: '总成本',
      })),
    ];
  }, [year, monthAmounts, monthCosts]);

  const config = {
    data,
    isStack: true,
    xField: 'key',
    yField: 'value',
    seriesField: 'type',
    legend: {
      items: [
        {
          id: 'legend1',
          name: '项目费用',
          value: '项目费用',
        },
        {
          id: 'legend2',
          name: '人员成本',
          value: '人员成本',
          marker: {
            style: { fill: '#6cdcb3' },
          },
        },
      ],
    },
    tooltip: {
      formatter: (result: any) => {
        const totalvalue =
          (getValueByKey(result.key, monthAmounts) || 0) +
          (getValueByKey(result.key, monthCosts) || 0);
        return {
          name: result.type,
          value: result.value ? `${result.value}元` : `${totalvalue}元`,
        };
      },
    },
  };

  const column = <Column {...config} />;
  return (
    <ProCard title={title} style={{ height }} headerBordered>
      {R.and(R.isEmpty(monthAmounts), R.isEmpty(monthCosts)) ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        column
      )}
    </ProCard>
  );
};

export default MonthCosts;
