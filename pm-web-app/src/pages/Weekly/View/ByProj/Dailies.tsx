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

const gridStyle: React.CSSProperties = {
  width: '20%',
  textAlign: 'center',
};

const getItem = (date: string, users: ProjectOfDailyItem[]) => {
  if (R.not(R.isEmpty(users))) {
    let allTime = users.reduce((prev, cur) => prev + cur.timeConsuming, 0)
    return (
      <Timeline.Item key={date} color="green">
        <h3>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}--总工时({allTime}h)</h3>
        <Card className="pm-ant-card" size="small" bordered={false}>
          {users.map((ud) => (
            <Card.Grid key={ud.employee.id} style={gridStyle}>
              <Card.Meta
                title={`${ud.employee.name}(${ud.timeConsuming}h)`}
                description={<div>{ud.content}</div>}
              />
            </Card.Grid>
          ))}
        </Card>
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
