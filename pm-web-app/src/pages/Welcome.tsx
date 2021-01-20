import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';

export default (): React.ReactNode => {
  return (
    <PageContainer>
      <Card style={{ textAlign: 'center' }}>
        <img src='/main-figure.gif' style={{ width: '50%' }} />
      </Card>
    </PageContainer>
  );
};
