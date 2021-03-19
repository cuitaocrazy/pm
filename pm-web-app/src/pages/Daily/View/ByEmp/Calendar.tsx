import React from 'react';
import { Calendar } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import type { Moment } from 'moment';
import moment from 'moment';
import * as R from 'ramda';
import type { EmployeeOfDaily, EmployeeOfDailyItem } from '@/apollo';
import { isWorkday } from '@/utils/utils';

type CalendarProps = {
  date: Moment;
  setDate: (date: Moment) => void;
  dailies: EmployeeOfDaily[];
  workCalendar: string[];
};

const getCalendarCell = (date: Moment, dailies: EmployeeOfDaily[], workCalendar: string[]) => {
  const time = R.pipe(
    R.find((d: EmployeeOfDaily) => d.date === date.format('YYYYMMDD')),
    R.propOr([], 'projs'),
    R.map((proj: EmployeeOfDailyItem) => proj.timeConsuming),
    R.sum,
  )(dailies);
  if (time && time > 0) {
    const color = time > 10 ? 'purple' : 'green';
    return (
      <div style={{ textAlign: 'center' }}>
        <ClockCircleOutlined style={{ color }} />
        <p>{`${time}h`}</p>
      </div>
    );
  }
  if (
    dailies.length > 0 &&
    date.isSameOrBefore(moment(), 'd') &&
    isWorkday(date.format('YYYYMMDD'), workCalendar)
  )
    return (
      <div style={{ textAlign: 'center' }}>
        <ClockCircleOutlined style={{ color: 'red' }} />
      </div>
    );
  return null;
};

const CalendarPage: React.FC<CalendarProps> = (props) => {
  const { date, setDate, dailies, workCalendar } = props;

  return (
    <Calendar
      value={date}
      disabledDate={(d) => d.isAfter(moment(), 'd')}
      onSelect={(d) => setDate(d)}
      dateCellRender={(d) => getCalendarCell(d, dailies, workCalendar)}
      headerRender={() => null}
    />
  );
};

export default CalendarPage;
