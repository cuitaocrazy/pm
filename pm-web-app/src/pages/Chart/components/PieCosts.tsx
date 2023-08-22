import React from 'react';
import ProCard from '@ant-design/pro-card';
import Pie from '@ant-design/charts/es/pie';
import { Empty } from 'antd';
import * as R from 'ramda';

type ChartKeyValue = {
  key: string;
  value: number;
};

type PieCostsProps = {
  year: number;
  data: ChartKeyValue[];
  title?: string;
  height?: number;
};

const PieCosts: React.FC<PieCostsProps> = (props) => {
  const { data, title, height = 400 } = props;

  const config = React.useMemo(
    () => ({
      appendPadding: 10,
      data,
      angleField: 'value',
      colorField: 'key',
      radius: 0.8,
      label: {
        type: 'spider',
        labelHeight: 28,
        content: '{name}\n{percentage}',
      },
      interactions: [{ type: 'element-selected' }, { type: 'element-active' }],
    }),
    [data],
  );

  return (
    <ProCard title={title} style={{ height }} headerBordered>
      {R.isEmpty(data) ? <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /> : <Pie {...config} />}
    </ProCard>
  );
};

export default PieCosts;
