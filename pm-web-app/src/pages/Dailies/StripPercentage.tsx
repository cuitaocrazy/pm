import React from 'react';
import { geekblue, grey } from '@ant-design/colors';
import { ProjDaily } from '@/apollo';

const colorSet = geekblue;
function StripPercentage(props: { data: ProjDaily[]; gotoAnchor: (id: number) => void }) {
  const total = props.data.reduce((s, e) => s + e.timeConsuming, 0);
  const percentage =
    total === 0
      ? []
      : props.data.map((d) => ({ id: d.projId, percent: (d.timeConsuming / total) * 100 }));

  const list = () =>
    percentage.map((d, i) => (
      /* eslint-disable jsx-a11y/control-has-associated-label */
      /* eslint-disable jsx-a11y/anchor-has-content */
      <a
        key={d.id}
        // href={`#${d.id}`}
        onClick={() => props.gotoAnchor(i)}
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
