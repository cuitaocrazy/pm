import React from 'react';
import { geekblue, grey } from '@ant-design/colors';
import { ProjectReportData } from './def';

const colorSet = geekblue;
function StripPercentage(props: { data: ProjectReportData[]; gotoAnchor: (id: string) => void }) {
  const total = props.data.reduce((s, e) => s + e.hours, 0);
  const percentage =
    total === 0 ? [] : props.data.map((d) => ({ id: d.id, percent: (d.hours / total) * 100 }));

  const list = () =>
    percentage.map((d, i) => (
      /* eslint-disable jsx-a11y/control-has-associated-label */
      /* eslint-disable jsx-a11y/anchor-has-content */
      <a
        key={d.id}
        // href={`#${d.id}`}
        onClick={() => props.gotoAnchor(d.id)}
        style={{
          backgroundColor: colorSet[i % colorSet.length],
          width: `${d.percent}%`,
          height: '100%',
          display: 'inline-block',
        }}
      />
    ));
  return <div style={{ height: 16, backgroundColor: grey[0] }}>{list()}</div>;
}

export default StripPercentage;
