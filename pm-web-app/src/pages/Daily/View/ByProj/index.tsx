import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { Divider, Row, Col, DatePicker } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';
import ProjectsPage from './Projects';
import CalendarPage from './Calendar';
import DailiesPage from './Dailies';
import { useProjsState, useDailyState } from './hook';

const ProjectsDailyPage = () => {
  const { loading: queryUsersLoading, projs } = useProjsState();
  const { loading: queryDailyLoading, queryDaily, projId, daily,setProjId } = useDailyState();

  const [date, setDate] = useState<Moment>(moment().day(1));

  return (
    <PageContainer>
      <ProCard
        headerBordered
        split="vertical"
        extra={
          <>
            {projs.find((proj) => proj.id === projId)?.name}
            <Divider type="vertical" />
            {`${moment(date).format('YYYY年MM月DD日')}-${moment(date)
              .add(6, 'd')
              .format('YYYY年MM月DD日')}`}
          </>
        }
      >
        <Row>
          {/**项目列表*/}
          <Col md={24} lg={10} xl={8} xxl={6}>
            <ProCard collapsible title="项目列表" loading={queryUsersLoading}>
              <ProjectsPage projs={projs} handleClick={(key)=>{setProjId(key);queryDaily(key,moment())}} />
            </ProCard>
          </Col>
           {/**日历展示*/}
          <Col md={24} lg={14} xl={9} xxl={9}>
            <ProCard
              collapsible={false}
              bordered
              extra={
                <DatePicker
                  inputReadOnly
                  picker="month"
                  value={date}
                  disabledDate={(d) => d.isAfter(moment(), 'd')}
                  onChange={(d) => {setDate(d || moment());queryDaily(projId,moment(d))}}

                />
              }
            >
              <CalendarPage projId={projId}  date={date} setDate={setDate} dailies={daily.dailies} />
            </ProCard>
          </Col>
          {/**日报展示*/}
          <Col md={24} xl={7} xxl={9}>
            <ProCard loading={queryDailyLoading}>
              <DailiesPage date={date} dailies={daily.dailies} />
            </ProCard>
          </Col>
        </Row>
      </ProCard>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <ProjectsDailyPage />
  </ApolloProvider>
);
