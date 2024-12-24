/*
 * @Author: 13718154103 1161593628@qq.com
 * @Date: 2024-11-26 14:45:00
 * @LastEditors: 13718154103 1161593628@qq.com
 * @LastEditTime: 2024-11-26 15:55:16
 * @FilePath: /pm/pm-web-app/src/pages/Project/Edit/EstablishProReview/CheckProjForm.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from 'react';
import { Form, Input, Button, Divider, Row, Col, DatePicker, Upload, Select, TextArea } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { ProjectInput } from '@/apollo';
import { useModel } from 'umi';
import type { FormInstance } from 'antd/lib/form';
import moment from 'moment';

export default (form: FormInstance<ProjectInput>, data?: ProjectInput) => {
  
  const layout = {
    labelCol: { span: 3 },
    wrapperCol: { span: 16 },
  };
  const { initialState } = useModel('@@initialState');
  const [isRequire, setIsRequire] = useState();
  const handleChange = (value: string) => {
    
    setIsRequire(value);
  };
  return (
    <Form {...layout} form={form} initialValues={data || { leader: initialState?.currentUser?.id }}>
      <Form.Item label="原因" name="id" hidden>
        <Input defaultValue={data.id} />
      </Form.Item>
      <Form.Item label="审核" name="checkState" rules={[{ required: true }]}>
        <Select
          style={{ width: 120 }}
          onChange={handleChange}
          options={[
            {
              value: 1,
              label: '通过',
            },
            {
              value: 2,
              label: '驳回',
            },
          ]}
        />
      </Form.Item>
      <Form.Item label="原因" name="reason" rules={[{ required: isRequire == 2 ? true : false }]}>
        <Input.TextArea rows={4} />
      </Form.Item>
    </Form>
  );
};
