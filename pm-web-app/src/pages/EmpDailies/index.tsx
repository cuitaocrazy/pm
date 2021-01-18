import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { Divider, Row, Col, DatePicker } from 'antd';
import moment, { Moment } from 'moment';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';
import EmployeePage from './Employee';
import CalendarPage from './Calendar';
import DailiesPage from './Dailies';
import { useUsersState, useDailyState } from './hook';

const EmployeeDailyPage = () => {

  const { loading: queryUsersLoading, users } = useUsersState();
  const { loading: queryDailyLoading, queryDaily, userId, daily } = useDailyState();

  const [date, setDate] = useState<Moment>(moment().day(1));

  return (
    <PageContainer>
      <ProCard headerBordered split="vertical"
        extra={<>
          {users.find(user => user.id === userId)?.name}
          <Divider type="vertical" />
          {`${moment(date).format('YYYY年MM月DD日')}-${moment(date).add(6, 'd').format('YYYY年MM月DD日')}`}
        </>}
      >
        <Row>
          <Col xs={24} sm={4}>
            <ProCard collapsible title="员工列表" loading={queryUsersLoading}>
              <EmployeePage users={users} handleClick={queryDaily} />
            </ProCard>
          </Col>
          <Col xs={24} sm={10}>
            <ProCard collapsible bordered extra={
              <DatePicker inputReadOnly picker="month" value={date}
                disabledDate={date => date.isAfter(moment(), 'd')}
                onChange={date => setDate(date || moment())}
              />
            }>
              <CalendarPage date={date} setDate={setDate} dailies={daily.dailies} />
            </ProCard>
          </Col>
          <Col xs={24} sm={10}>
            <ProCard loading={queryDailyLoading}>
              <DailiesPage date={date} dailies={daily.dailies} />
            </ProCard>
          </Col>
        </Row>
      </ProCard>
    </PageContainer>
  )
}

export default () => (
  <ApolloProvider client={client}>
    <EmployeeDailyPage />
  </ApolloProvider>
);
