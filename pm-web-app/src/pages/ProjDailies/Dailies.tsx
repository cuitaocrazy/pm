import React from 'react';
import { Timeline, Card } from 'antd';
import moment, { Moment } from 'moment';
import { UsersDaily, User } from '@/apollo';

interface DailiesProps {
  date: Moment
  dailies: UsersDaily[]
  users: User[]
}

const getUserName = (userId: string, users: User[]) => users.find(u => u.id === userId)?.name;

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
