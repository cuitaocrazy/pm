import React from 'react';
import { Timeline, Card } from 'antd';
import moment, { Moment } from 'moment';
import * as R from 'ramda';
import { Daily, ProjDaily } from '@/apollo';
import { isWorkday } from '@/utils/utils';

interface DailiesProps {
  date: Moment
  dailies: Daily[]
  workCalendar: string[]
}

const getItem = (date: string, projs: ProjDaily[], workCalendar: string[]) => {
  const time = R.reduce((a, b: ProjDaily) => a + b.timeConsuming, 0)(projs)
  if (time && time > 0) {
    return time > 10 ?
      <Timeline.Item key={date} color="purple">
        <h3>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
        {projs.map(proj => (
          <Card size="small" bordered={false} key={proj.project.id}>
            <Card.Meta
              title={`${proj.project.name}(${proj.timeConsuming}h)`}
              description={<div style={{ whiteSpace: "pre-wrap" }}>{proj.content}</div>}
            />
          </Card>
        ))}
      </Timeline.Item> :
      <Timeline.Item key={date} color="green">
        <h3>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
        {projs.map(proj => (
          <Card size="small" bordered={false} key={proj.project.id}>
            <Card.Meta
              title={`${proj.project.name}(${proj.timeConsuming}h)`}
              description={<div style={{ whiteSpace: "pre-wrap" }}>{proj.content}</div>}
            />
          </Card>
        ))}
      </Timeline.Item>
  } else {
    if (moment(date, 'YYYYMMDD').isSameOrBefore(moment(), 'd') && isWorkday(date, workCalendar))
      return (
        <Timeline.Item key={date} color="red">
          <h3>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
        </Timeline.Item>
      )
    else return null
  }
}

const DailiesPage: React.FC<DailiesProps> = (props) => {

  const { date, dailies, workCalendar } = props;

  return R.isEmpty(dailies) ? null : (
    <Timeline style={{ height: 719, overflow: "scroll" }}>
      <br />
      {R.range(0, 7)
        .map(i => moment(date).add(i, 'd').format('YYYYMMDD'))
        .filter(d => moment(d, 'YYYYMMDD').isSameOrBefore(moment(), 'd'))
        .map(d => getItem(d, R.find(R.propEq('date', d), dailies)?.projs || [], workCalendar))
      }
    </Timeline>
  )
}

export default DailiesPage;
