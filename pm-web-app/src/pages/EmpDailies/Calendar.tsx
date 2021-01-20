import React from 'react';
import { Calendar } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import moment, { Moment } from 'moment';
import * as R from 'ramda';
import { Daily, ProjDaily } from '@/apollo';
import { isWorkday } from '@/utils/utils';

interface CalendarProps {
  date: Moment
  setDate: (date: Moment) => void
  dailies: Daily[]
  workCalendar: string[]
}

const getCalendarCell = (date: Moment, dailies: Daily[], workCalendar: string[]) => {
  const time = R.pipe(
    R.find((d: Daily) => d.date === date.format('YYYYMMDD')),
    R.propOr([], 'projs'),
    R.map((proj: ProjDaily) => proj.timeConsuming),
    R.sum
  )(dailies)
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
    if (dailies.length > 0 &&
      date.isSameOrBefore(moment(), 'd') &&
      isWorkday(date.format('YYYYMMDD'), workCalendar)
    )
      return (
        <div style={{ textAlign: 'center' }}>
          <ClockCircleOutlined style={{ color: 'red' }} />
        </div>
      )
    else return null
  }
}

const CalendarPage: React.FC<CalendarProps> = (props) => {

  const { date, setDate, dailies, workCalendar } = props;

  return (
    <Calendar value={date}
      disabledDate={date => date.isAfter(moment(), 'd')}
      onSelect={date => setDate(date)}
      dateCellRender={(date) => getCalendarCell(date, dailies, workCalendar)}
      headerRender={() => null}
    />
  )
}

export default CalendarPage;
