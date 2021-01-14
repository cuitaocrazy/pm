import React from 'react';
import { Calendar, DatePicker } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import moment, { Moment } from 'moment';
import * as R from 'ramda';
import { UsersDaily, UserDaily } from '@/apollo';

interface CalendarProps {
  date: Moment;
  setDate: (date: Moment) => void;
  dailies: UsersDaily[];
}

const getCalendarCell = (date: Moment, dailies: UsersDaily[]) => {
  const time = R.pipe(
    R.find((d: UsersDaily) => d.date === date.format('YYYYMMDD')),
    R.propOr([], 'users'),
    R.map((d: UserDaily) => d.timeConsuming),
    R.sum
  )(dailies)
  if (time && time > 0) {
    const color = 'green'
    return (
      <div style={{ textAlign: 'center' }}>
        <ClockCircleOutlined style={{ color }} />
        <p>
          {`${time}h`}
        </p>
      </div>
    )
  } else return null
}

const CalendarPage: React.FC<CalendarProps> = (props) => {

  const { date, setDate, dailies } = props;

  return (
    <Calendar value={date}
      disabledDate={date => date.isAfter(moment(), 'd')}
      onSelect={date => setDate(date)}
      dateCellRender={(date) => getCalendarCell(date, dailies)}
      headerRender={() => {
        return (
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <DatePicker picker="month" value={date}
              disabledDate={date => date.isAfter(moment(), 'd')}
              onChange={date => setDate(date || moment())}
            />
          </div>
        )
      }}
    />
  )
}

export default CalendarPage;
