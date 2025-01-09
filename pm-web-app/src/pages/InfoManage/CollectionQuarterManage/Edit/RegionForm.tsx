/*
 * @Author: 13718154103 1161593628@qq.com
 * @Date: 2024-11-22 14:11:01
 * @LastEditors: 13718154103 1161593628@qq.com
 * @LastEditTime: 2024-11-25 13:21:01
 * @FilePath: /pm/pm-web-app/src/pages/InfoManage/PayStateManage/Edit/RegionForm.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import { Form, Input, Switch, InputNumber } from 'antd';
import type { RegionInput } from '@/apollo';
import type { FormInstance } from 'antd/lib/form';

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default (form: FormInstance<RegionInput>, data?: RegionInput) => {
  return (
    <Form {...layout} form={form} initialValues={data}>
      <Form.Item label="ID" name="id" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="回款季度名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="回款季度编码" name="code" rules={[{ required: true }]}>
        <Input min={0} disabled={data?.type_ == 'edit' ? true : false}/>
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
