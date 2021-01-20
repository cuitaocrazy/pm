import React from 'react';
import { FormInstance } from 'antd/es/form/Form';
import { Form, Button, DatePicker, Space, Input, Badge } from 'antd';
import { RangeValue } from 'rc-picker/lib/interface';
import { MinusCircleOutlined } from '@ant-design/icons';
import moment, { Moment } from 'moment';
import * as R from 'ramda';

const isWeekend = (date: string): boolean => R.includes(
  moment(date, 'YYYYMMDD').weekday(),
  [moment().day("星期六").weekday(), moment().day("星期日").weekday()]
)

export default (months: string[]) => (form: FormInstance<{ days: string[] }>, data?: { days: string[] }) => {

  const [range, setRange] = React.useState<RangeValue<Moment>>(null);

  return (
    <Form form={form} initialValues={data}>
      <Form.List name="days">
        {(fields, { add, remove }) => (
          <>
            <Form.Item label="选择日期" labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
              <Space>
                <DatePicker.RangePicker
                  inputReadOnly
                  value={range}
                  onChange={dates => setRange(dates)}
                  disabledDate={date => R.includes(moment(date, 'YYYYMMDD').format('YYYYMM'), months)}
                />
                <Button onClick={() => {
                  if (range !== null && range.length === 2) {
                    const days = moment(range[1]).diff(moment(range[0]), 'd')
                    R.range(0, days + 1)
                      .map(i => moment(range[0]).add(i, 'd').format('YYYYMMDD'))
                      .filter(date => !R.includes(moment(date, 'YYYYMMDD').format('YYYYMM'), months))
                      .filter(date => !R.includes(date, form.getFieldValue('days') || []))
                      .forEach(date => add(date))
                    setRange(null)
                  }
                }}>添加</Button>
              </Space>
            </Form.Item>
            {fields.map(field =>
              <Space key={field.key}>
                <Form.Item hidden {...field}>
                  <Input />
                </Form.Item>
                <Badge
                  status={isWeekend(form.getFieldValue('days')[field.name]) ? 'error' : 'success'}
                  text={moment(form.getFieldValue('days')[field.name], 'YYYYMMDD').format('YYYY-MM-DD')}
                />
                <Button type="link" icon={<MinusCircleOutlined />} onClick={() => remove(field.name)} />
              </Space>
            )}
          </>
        )}
      </Form.List>
    </Form>
  );
};
