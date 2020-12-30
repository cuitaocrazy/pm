import React from 'react';
import type { FormInstance } from 'antd/es/form/Form';
import type { CostInput, Query } from '@/apollo';
import { Form, Input, Modal, InputNumber, Select, Button, Divider } from 'antd';
import { gql, useQuery } from '@apollo/client';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const userQuery = gql`
  {
    subordinates {
      id
      name
    }

    myProjs {
      id
      name
    }
  }
`;

export default (form: FormInstance<CostInput>, data?: CostInput) => {
  const { data: resData } = useQuery<Query>(userQuery);
  return (
    <Form {...layout} form={form} initialValues={data}>
      <Form.Item label="ID" name="id" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="金额" name="amount" rules={[{ required: true }]}>
        <InputNumber min={0} />
      </Form.Item>
      <Form.Item label="参与人员" name="participants" rules={[{ required: true }]}>
        <Select mode="multiple">
          {resData?.subordinates.map((u) => (
            <Select.Option key={u.id} value={u.id}>
              {u.name}
            </Select.Option>
          ))}
          x
        </Select>
      </Form.Item>
    </Form>
  );
};
