import React from 'react';
import { Calendar } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import type { Moment } from 'moment';
import moment from 'moment';
import * as R from 'ramda';
import type { ProjectOfDaily, ProjectOfDailyItem } from '@/apollo';
import { useDailyState } from './hook';

type CalendarProps = {
  date: Moment;
  setDate: (date: Moment) => void;
  dailies: ProjectOfDaily[];
  projId: string;
};
let cache = '';
const getCalendarCell = (date: Moment, dailies: ProjectOfDaily[]) => {
  const time = R.pipe(
    R.find((d: ProjectOfDaily) => d.date === date.format('YYYYMMDD')),
    R.propOr([], 'dailyItems'),
    R.map((d: ProjectOfDailyItem) => d.timeConsuming),
    R.sum,
  )(dailies);
  if (time && time > 0) {
    const color = 'green';
    return (
      <div style={{ textAlign: 'center' }}>
        <ClockCircleOutlined style={{ color }} />
        <p>{`${time}h`}</p>
      </div>
    );
  }
  return null;
};

const CalendarPage: React.FC<CalendarProps> = (props) => {
  const { date, setDate, dailies, projId } = props;
  const { queryDaily } = useDailyState();

  cache = cache !== moment(date).format('YYYYMM') ? moment(date).format('YYYYMM') :cache
  return (
    <Calendar
      value={date}
      disabledDate={(d) => d.isAfter(moment(), 'd')}
      onSelect={(d) => {
        setDate(d);
        cache !== moment(d).format('YYYYMM') && queryDaily(projId, moment(d));

      }}
      dateCellRender={(d) => getCalendarCell(d, dailies)}
      headerRender={() => null}
    />
  );
};

export default CalendarPage;
