import React from 'react';
import { Calendar, Badge, Button, Divider } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import * as R from 'ramda';
import moment, { Moment } from 'moment';

interface DayCalendarProps {
  value: Moment
  days: string[]
  months: string[]
  onSelect: (date: Moment) => void
  onPanelChange: (mode: string) => void
  handleRemove: (date: string) => void
}

const isWeekend = (date: string): boolean => R.includes(
  moment(date, 'YYYYMMDD').weekday(),
  [moment().day("星期六").weekday(), moment().day("星期日").weekday()]
)

const DayCalendar: React.FC<DayCalendarProps> = (props) => {

  const { value, onSelect, onPanelChange, days, months, handleRemove } = props;

  return (
    <Calendar
      value={value}
      onSelect={onSelect}
      onPanelChange={(_, mode) => onPanelChange(mode)}
      dateCellRender={date =>
        R.cond<string, React.ReactNode>([
          [R.includes(R.__, R.filter(isWeekend, days)), R.always(
            <div style={{ textAlign: 'center' }}>
              <br />
              <Badge count="班">
                {R.includes(moment(date, 'YYYYMMDD').format('YYYYMM'), months) ? null :
                  <Button type="link" icon={<DeleteOutlined />} onClick={e => {
                    e.stopPropagation();
                    handleRemove(date.format('YYYYMMDD'));
                  }} />
                }
              </Badge>
            </div>
          )],
          [R.includes(R.__, R.reject(isWeekend, days)), R.always(
            <div style={{ textAlign: 'center' }}>
              <br />
              <Badge count="休" style={{ backgroundColor: '#52c41a' }} >
                {R.includes(moment(date, 'YYYYMMDD').format('YYYYMM'), months) ? null :
                  <Button type="link" icon={<DeleteOutlined />} onClick={e => {
                    e.stopPropagation();
                    handleRemove(date.format('YYYYMMDD'));
                  }} />
                }
              </Badge>
            </div>
          )],
          [date => !isWeekend(date), R.always(
            <div style={{ textAlign: 'center' }}>
              <br />
              <Badge count="班"></Badge>
            </div>
          )],
          [isWeekend, R.always(
            <div style={{ textAlign: 'center' }}>
              <br />
              <Badge count="休" style={{ backgroundColor: '#52c41a' }} ></Badge>
            </div>
          )],
          [R.T, R.always(null)],
        ])(date.format('YYYYMMDD'))}
      monthCellRender={date => R.filter(d => R.includes(date.format('YYYYMM'), d), days)
        .filter(d => !R.includes(moment(d, 'YYYYMMDD').format('YYYYMM'), months))
        .map(date => (
          <span key={date}>
            <Badge status={isWeekend(date) ? 'error' : 'success'} text={moment(date, 'YYYYMMDD').format('YYYY-MM-DD')} />
            <Button type="link" icon={<DeleteOutlined />} onClick={e => {
              e.stopPropagation();
              handleRemove(date);
            }} />
            <Divider type="vertical" />
          </span>
        ))}
    />
  )
}

export default DayCalendar;
