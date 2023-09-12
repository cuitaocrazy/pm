import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';

const Default = () => {
  return (
    <PageContainer>
      <Card style={{ textAlign: 'center' }}>
        <img src="/web/main-figure.png" style={{ width: '50%' }} />
      </Card>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Default />
  </ApolloProvider>
);
