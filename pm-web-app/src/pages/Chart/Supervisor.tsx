import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { DatePicker, Row, Col } from 'antd';
import moment from 'moment';
import * as R from 'ramda';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';
import { useChartsState } from './hook';
import MonthCosts from './components/MonthCosts';
import PieCosts from './components/PieCosts';
import TotalCosts from './components/TotalCosts';

const Supervisor = () => {
  const { year, setYear, charts } = useChartsState();

  return (
    <PageContainer
      extra={
        <DatePicker
          inputReadOnly
          picker="year"
          value={moment().year(year)}
          onChange={(d) => d && setYear(d.year())}
          disabledDate={(d) => d.year() > moment().year()}
        />
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <TotalCosts
            title="全年费用汇总"
            height={330}
            year={year}
            totalAmoumt={R.sum(charts.monthAmounts.map((ma) => ma.value))}
            totalCost={R.sum(charts.monthCosts.map((ma) => ma.value))}
          />
        </Col>
        <Col span={12}>
          <PieCosts title="全年组成本占比" height={330} year={year} data={charts.groupCosts} />
        </Col>
        <Col span={24}>
          <MonthCosts
            title="每月费用统计"
            height={330}
            year={year}
            monthAmounts={charts.monthAmounts}
            monthCosts={charts.monthCosts}
          />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Supervisor />
  </ApolloProvider>
);
