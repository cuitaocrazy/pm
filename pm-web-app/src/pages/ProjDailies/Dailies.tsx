import React from 'react';
import { Timeline, Card } from 'antd';
import moment, { Moment } from 'moment';
import * as R from 'ramda';
import { UsersDaily, UserDaily } from '@/apollo';

interface DailiesProps {
  date: Moment
  dailies: UsersDaily[]
}

const getItem = (date: string, users: UserDaily[]) => {
  if (R.not(R.isEmpty(users))) {
    return (
      <Timeline.Item key={date} color="green">
        <h3>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
        {users.map(ud => (
          <Card size="small" bordered={false} key={ud.user.id}>
            <Card.Meta
              title={`${ud.user.name}(${ud.timeConsuming}h)`}
              description={<div style={{ whiteSpace: "pre-wrap" }}>{ud.content}</div>}
            />
          </Card>
        ))}
      </Timeline.Item>
    )
  } else {
    return (
      <Timeline.Item key={date}>
        <h3>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
      </Timeline.Item>
    )
  }
}

const DailiesPage: React.FC<DailiesProps> = (props) => {

  const { date, dailies } = props;

  return R.isEmpty(dailies) ? null : (
    <Timeline style={{ height: 719, overflow: "scroll" }}>
      <br />
      {R.range(0, 7)
        .map(i => moment(date).add(i, 'd').format('YYYYMMDD'))
        .map(d => getItem(d, R.find(R.propEq('date', d), dailies)?.users || []))
      }
    </Timeline>
  )
}

export default DailiesPage;
