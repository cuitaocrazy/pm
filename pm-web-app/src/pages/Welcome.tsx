import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import { Card } from 'antd';

export default (): React.ReactNode => {
  return (
    <PageContainer>
      <Card>
        <div style={{textAlign: 'center'}}>
          <img src='/main-figure.gif' />
        </div>
      </Card>
    </PageContainer>
  );
};
