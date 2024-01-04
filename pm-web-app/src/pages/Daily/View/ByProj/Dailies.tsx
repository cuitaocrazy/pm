import React from 'react';
import { Empty, Timeline, Card } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import * as R from 'ramda';
import type { ProjectOfDaily, ProjectOfDailyItem } from '@/apollo';

type DailiesProps = {
  date: Moment;
  dailies: ProjectOfDaily[];
};

const getItem = (date: string, users: ProjectOfDailyItem[]) => {
  if (R.not(R.isEmpty(users))) {
    return (
      <Timeline.Item key={date} color="green">
        <h3>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
        {users.map((ud) => (
          <Card size="small" bordered={false} key={ud.employee.id}>
            <Card.Meta
              title={`${ud.employee.name}(${ud.timeConsuming}h)`}
              description={<div style={{ whiteSpace: 'pre-wrap' }}>{ud.content}</div>}
            />
          </Card>
        ))}
      </Timeline.Item>
    );
  }
  return (
    <Timeline.Item key={date}>
      <h3>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
    </Timeline.Item>
  );
};

const DailiesPage: React.FC<DailiesProps> = (props) => {
  const { date, dailies } = props;

  return R.isEmpty(dailies) ? (
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
  ) : (
    <Timeline style={{ height: 719, overflow: 'scroll' }}>
      <br />
      {R.range(0, 7)
        .map((i) => moment(date).add(i, 'd').format('YYYYMMDD'))
        .map((d) => getItem(d, R.find(R.propEq('date', d), dailies)?.dailyItems || []))}
    </Timeline>
  );
};

export default DailiesPage;
