import React from 'react';
import { Timeline, Card } from 'antd';
import moment, { Moment } from 'moment';
import * as R from 'ramda';
import { UsersDaily, User } from '@/apollo';

interface DailiesProps {
  date: Moment
  dailies: UsersDaily[]
  users: User[]
}

const getUserName = (userId: string, users: User[]) => R.pipe(
  R.find(R.propEq('id', userId)),
  R.ifElse(R.isNil, R.always(userId), R.propOr(userId, 'name')),
)(users)

const DailiesPage: React.FC<DailiesProps> = (props) => {

  const { date, dailies, users } = props;

  return (
    <Timeline style={{ height: 719, overflow: "scroll" }}>
      <br />
      {dailies
        .filter(daily => moment(daily.date, 'YYYYMMDD').isSame(date, 'w'))
        .map(daily => (
          <Timeline.Item key={daily.date}>
            <h3>{moment(daily.date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
            {daily.users.map(ud => (
              <Card size="small" bordered={false} key={ud.userId}>
                <Card.Meta
                  title={`${getUserName(ud.userId, users)}(${ud.timeConsuming}h)`}
                  description={<div style={{ whiteSpace: "pre-wrap" }}>{ud.content}</div>}
                />
              </Card>
            ))}
          </Timeline.Item>
        ))}
    </Timeline>
  )
}

export default DailiesPage;
