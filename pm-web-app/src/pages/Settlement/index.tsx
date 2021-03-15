import React from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ProCard from '@ant-design/pro-card';
import { Modal, Row, Col } from 'antd';
import { useSettlement, Status } from './hook';
import Import from './Import';
import Message from './Message';

const Settlement: React.FC = () => {
  const confirm = React.useCallback(
    (message: string) =>
      new Promise<boolean>((resolve) => {
        Modal.confirm({
          title: '服务端询问',
          content: message,
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            resolve(true);
            return Promise.resolve();
          },
          onCancel: () => {
            resolve(false);
            return Promise.resolve();
          },
        });
      }),
    [],
  );

  const { status, messages, pushData, initMessage, addMessage } = useSettlement(confirm);
  const disabled = React.useMemo<boolean>(
    () => status === Status.Waiting || status === Status.Running,
    [status],
  );

  return (
    <PageContainer>
      <ProCard>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Import disabled={disabled} pushData={pushData} addMessage={addMessage} />
          </Col>
          <Col xs={24} sm={12}>
            <Message data={messages} onClear={initMessage} />
          </Col>
        </Row>
      </ProCard>
    </PageContainer>
  );
};

export default Settlement;
