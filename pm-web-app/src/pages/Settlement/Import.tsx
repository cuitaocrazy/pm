import React from 'react';
import { Card, Upload } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { RcFile } from 'antd/es/upload/interface';

type ImportProps = {
  disabled: boolean;
  fileType?: string;
  pushData: (data: string) => void;
  addMessage: (message: string) => void;
};

const Import: React.FC<ImportProps> = (props) => {
  const { disabled, fileType = 'text/csv', pushData, addMessage } = props;

  const handleFile = React.useCallback(
    (file: File) => {
      if (file && file.type === fileType) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          pushData(evt.target!.result as string);
        };
        reader.readAsText(file);
      } else {
        addMessage(`客户端: 文件格式${file.type}不正确`);
      }
      return false;
    },
    [fileType, pushData, addMessage],
  );

  return (
    <Card title="选择文件" style={{ height: 506 }}>
      <Upload.Dragger disabled={disabled} beforeUpload={(file: RcFile) => handleFile(file)}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        {disabled ? (
          <p className="ant-upload-text">客户端正在准备中...</p>
        ) : (
          <p className="ant-upload-text">单击或者将文件拖到该区域</p>
        )}
        <p className="ant-upload-hint">支持单次上传，支持的文件格式为CSV</p>
      </Upload.Dragger>
    </Card>
  );
};

export default Import;
