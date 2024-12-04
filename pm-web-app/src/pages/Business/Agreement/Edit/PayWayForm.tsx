/*
 * @Author: 13718154103 1161593628@qq.com
 * @Date: 2024-12-03 17:06:17
 * @LastEditors: 13718154103 1161593628@qq.com
 * @LastEditTime: 2024-12-03 17:49:06
 * @FilePath: /pm/pm-web-app/src/pages/Business/Agreement/Edit/PayWayForm.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState } from 'react';
import {
  PlusOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  TableOutlined,
  FileOutlined,
  FileZipOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import {
  Form,
  Input,
  Upload,
  Select,
  Modal,
  DatePicker,
  message,
  Button,
  Space,
  InputNumber,
} from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import type { AgreementInput, Query } from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import type { FormInstance } from 'antd/lib/form';
import { agreementType, useBaseState } from '@/pages/utils/hook';
import moment from 'moment';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYYMMDD';

const userQuery = gql`
  query ($customersPageSize: Int) {
    subordinates {
      id
      name
    }
    customers(pageSize: $customersPageSize) {
      result {
        id
        name
      }
    }
    projs {
      id
      name
      customer
    }
  }
`;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export default (form: FormInstance<AgreementInput>, data?: AgreementInput) => {
  console.log(data, 'data JJJJJJ');
  return (
    <Form {...layout} form={form} initialValues={data}>
      <Form.Item label="付款方式名称" name="payWayName">
        <Input
          placeholder="请输入付款方式名称"
          rules={[{ required: true, message: '请输入付款方式名称' }]}
        />
      </Form.Item>
      <Form.List name="milestone">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, fieldKey, ...restField }) => (
              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                {/* 里程碑名称 */}
                <Form.Item
                  {...restField}
                  name={[name, 'name']}
                  fieldKey={[fieldKey, 'name']}
                  rules={[{ required: true, message: '请输入里程碑名称' }]}
                >
                  <Input placeholder="里程碑名称" />
                </Form.Item>

                {/* 里程碑百分比 */}
                <Form.Item
                  {...restField}
                  name={[name, 'value']}
                  fieldKey={[fieldKey, 'value']}
                  rules={[
                    { required: true, message: '请输入百分比' },
                    {
                      pattern: /^(100|[1-9]?\d)$/,
                      message: '请输入0-100之间的整数',
                    },
                  ]}
                >
                  <InputNumber
                    placeholder="百分比"
                    min={0}
                    max={100}
                    formatter={(value) => `${value}%`}
                    parser={(value) => value?.replace('%', '') || ''}
                    style={{ width: '100px' }}
                  />
                </Form.Item>

                {/* 删除按钮 */}
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
            ))}

            {/* 添加按钮 */}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />} block>
                添加里程碑
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );
};
