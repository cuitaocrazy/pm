import React from 'react';
import { Form, Input, Switch, InputNumber, Select } from 'antd';
import type { RegionInput } from '@/apollo';
import type { FormInstance } from 'antd/lib/form';
import { useRegionState } from './hook';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default (form: FormInstance<RegionInput>, data?: RegionInput) => {
  const { regionones } = useRegionState();
  
  return (
    <Form {...layout} form={form} initialValues={data}>
      <Form.Item label="一级区域" name="parentId">
        <Select options={regionones} fieldNames={{ label: 'name', value: 'id' }}/>
      </Form.Item>
      <Form.Item label="ID" name="id" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="区域名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="区域编码" name="code" rules={[{ required: true }]}>
        <Input min={0} disabled={data.type_ == 'edit' ? true : false}/>
      </Form.Item>
      <Form.Item
        label="是否启用"
        name="enable"
        valuePropName="checked"
        rules={[{ required: true }]}
      >
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
