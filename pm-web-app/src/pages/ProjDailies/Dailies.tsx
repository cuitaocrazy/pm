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

  return R.isEmpty(dailies) ? null : (
    <Timeline style={{ height: 719, overflow: "scroll" }}>
      <br />
      {R.range(0, 7)
        .map(i => moment(date).add(i, 'd').format('YYYYMMDD'))
        .map(d => R.pipe(
          R.find(R.propEq('date', d)),
          R.ifElse(
            R.pipe(R.isNil, R.not),
            (daily: UsersDaily) => (
              <Timeline.Item key={daily.date} color="green">
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
            ),
            R.always(
              <Timeline.Item key={d}>
                <h3>{moment(d, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
              </Timeline.Item>
            ),
          ),
        )(dailies))
      }
    </Timeline>
  )
}

export default DailiesPage;
