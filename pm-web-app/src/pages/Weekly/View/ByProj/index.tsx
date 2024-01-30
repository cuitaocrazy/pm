import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { Divider, Row, Col, DatePicker, Card, Statistic } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';
import ProjectsPage from './Projects';
// import CalendarPage from './Calendar';
import DailiesPage from './Dailies';
import { useProjsState, useDailyState } from './hook';

const ProjectsDailyPage = () => {
  const { loading: queryUsersLoading, projs } = useProjsState();
  const { queryDaily, projId, daily } = useDailyState();
  const [proPartAndTime,setProPartAndTime] = useState({})
  let projAllTime = 0
  const developer = new Map();
  if (daily.project) {
    daily.dailies.forEach(item => {
      item.dailyItems.forEach(chItem => {
        projAllTime = projAllTime + chItem.timeConsuming
        developer.set(chItem.employee.id, chItem.employee.name)
      })
    })
  }
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
          <Col md={24} lg={10} xl={8} xxl={6}>
            <ProCard
              title="项目列表"
              loading={queryUsersLoading}
              extra={
                <DatePicker
                  allowClear={false}
                  inputReadOnly
                  picker="week"
                  value={date}
                  disabledDate={(d) => d.isAfter(moment(), 'd')}
                  onChange={(d) => {setDate(moment(d).weekday(0) || moment());queryDaily(projId,d!)}}
                />
              }
            >
              <ProjectsPage projs={projs} handleClick={(key,proPartAndTime)=>{queryDaily(key,date);setProPartAndTime(proPartAndTime)}} />
            </ProCard>
          </Col>
          <Col xs={24} md={24} lg={14} xl={16} xxl={18}>
            {projId ?
              <Row>
                <Col xs={2} sm={2}></Col>
                <Col xs={10} sm={10}>
                  <Card>
                    <Statistic title="项目总参与人" value={proPartAndTime[projId].participants.length} suffix="人" />
                  </Card>
                </Col>
                <Col xs={10} sm={10}>
                  <Card>
                    <Statistic title="项目总工时" value={proPartAndTime[projId].timeConsuming} suffix="h" />
                  </Card>
                </Col>
                <Col xs={2} sm={2}></Col>
              </Row> : ''
            }
            <Row>
              <Col xs={2} sm={2}></Col>
              <Col xs={20} sm={20}>
                <DailiesPage date={date} dailies={daily.dailies} />
              </Col>
              <Col xs={2} sm={2}></Col>
            </Row>
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
