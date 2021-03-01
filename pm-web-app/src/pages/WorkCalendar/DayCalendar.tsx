import React from 'react';
import { Calendar, Badge, Button, Divider } from 'antd';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';
import * as R from 'ramda';
import type { Moment } from 'moment';
import moment from 'moment';
import { isWeekend } from '@/utils/utils';

type DayCalendarProps = {
  value: Moment;
  days: string[];
  months: string[];
  onSelect: (date: Moment) => void;
  onPanelChange: (mode: string) => void;
  handleCreate: (date: string) => void;
  handleRemove: (date: string) => void;
};

const DayCalendar: React.FC<DayCalendarProps> = (props) => {
  const { value, onSelect, onPanelChange, days, months, handleRemove, handleCreate } = props;

  return (
    <Calendar
      value={value}
      onSelect={onSelect}
      onPanelChange={(_, mode) => onPanelChange(mode)}
      dateCellRender={(date) =>
        R.cond<string, React.ReactNode>([
          [
            (d) => R.includes(d, R.filter(isWeekend, days)),
            R.always(
              <div style={{ textAlign: 'center' }}>
                <br />
                <Badge count="班">
                  {R.includes(moment(date, 'YYYYMMDD').format('YYYYMM'), months) ? null : (
                    <Button
                      danger
                      type="link"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(date.format('YYYYMMDD'));
                      }}
                    />
                  )}
                </Badge>
              </div>,
            ),
          ],
          [
            (d) => R.includes(d, R.reject(isWeekend, days)),
            R.always(
              <div style={{ textAlign: 'center' }}>
                <br />
                <Badge count="休" style={{ backgroundColor: '#52c41a' }}>
                  {R.includes(moment(date, 'YYYYMMDD').format('YYYYMM'), months) ? null : (
                    <Button
                      danger
                      type="link"
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(date.format('YYYYMMDD'));
                      }}
                    />
                  )}
                </Badge>
              </div>,
            ),
          ],
          [
            (d) => !isWeekend(d),
            R.always(
              <div style={{ textAlign: 'center' }}>
                <br />
                {R.includes(moment(date, 'YYYYMMDD').format('YYYYMM'), months) ? null : (
                  <Button
                    type="link"
                    icon={<PlusCircleOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreate(date.format('YYYYMMDD'));
                    }}
                  />
                )}
              </div>,
            ),
          ],
          [
            isWeekend,
            R.always(
              <div style={{ textAlign: 'center' }}>
                <br />
                <Badge count="休" style={{ backgroundColor: '#52c41a' }}>
                  {R.includes(moment(date, 'YYYYMMDD').format('YYYYMM'), months) ? null : (
                    <Button
                      type="link"
                      icon={<PlusCircleOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCreate(date.format('YYYYMMDD'));
                      }}
                    />
                  )}
                </Badge>
              </div>,
            ),
          ],
          [R.T, R.always(null)],
        ])(date.format('YYYYMMDD'))
      }
      monthCellRender={(date) =>
        R.filter((d) => R.includes(date.format('YYYYMM'), d), days)
          .filter((d) => !R.includes(moment(d, 'YYYYMMDD').format('YYYYMM'), months))
          .map((d) => (
            <span key={d}>
              <Badge
                status={isWeekend(d) ? 'error' : 'success'}
                text={moment(d, 'YYYYMMDD').format('YYYY-MM-DD')}
              />
              <Button
                danger
                type="link"
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(d);
                }}
              />
              <Divider type="vertical" />
            </span>
          ))
      }
    />
  );
};

export default DayCalendar;
