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

const ProjectManager = () => {
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
            title="项目全年费用汇总"
            height={400}
            year={year}
            totalAmoumt={R.sum(charts.costOfMonths.map((ma) => ma.value))}
            totalCost={R.sum(charts.expenseOfMonths.map((ma) => ma.value))}
          />
        </Col>
        <Col span={12}>
          <PieCosts title="项目全年成本占比" height={400} year={year} data={charts.costOfProjs} />
        </Col>
        <Col span={24}>
          <MonthCosts
            title="项目每月费用统计"
            height={400}
            year={year}
            monthAmounts={charts.costOfMonths}
            monthCosts={charts.expenseOfMonths}
          />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <ProjectManager />
  </ApolloProvider>
);
