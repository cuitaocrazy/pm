import type { ProjDaily } from '@/apollo';
import { Pie } from '@ant-design/charts';
import { Card } from 'antd';
import React from 'react';

type ProjPieProps = {
  data: ProjDaily[];
};

export default (props: ProjPieProps) => {
  const data = props.data
    .filter((p) => p.timeConsuming !== 0)
    .map((p) => ({ type: p.project.name || p.project.id, value: p.timeConsuming }));

  const config = {
    appendPadding: 10,
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'pie-legend-active' }, { type: 'element-active' }],
  };

  return (
    <Card>
      <Pie {...config} />
    </Card>
  );
};
