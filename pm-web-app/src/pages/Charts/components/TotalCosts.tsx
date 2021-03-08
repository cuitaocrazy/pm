import React from 'react';
import ProCard from '@ant-design/pro-card';
import { Row, Col, Card, Statistic } from 'antd';

type TotalCostsProps = {
  year: number;
  totalAmoumt: number;
  totalCost: number;
  title?: string;
  height?: number;
};

const TotalCosts: React.FC<TotalCostsProps> = (props) => {
  const { totalAmoumt, totalCost, title, height = 400 } = props;

  return (
    <ProCard title={title} style={{ height }} headerBordered>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card style={{ height: height / 3 }}>
            <Statistic title="总成本" value={totalAmoumt} precision={2} />
          </Card>
        </Col>
        <Col span={12}>
          <Card style={{ height: height / 3 }}>
            <Statistic title="总费用" value={totalCost} precision={2} />
          </Card>
        </Col>
        <Col span={12}>
          <Card style={{ height: height / 3 }}>
            <Statistic title="总计" value={totalAmoumt + totalCost} precision={2} />
          </Card>
        </Col>
      </Row>
    </ProCard>
  );
};

export default TotalCosts;
