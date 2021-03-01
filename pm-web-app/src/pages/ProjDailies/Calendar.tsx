import React from 'react';
import { Calendar } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import type { Moment } from 'moment';
import moment from 'moment';
import * as R from 'ramda';
import type { UsersDaily, UserDaily } from '@/apollo';

type CalendarProps = {
  date: Moment;
  setDate: (date: Moment) => void;
  dailies: UsersDaily[];
};

const getCalendarCell = (date: Moment, dailies: UsersDaily[]) => {
  const time = R.pipe(
    R.find((d: UsersDaily) => d.date === date.format('YYYYMMDD')),
    R.propOr([], 'users'),
    R.map((d: UserDaily) => d.timeConsuming),
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
  const { date, setDate, dailies } = props;

  return (
    <Calendar
      value={date}
      disabledDate={(d) => d.isAfter(moment(), 'd')}
      onSelect={(d) => setDate(d)}
      dateCellRender={(d) => getCalendarCell(d, dailies)}
      headerRender={() => null}
    />
  );
};

export default CalendarPage;
