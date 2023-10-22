import React from 'react';
import { Form, Input, Switch, InputNumber } from 'antd';
import type { StatuInput, Query } from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import type { FormInstance } from 'antd/lib/form';

const userQuery = gql`
  {
    subordinates {
      id
      name
    }
    status {
      id
      name
    }
  }
`;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default (form: FormInstance<StatuInput>, data?: StatuInput) => {
  const { data: resData } = useQuery<Query>(userQuery, { fetchPolicy: 'no-cache' });
  const pidStr = resData?.status.find((statu) => statu.id === data?.pId)?.name;
  return (
    <Form {...layout} form={form} initialValues={data || { enable: true }}>
      {/* <Form.Item label="Hehe">
        <ProjIdComponent value={data?.id} />
      </Form.Item> */}
      <Form.Item label="ID" name="id" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="pID" name="pId" hidden>
        <Input value="0" />
      </Form.Item>
      <Form.Item label="父状态" rules={[{ required: true }]}>
        <Input disabled value={pidStr ? pidStr : '------'} />
      </Form.Item>
      <Form.Item label="状态名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="状态编码" name="code" rules={[{ required: true }]}>
        <Input placeholder='一般为大写状态名称首字母'/>
      </Form.Item>
      <Form.Item label="是否启用" name="enable" valuePropName="checked" rules={[{ required: true }]}>
        <Switch />
      </Form.Item>
      <Form.Item label="排序" name="sort" rules={[{ required: true }]}>
        <InputNumber min={0} />
      </Form.Item>
      <Form.Item label="备注" name="remark" rules={[{ required: false }]}>
        <Input.TextArea />
      </Form.Item>
    </Form>
  );
};
