import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { Divider } from 'antd';
import moment, { Moment } from 'moment';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';
import EmployeePage from './Employee';
import CalendarPage from './Calendar';
import DailiesPage from './Dailies';
import { useUsersState, useDailyState } from './hook';

const EmployeeDailyPage = () => {

  const { loading: queryUsersLoading, users, projs } = useUsersState();
  const { loading: queryDailyLoading, queryDaily, userId, daily } = useDailyState();

  const [date, setDate] = useState<Moment>(moment().day(1));

  return (
    <PageContainer>
      <ProCard headerBordered split="vertical" title="员工日报"
        extra={<>
          {users.find(user => user.id === userId)?.name}
          <Divider type="vertical" />
          {`${moment(date).format('YYYY年MM月DD日')}-${moment(date).add(6, 'd').format('YYYY年MM月DD日')}`}
        </>}
      >
        <ProCard title="员工列表" colSpan={{ xs: 4, sm: 4 }} loading={queryUsersLoading}>
          <EmployeePage users={users} handleClick={queryDaily} />
        </ProCard>
        <ProCard colSpan={{ xs: 0, sm: 10 }}>
          <CalendarPage date={date} setDate={setDate} dailies={daily.dailies} />
        </ProCard>
        <ProCard colSpan={{ xs: 20, sm: 10 }} loading={queryDailyLoading}>
          <DailiesPage date={date} dailies={daily.dailies} projs={projs} />
        </ProCard>
      </ProCard>
    </PageContainer>
  )
}

export default () => (
  <ApolloProvider client={client}>
    <EmployeeDailyPage />
  </ApolloProvider>
);
