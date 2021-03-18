import React from 'react';
import { Timeline, Card } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import * as R from 'ramda';
import type { EmployeeOfDaily, EmployeeOfDailyItem } from '@/apollo';
import { isWorkday } from '@/utils/utils';
import { buildProjName } from '@/pages/utils';

type DailiesProps = {
  date: Moment;
  dailies: EmployeeOfDaily[];
  workCalendar: string[];
};

const getItem = (date: string, projs: EmployeeOfDailyItem[], workCalendar: string[]) => {
  const time = R.reduce((a, b: EmployeeOfDailyItem) => a + b.timeConsuming, 0)(projs);
  if (time && time > 0) {
    return time > 10 ? (
      <Timeline.Item key={date} color="purple">
        <h3>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
        {projs.map((proj) => (
          <Card size="small" bordered={false} key={proj.project.id}>
            <Card.Meta
              title={`${buildProjName(proj.project.id, proj.project.name)}(${proj.timeConsuming}h)`}
              description={<div style={{ whiteSpace: 'pre-wrap' }}>{proj.content}</div>}
            />
          </Card>
        ))}
      </Timeline.Item>
    ) : (
      <Timeline.Item key={date} color="green">
        <h3>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
        {projs.map((proj) => (
          <Card size="small" bordered={false} key={proj.project.id}>
            <Card.Meta
              title={`${buildProjName(proj.project.id, proj.project.name)}(${proj.timeConsuming}h)`}
              description={<div style={{ whiteSpace: 'pre-wrap' }}>{proj.content}</div>}
            />
          </Card>
        ))}
      </Timeline.Item>
    );
  }
  if (moment(date, 'YYYYMMDD').isSameOrBefore(moment(), 'd') && isWorkday(date, workCalendar))
    return (
      <Timeline.Item key={date} color="red">
        <h3>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
      </Timeline.Item>
    );
  return null;
};

const DailiesPage: React.FC<DailiesProps> = (props) => {
  const { date, dailies, workCalendar } = props;

  return R.isEmpty(dailies) ? null : (
    <Timeline style={{ height: 719, overflow: 'scroll' }}>
      <br />
      {R.range(0, 7)
        .map((i) => moment(date).add(i, 'd').format('YYYYMMDD'))
        .filter((d) => moment(d, 'YYYYMMDD').isSameOrBefore(moment(), 'd'))
        .map((d) =>
          getItem(d, R.find(R.propEq('date', d), dailies)?.dailyItems || [], workCalendar),
        )}
    </Timeline>
  );
};

export default DailiesPage;
