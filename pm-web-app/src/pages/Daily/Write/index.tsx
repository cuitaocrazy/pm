import React from 'react';
import { Button, DatePicker, Input, Calendar, Row, Col, message, Badge, Radio } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
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
import { isWeekend } from '@/utils/utils';

const dateFormat = 'YYYYMMDD';

function Dailies(prop: { date?: string }) {
  const hookStatus = useDailiesStatus(prop.date);
  const involvedProj = hookStatus.currentDaily?.dailyItems?.filter(d =>
    !(d.project.id.indexOf('-ZH-') > -1) && (d.project.participants.includes(hookStatus.userId || '') || d.project.leader.includes(hookStatus.userId || '') || d.project.salesLeader.includes(hookStatus.userId || '')))
  const unInvolvedProj = hookStatus.currentDaily?.dailyItems?.filter(d =>
    !(d.project.id.indexOf('-ZH-') > -1) && (!d.project.participants.includes(hookStatus.userId || '') || !d.project.leader.includes(hookStatus.userId || '') || !d.project.salesLeader.includes(hookStatus.userId || '')))
  const syntPro = hookStatus.currentDaily?.dailyItems?.filter(d =>
    (d.project.id.indexOf('-ZH-') > -1))
  const onShowTypeChange = (e: any) => hookStatus.setShowType(e.target.value)
  const onHoursChange = (id: string) => (h: number) => {
    let i = hookStatus.currentDaily?.dailyItems.findIndex(p => p.project.id === id)
    hookStatus.setCurrentDaily(
      R.over(
        R.lensPath(['dailyItems', i]),
        (pd: EmployeeOfDailyItem) => ({ ...pd, timeConsuming: h }),
        hookStatus.currentDaily,
      ),
    );
  };
  const onContentOfWorkChange = (id: string) => (c: string) => {
    let i = hookStatus.currentDaily?.dailyItems.findIndex(p => p.project.id === id)
    hookStatus.setCurrentDaily(
      R.over(
        R.lensPath(['dailyItems', i]),
        (pd: EmployeeOfDailyItem) => ({ ...pd, content: c }),
        hookStatus.currentDaily,
      ),
    );
  }

  const list = (type: string) =>
    (type === '0' ? involvedProj : type === '1' ? unInvolvedProj : syntPro).map((d, i) => (
      <ProjItem
        key={d.project.id}
        projId={d.project.id}
        hours={d.timeConsuming}
        content={d.content}
        projName={d.project.name}
        onHoursChange={onHoursChange(d.project.id)}
        onContentOfWorkChange={onContentOfWorkChange(d.project.id)}
        ref={hookStatus.refs[i]}
        visibleFilter={hookStatus.filter}
        involvedProj={d.project.participants.includes(hookStatus.userId || '')}
        endedProj={d.project.status === 'endProj'}
      />
    ));

  const onCalendarSelect = (value: Moment) => {
    value && hookStatus.setCurrentDate(value.format(dateFormat))
  };

  const getDateNumabet = (value: Moment) => {
    let allTime = null
    const dailie = R.find((v) => v.date === value.format(dateFormat), hookStatus.dailies)
    if (dailie) {
      allTime = R.sum(R.map((d) => d.timeConsuming, dailie.dailyItems))
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
        // <Button key="getLastHandle" onClick={handleLastReportOfDay}>
        //   加载上次日报
        // </Button>,
        <Button
          key="submit"
          onClick={() => {
            let noneLen = hookStatus.currentDaily.dailyItems.filter((p) => !!p.timeConsuming !== !!p.content).length
            if (noneLen) {
              message.info('工时和工作内容请填写完整')
              return
            }
            hookStatus.pushDaily({
              variables: {
                date: hookStatus.currentDate,
                projDailies: hookStatus.currentDaily.dailyItems
                  .filter((p) => p.timeConsuming !== 0 && p.content)
                  .map((p) => ({
                    projId: p.project.id,
                    timeConsuming: p.timeConsuming,
                    content: p.content,
                  })),
              },
            })
          }}
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
                      (d) => R.includes(d, R.filter(isWeekend, hookStatus.days)),
                      R.always(
                        <div style={{ textAlign: 'center' }}>
                          <Badge count="班"></Badge>
                          {getDateNumabet(date) ?
                            <div> {getDateNumabet(date)}h</div> :
                            <div><ClockCircleOutlined style={{ color: 'red' }} /></div>
                          }
                        </div>,
                      ),
                    ],
                    [
                      (d) => R.includes(d, R.reject(isWeekend, hookStatus.days)),
                      R.always(
                        <div style={{ textAlign: 'center' }}>
                          <Badge count="休" style={{ backgroundColor: '#52c41a' }}></Badge>
                          {getDateNumabet(date) ?
                            <div> {getDateNumabet(date)}h</div> : <div></div>
                          }
                        </div>,
                      ),
                    ],
                    [
                      isWeekend,
                      R.always(
                        <div style={{ textAlign: 'center' }}>
                          <Badge count="休" style={{ backgroundColor: '#52c41a' }}></Badge>
                          {getDateNumabet(date) ?
                            <div> {getDateNumabet(date)}h</div> : <div></div>
                          }
                        </div>,
                      ),
                    ],
                    [
                      (d) => R.includes(d, hookStatus.completedDailiesDates),
                      R.always(
                        <div style={{ textAlign: 'center' }}>
                          <ClockCircleOutlined style={{ color: 'green' }} />
                          <div> {getDateNumabet(date)}h</div>
                        </div>,
                      ),
                    ],
                    [R.T, R.always(<div style={{ textAlign: 'center' }}><ClockCircleOutlined style={{ color: 'red' }} /></div>)],
                  ])(date.format('YYYYMMDD'))
                }
              />
            </ProCard>
          </Col>
          <Col xs={24} sm={16}>
            <ProCard
              bordered
              headStyle={{ display: 'block' }}
              bodyStyle={{ padding: '12px' }}
              title={
                <Row>
                  <Col span={8}>
                    <Input
                      key="search"
                      addonBefore="检索"
                      allowClear
                      onChange={(e) => hookStatus.setFilter(e.target.value)}
                    />
                  </Col>
                  <Col span={6}></Col>
                  <Col span={10}>
                    <Radio.Group style={{ marginBottom: 8 }} onChange={onShowTypeChange} value={hookStatus.showType}>
                      <Radio.Button value="0">涉及({involvedProj.reduce((prev, cur) => prev + cur.timeConsuming, 0)}h)</Radio.Button>
                      <Radio.Button value="1">未涉及({unInvolvedProj.reduce((prev, cur) => prev + cur.timeConsuming, 0)}h)</Radio.Button>
                      <Radio.Button value="2">日常({syntPro.reduce((prev, cur) => prev + cur.timeConsuming, 0)}h)</Radio.Button>
                    </Radio.Group>
                  </Col>
                </Row>
              }
            >
              {list(hookStatus.showType)}
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
