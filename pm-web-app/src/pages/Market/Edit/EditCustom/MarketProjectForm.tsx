import React from 'react';
import { Form, Input, Select, Button, Divider, Row, Col, DatePicker, Upload } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { MarketProjectInput} from '@/apollo';
import { useModel } from 'umi';
import type { FormInstance } from 'antd/lib/form';

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 16 },
};

export default (form: FormInstance<MarketProjectInput>, data?: MarketProjectInput) => {
  const { initialState } = useModel('@@initialState');
  let files = data?.fileList as UploadFile[];

  const props: UploadProps = {
    listType: "picture-card",
    action: '/api/upload/tmp',
    defaultFileList: files,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: true
    },
    onChange: ({ file, fileList }) => {
      if (file.status !== 'uploading') {
        fileList.forEach(item => {
          const { url, response } = item
          item.url = url ? url : response.data
          item.thumbUrl = ''
          delete item.lastModified
          delete item.percent
          delete item.size
          delete item.type
          // delete item.originFileObj
          delete item.response
          delete item.xhr
          delete item.lastModifiedDate
        })
      }
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };
  
  const renderActiveNode = (fields: any) => {
    let tempFields = []
    for (let i = fields.length - 1; i >= 0; i--) {
      fields['index'] = i
      tempFields.push(fields[i])
    }
    return tempFields;
  }

  return (
    <Form 
      {...layout} 
      form={form} 
      initialValues={data || { leader: initialState?.currentUser?.id }} 
    >
      <Row>
        <Col span={8}>
          <Form.Item label="项目名称" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
      
        <Col span={8}>
          <Form.Item label="项目规模" name="scale" rules={[{ required: false }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="项目状态" name="status" rules={[{ required: true }]}>
            <Select allowClear>
                <Select.Option key={'track'} value={'track'}>跟踪</Select.Option>
                <Select.Option key={'stop'} value={'stop'}>终止</Select.Option>
                <Select.Option key={'transfer'} value={'transfer'}>转销售</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.Item label="项目简介" name="introduct" labelCol={{ span: 3, offset: 0 }}>
            <Input.TextArea />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.Item label="项目计划" name="plan" labelCol={{ span: 3, offset: 0 }}>
            <Input.TextArea />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.Item label="项目资料" name="fileList" rules={[{ required: false }]} getValueFromEvent={normFile} labelCol={{ span: 3, offset: 0 }}>
            <Upload { ...props }>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            </Upload>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.List name='visitRecord'>
            {(fields, { add, remove }, { errors }) => (
              <>
                <Form.Item>
                    <Button type="dashed" onClick={() => add(fields.length)} icon={<PlusOutlined />}>
                      添加拜访记录
                    </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
                {renderActiveNode(fields).map((field, i) => (
                  <div key={field.key} style={{ textAlign: 'left' }}>
                    <Divider>拜访记录 {field.name + 1}</Divider>
                    <Row>
                      <Col xs={24} sm={24}>
                        <Row>
                          <Col span={24}>
                            <Form.Item
                              labelCol={{ span: 5, offset: 0 }}
                              key="date"
                              label="拜访时间"
                              name={[field.name, 'date']}
                              rules={[{ required: true }]}
                            >
                              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }}/>
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Form.Item
                              labelCol={{ span: 5, offset: 0 }}
                              key="content"
                              label="拜访内容"
                              name={[field.name, 'content']}
                              rules={[{ required: true }]}
                            >
                              <Input.TextArea rows={4} placeholder="需包含：地点--人物---事件" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                    <div style={{ textAlign: 'center' }}>
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => remove(field.name)}
                      />
                    </div>
                  </div>
                ))}
              </>
            )}
          </Form.List>
        </Col>
      </Row>
    </Form>
  );
};
