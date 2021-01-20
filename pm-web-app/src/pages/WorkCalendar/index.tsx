import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { Row, Col, DatePicker, Button } from 'antd';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';
import * as R from 'ramda';
import moment, { Moment } from 'moment';
import DialogForm, { FormDialogHandle } from '@/components/DialogForm';
import DayTable from './DayTable';
import DayCalendar from './DayCalendar';
import DayForm from './DayForm';
import { useDaysStatus } from './hook';

const CalendarPage: React.FC = () => {

  const { loading, days, months, deleteDays, pushDays } = useDaysStatus();

  const [date, setDate] = React.useState<Moment>(moment());
  const [height, setHeight] = React.useState<number>(742.5);
  const ref = React.useRef<FormDialogHandle<{}>>(null);

  return (
    <PageContainer extra={<Button type="link" onClick={() => ref.current!.showDialog()}>添加</Button>}>
      <ProCard>
        <Row>
          <Col xs={24} sm={6}>
            <ProCard bordered extra={
              <DatePicker inputReadOnly picker="year" format="YYYY年"
                value={date}
                onChange={date => setDate(date || moment())}
              />
            } loading={loading}>
              <DayTable
                height={height}
                days={R.filter(d => R.includes(date.format('YYYY'), d), days)}
                months={months}
                setDate={setDate}
                handleRemove={(date: string) => deleteDays([date])}
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={18}>
            <ProCard bordered>
              <DayCalendar
                value={date}
                onSelect={date => setDate(date || moment())}
                onPanelChange={mode => setHeight(R.equals(mode, 'month') ? 742.5 : 488)}
                days={days}
                months={months}
                handleRemove={(date: string) => deleteDays([date])}
              />
            </ProCard>
          </Col>
        </Row>
      </ProCard>
      <DialogForm title="添加日期" ref={ref} submitHandle={v => pushDays(v.days)}>
        {DayForm(months)}
      </DialogForm>
    </PageContainer>
  )
}

export default () => (
  <ApolloProvider client={client}>
    <CalendarPage />
  </ApolloProvider>
);