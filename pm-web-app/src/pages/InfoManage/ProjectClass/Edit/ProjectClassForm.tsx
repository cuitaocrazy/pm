import React from 'react';
import { Form, Input, Switch, InputNumber } from 'antd';
import type { ProjectClassInput } from '@/apollo';
import type { FormInstance } from 'antd/lib/form';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default (form: FormInstance<ProjectClassInput>, data?: ProjectClassInput) => {
  return (
    <Form {...layout} form={form} initialValues={data}>
      <Form.Item label="ID" name="id" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="项目分类名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="项目分类编码" name="code" rules={[{ required: true }]}>
        <Input min={0} />
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
