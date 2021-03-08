import React from 'react';
import ProCard from '@ant-design/pro-card';
import { Column } from '@ant-design/charts';
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
    ];
  }, [year, monthAmounts, monthCosts]);

  const config = {
    data,
    isStack: true,
    xField: 'key',
    yField: 'value',
    seriesField: 'type',
  };

  return (
    <ProCard title={title} style={{ height }} headerBordered>
      {R.and(R.isEmpty(monthAmounts), R.isEmpty(monthCosts)) ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Column {...config} />
      )}
    </ProCard>
  );
};

export default MonthCosts;
