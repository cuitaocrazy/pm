import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { Divider } from 'antd';
import moment, { Moment } from 'moment';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';
import ProjectsPage from './Projects';
import CalendarPage from './Calendar';
import DailiesPage from './Dailies';
import { useProjsState, useDailyState } from './hook';

const ProjectsDailyPage = () => {

  const { loading: queryUsersLoading, projs, users } = useProjsState();
  const { loading: queryDailyLoading, queryDaily, projId, daily } = useDailyState();

  const [date, setDate] = useState<Moment>(moment().day(1));

  return (
    <PageContainer>
      <ProCard headerBordered split="vertical" title="项目日报"
        extra={<>
          {projs.find(proj => proj.id === projId)?.name}
          <Divider type="vertical" />
          {`${moment(date).weekday(0).format('YYYY年MM月DD日')}-${moment(date).weekday(6).format('YYYY年MM月DD日')}`}
        </>}
      >
        <ProCard title="项目列表" colSpan={{ xs: 4, sm: 4 }} loading={queryUsersLoading}>
          <ProjectsPage projs={projs} handleClick={queryDaily} />
        </ProCard>
        <ProCard colSpan={{ xs: 0, sm: 10 }}>
          <CalendarPage date={date} setDate={setDate} dailies={daily.dailies} />
        </ProCard>
        <ProCard colSpan={{ xs: 20, sm: 10 }} loading={queryDailyLoading}>
          <DailiesPage date={date} dailies={daily.dailies} users={users} />
        </ProCard>
      </ProCard>
    </PageContainer>
  )
}

export default () => (
  <ApolloProvider client={client}>
    <ProjectsDailyPage />
  </ApolloProvider>
);
