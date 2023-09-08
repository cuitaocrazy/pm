import React from 'react';
import type { FormInstance } from 'antd/es/form/Form';
import { Form, Select, Checkbox, Row, Col } from 'antd';
import type { ChangePmInput, User } from '@/apollo';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 16 },
};

export default (
  users: User[],
  isRemovePart: boolean,
  setReomvePart: (isRemovePart: boolean) => void,
) => (form: FormInstance<ChangePmInput>, data?: ChangePmInput) => {
  return (
    <Form {...layout} form={form} initialValues={data}>
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item label="新项目经理" name="leader">
            <Select>
              {users?.map((u) => (
                <Select.Option key={u.id} value={u.id}>
                  {u.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row gutter={24}>
        <Col span={24}>
          <Form.Item name="isRemovePart" hidden>
            <Checkbox checked={isRemovePart} onChange={() => setReomvePart(!isRemovePart)}>
              将原项目经理从项目成员中移除
            </Checkbox>
          </Form.Item>
        </Col>
      </Row>
    </Form>
  );
};
