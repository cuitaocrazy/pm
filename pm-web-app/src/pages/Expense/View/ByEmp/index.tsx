import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { Row, Col } from 'antd';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';
import { useUsersState, useCostsState } from './hook';
import Employee from './Employee';
import Expense from './Expense';

const ProjCostPage: React.FC = () => {
  const { loading: queryProjsLoading, users } = useUsersState();
  const { loading: queryCostsLoading, queryCosts, empCosts } = useCostsState();

  return (
    <PageContainer>
      <ProCard>
        <Row>
          <Col xs={24} sm={6}>
            <ProCard collapsible title="员工列表" loading={queryProjsLoading}>
              <Employee users={users} handleClick={(userId: string) => queryCosts(userId)} />
            </ProCard>
          </Col>
          <Col xs={24} sm={18}>
            <ProCard bordered title="费用详情">
              <Expense
                title={empCosts.employee.name}
                costs={empCosts.items}
                loading={queryCostsLoading}
              />
            </ProCard>
          </Col>
        </Row>
      </ProCard>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <ProjCostPage />
  </ApolloProvider>
);
