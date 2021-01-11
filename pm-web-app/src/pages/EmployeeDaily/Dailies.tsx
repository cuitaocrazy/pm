import React from 'react';
import { Timeline, Card } from 'antd';
import moment, { Moment } from 'moment';
import { Daily, Project } from '@/apollo';

interface DailiesProps {
  date: Moment
  dailies: Daily[]
  projs: Project[]
}

const getProjName = (projId: string, projs: Project[]) => projs.find((p) => p.id === projId)?.name;

const DailiesPage: React.FC<DailiesProps> = (props) => {

  const { date, dailies, projs } = props;

  return (
    <Timeline style={{ height: 719, overflow: "scroll" }}>
      <br />
      {dailies
        .filter(daily => moment(daily.date, 'YYYYMMDD').isSame(date, 'w'))
        .map(daily => (
          <Timeline.Item key={daily.date}>
            <h3>{moment(daily.date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
            {daily.projs.map(proj => (
              <Card size="small" bordered={false} key={proj.projId}>
                <Card.Meta title={`${getProjName(proj.projId, projs)}(${proj.timeConsuming}h)`} description={proj.content} />
              </Card>
            ))}
          </Timeline.Item>
        ))}
    </Timeline>
  )
}

export default DailiesPage;
