import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { Divider, Row, Col, DatePicker } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';
import EmployeePage from './Employee';
import CalendarPage from './Calendar';
import DailiesPage from './Dailies';
import { useUsersState, useDailyState } from './hook';

const EmployeeDailyPage = () => {
  const { loading: queryUsersLoading, users, workCalendar, userDailiys } = useUsersState();
  const { loading: queryDailyLoading, queryDaily, userId, daily } = useDailyState();

  const [date, setDate] = useState<Moment>(moment().day(1));

  return (
    <PageContainer>
      <ProCard
        headerBordered
        split="vertical"
        extra={
          <>
            {users.find((user) => user.id === userId)?.name}
            <Divider type="vertical" />
            {`${moment(date).format('YYYY年MM月DD日')}-${moment(date)
              .add(6, 'd')
              .format('YYYY年MM月DD日')}`}
          </>
        }
      >
        <Row>
          <Col xs={24} sm={6}>
            <ProCard collapsible title="员工列表" loading={queryUsersLoading}>
              <EmployeePage users={users} userDailiys={userDailiys} handleClick={queryDaily} />
            </ProCard>
          </Col>
          <Col xs={24} sm={8}>
            <ProCard
              collapsible
              bordered
              extra={
                <DatePicker
                  inputReadOnly
                  picker="month"
                  value={date}
                  disabledDate={(d) => d.isAfter(moment(), 'd')}
                  onChange={(d) => setDate(d || moment())}
                />
              }
            >
              <CalendarPage
                date={date}
                setDate={setDate}
                dailies={daily.dailies}
                workCalendar={workCalendar}
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={10}>
            <ProCard loading={queryDailyLoading}>
              <DailiesPage date={date} dailies={daily.dailies} workCalendar={workCalendar} />
            </ProCard>
          </Col>
        </Row>
      </ProCard>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <EmployeeDailyPage />
  </ApolloProvider>
);
