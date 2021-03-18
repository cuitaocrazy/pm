import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { Row, Col } from 'antd';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';
import { useProjsState, useCostsState } from './hook';
import Projects from './Projects';
import Expense from './Expense';

const ProjCostPage: React.FC = () => {
  const { loading: queryProjsLoading, projs } = useProjsState();
  const { loading: queryCostsLoading, queryCosts, projCosts } = useCostsState();

  return (
    <PageContainer>
      <ProCard>
        <Row>
          <Col sm={24} md={10} xl={8} xxl={6}>
            <ProCard collapsible title="项目列表" loading={queryProjsLoading}>
              <Projects projs={projs} handleClick={(projId: string) => queryCosts(projId)} />
            </ProCard>
          </Col>
          <Col sm={24} md={14} xl={16} xxl={18}>
            <ProCard bordered title="费用详情">
              <Expense
                title={projCosts.project.name}
                costs={projCosts.items}
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
