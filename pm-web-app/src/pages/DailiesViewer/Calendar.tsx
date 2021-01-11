import React from 'react';
import { Calendar, DatePicker } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import moment, { Moment } from 'moment';
import * as R from 'ramda';
import { Daily } from '@/apollo';

interface CalendarProps {
  date: Moment;
  setDate: (date: Moment) => void;
  dailies: Daily[];
}

const getCalendarCell = (date: Moment, dailies: Daily[]) => {
  const time = R.find((d) => d.date === date.format('YYYYMMDD'), dailies)?.projs
    .map(proj => proj.timeConsuming)
    .reduce((a, b) => a + b, 0)
  if (time && time > 0) {
    const color = time > 10 ? 'purple' : 'green'
    return (
      <div style={{ textAlign: 'center' }}>
        <ClockCircleOutlined style={{ color }} />
        <p>
          {`${time}h`}
        </p>
      </div>
    )
  } else {
    if (dailies.length > 0 && date.isBefore(moment(), 'd') &&
      ![moment().day("星期六").weekday(), moment().day("星期日").weekday()].includes(date.weekday()))
      return (
        <div style={{ textAlign: 'center' }}>
          <ClockCircleOutlined style={{ color: 'red' }} />
        </div>
      )
    else return null
  }
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
