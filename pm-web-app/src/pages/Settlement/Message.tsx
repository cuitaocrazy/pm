import type React from 'react';
import { Card, Button } from 'antd';

type MessageProps = {
  data: string[];
  onClear: () => void;
};

const Message: React.FC<MessageProps> = (props) => {
  const { data, onClear } = props;

  return (
    <Card
      title="输出日志"
      extra={
        <Button type="link" size="small" onClick={onClear}>
          清除
        </Button>
      }
    >
      <Card style={{ height: 400, overflow: 'scroll' }}>
        {data.map((d, i) => (
          <pre key={i.toString()} style={{ whiteSpace: 'pre-wrap' }}>
            {d}
          </pre>
        ))}
      </Card>
    </Card>
  );
};

export default Message;
