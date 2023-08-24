import React from 'react';
import { Button, DatePicker, Input, Calendar, Row, Col } from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { PageContainer } from '@ant-design/pro-layout';
import * as R from 'ramda';
import moment from 'moment';
import type { Moment } from 'moment';
import { ApolloProvider } from '@apollo/client';
import type { EmployeeOfDailyItem } from '@/apollo';
import { client } from '@/apollo';
import ProjItem from './ProjItem';
import StripPercentage from './StripPercentage';
import { useDailiesStatus } from './hook';
import Description from './Description';

const dateFormat = 'YYYYMMDD';

function Dailies(prop: { date?: string }) {
  const hookStatus = useDailiesStatus(prop.date);

  const onHoursChange = (i: number) => (h: number) => {
    hookStatus.setCurrentDaily(
      R.over(
        R.lensPath(['dailyItems', i]),
        (pd: EmployeeOfDailyItem) => ({ ...pd, timeConsuming: h }),
        hookStatus.currentDaily,
      ),
    );
  };
  const onContentOfWorkChange = (i: number) => (c: string) =>
    hookStatus.setCurrentDaily(
      R.over(
        R.lensPath(['dailyItems', i]),
        (pd: EmployeeOfDailyItem) => ({ ...pd, content: c }),
        hookStatus.currentDaily,
      ),
    );

  const list = () =>
    hookStatus.currentDaily?.dailyItems?.map((d, i) => (
      <ProjItem
        key={d.project.id}
        projId={d.project.id}
        hours={d.timeConsuming}
        content={d.content}
        projName={d.project.name}
        onHoursChange={onHoursChange(i)}
        onContentOfWorkChange={onContentOfWorkChange(i)}
        ref={hookStatus.refs[i]}
        visibleFilter={hookStatus.filter}
        involvedProj={d.project.participants.includes(hookStatus.userId || '')}
        endedProj={d.project.status === 'endProj'}
      />
    ));

  const handleLastReportOfDay = () => {
    const c = hookStatus.getLastDaily(hookStatus.currentDate);
    hookStatus.setCurrentDaily(c);
  };

  const onCalendarSelect = (value: Moment) => {
    value && hookStatus.setCurrentDate(value.format(dateFormat))
  };

  const getDateNumabet = (value: Moment) => {
    let allTime = null
    const dailie = R.find((v) => v.date === value.format(dateFormat), hookStatus.dailies)
    if (dailie) {
      allTime =  R.sum(R.map((d) => d.timeConsuming, dailie.dailyItems))
    }
    return allTime
  };

  return (
    <PageContainer
      style={{ height: '60vh' }}
      loading={hookStatus.loading}
      content={
        <div style={{ marginLeft: -24, marginRight: -24, marginBottom: -16 }}>
          <Description />
          <StripPercentage
            data={hookStatus.currentDaily.dailyItems}
            gotoAnchor={(i) => hookStatus.refs[i].current!.gotoAnchor(hookStatus.getOffset())}
          />
        </div>
      }
      footer={[
        <Button key="getLastHandle" onClick={handleLastReportOfDay}>
          加载上次日报
        </Button>,
        <Button
          key="submit"
          onClick={() =>
            hookStatus.pushDaily({
              variables: {
                date: hookStatus.currentDate,
                projDailies: hookStatus.currentDaily.dailyItems
                  .filter((p) => p.timeConsuming !== 0)
                  .map((p) => ({
                    projId: p.project.id,
                    timeConsuming: p.timeConsuming,
                    content: p.content,
                  })),
              },
            })
          }
          // disabled={!R.any((e) => e.timeConsuming !== 0, hookStatus.currentDaily.projs)}
          loading={hookStatus.loading}
        >
          提交
        </Button>,
      ]}
      fixedHeader
    >
      <ProCard>
        <Row>
          <Col xs={24} sm={8}>
            <ProCard bordered style={{ overflowY: 'auto' }}>
              <Calendar
                className='dailie-calendar'
                fullscreen={true}
                headerRender={({ value, type, onChange, onTypeChange }) => {
                  return <div>
                    <DatePicker
                      inputReadOnly
                      key="date"
                      value={moment(hookStatus.currentDate, dateFormat)}
                      onChange={(d) => d && hookStatus.setCurrentDate(d.format(dateFormat))}
                      dateRender={(current) => {
                        const style: React.CSSProperties = {};
                        if (hookStatus.completedDailiesDates!.includes(current.format(dateFormat))) {
                          style.border = '1px solid #1890ff';
                          style.borderRadius = '50%';
                        }
                        return (
                          <div className="ant-picker-cell-inner" style={style}>
                            {current.date()}
                          </div>
                        );
                      }}
                    />
                  </div>
                }}
                value={moment(hookStatus.currentDate, dateFormat)}
                onSelect={onCalendarSelect}
                dateCellRender={(date) =>
                  R.cond<string[], React.ReactNode>([
                    [
                      (d) => R.includes(d, hookStatus.completedDailiesDates),
                      R.always(
                        <div style={{ textAlign: 'center' }}>
                          <div> { getDateNumabet(date) }h</div>
                          <CheckCircleTwoTone twoToneColor="#52c41a" />
                        </div>,
                      ),
                    ],
                    [R.T, R.always(null)],
                  ])(date.format('YYYYMMDD'))
                }
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={16}>
            <ProCard 
              bordered 
              bodyStyle={{ padding: '12px' }}
              title={
                <Input
                  key="search"
                  addonBefore="检索"
                  allowClear
                  onChange={(e) => hookStatus.setFilter(e.target.value)}
                />
              }
              >
              {list()}
            </ProCard>
          </Col>
        </Row>
      </ProCard>
      
    </PageContainer>
  );
}

export default () => (
  <ApolloProvider client={client}>
    <Dailies />
  </ApolloProvider>
);
