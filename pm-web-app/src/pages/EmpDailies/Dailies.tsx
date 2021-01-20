import React from 'react';
import { Timeline, Card } from 'antd';
import moment, { Moment } from 'moment';
import * as R from 'ramda';
import { Daily, ProjDaily } from '@/apollo';

interface DailiesProps {
  date: Moment
  dailies: Daily[]
}

const getItemColor = (date: string, projs: ProjDaily[]) => {
  const time = R.reduce((a, b: ProjDaily) => a + b.timeConsuming, 0)(projs)
  if (time && time > 0) {
    return time > 10 ? 'purple' : 'green'
  } else {
    if (moment(date, 'YYYYMMDD').isSameOrBefore(moment(), 'd') &&
      ![moment().day("星期六").weekday(), moment().day("星期日").weekday()].includes(moment(date, 'YYYYMMDD').weekday()))
      return 'red'
    else return 'green'
  }
}

const DailiesPage: React.FC<DailiesProps> = (props) => {

  const { date, dailies } = props;

  return R.isEmpty(dailies) ? null : (
    <Timeline style={{ height: 719, overflow: "scroll" }}>
      <br />
      {R.range(0, 7)
        .map(i => moment(date).add(i, 'd').format('YYYYMMDD'))
        .map(d => R.pipe(
          R.find(R.propEq('date', d)),
          R.ifElse(
            R.pipe(R.isNil, R.not),
            (daily: Daily) => (
              <Timeline.Item key={daily.date} color={getItemColor(daily.date, daily.projs)}>
                <h3>{moment(daily.date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
                {daily.projs.map(proj => (
                  <Card size="small" bordered={false} key={proj.project.id}>
                    <Card.Meta
                      title={`${proj.project.name}(${proj.timeConsuming}h)`}
                      description={<div style={{ whiteSpace: "pre-wrap" }}>{proj.content}</div>}
                    />
                  </Card>
                ))}
              </Timeline.Item>
            ),
            R.always(
              <Timeline.Item key={d} color={getItemColor(d, [])}>
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
