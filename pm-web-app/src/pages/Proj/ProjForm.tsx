import React from 'react';
import { Form, Input, InputNumber, Select, Button, Divider } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ProjectInput, Query } from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import { projStatus } from './utils';
import type { FormInstance } from 'antd/lib/form';
import ProjIdComponent from './ProjIdComponent';

const userQuery = gql`
  {
    subordinates {
      id
      name
    }
    projs {
      id
    }
  }
`;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default (form: FormInstance<ProjectInput>, data?: ProjectInput) => {
  const { loading, data: resData } = useQuery<Query>(userQuery, { fetchPolicy: 'no-cache' });
  const validator = (rule: any, value: string) => {
    const result = /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/.exec(
      value,
    );
    if (result === null) {
      return Promise.reject(Error('id格式不正确'));
    }

    if (!result.groups?.org) {
      return Promise.reject(Error('请选择机构'));
    }

    if (!result.groups?.zone) {
      return Promise.reject(Error('请选择区域'));
    }

    if (!result.groups?.projType) {
      return Promise.reject(Error('请选择项目类型'));
    }

    if (!result.groups?.simpleName) {
      return Promise.reject(Error('项目缩写不能为空'));
    }

    if (!/^\d{4}$/.exec(result.groups?.dateCode)) {
      return Promise.reject(Error('日期编码为4位数字'));
    }

    return !data?.id && resData!.projs.find((sp) => sp.id === value)
      ? Promise.reject(Error('id已存在'))
      : Promise.resolve();
  };

  return (
    <Form {...layout} form={form} initialValues={data}>
      {/* <Form.Item label="Hehe">
        <ProjIdComponent value={data?.id} />
      </Form.Item> */}
      <Form.Item label="ID" name="id" rules={[{ required: true }, { validator }]}>
        {/* <Input disabled={!!data?.id} /> */}
        <ProjIdComponent disabled={!!data?.id} />
      </Form.Item>
      <Form.Item label="名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="预算（元）" name="budget" rules={[{ required: true }]}>
        <InputNumber min={0} />
      </Form.Item>
      <Form.Item label="状态" name="type" rules={[{ required: true }]}>
        <Select loading={loading}>
          {projStatus.map((s) => (
            <Select.Option key={s[0]} value={s[0]}>
              {s[1]}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="参与人员" name="participants">
        <Select
          mode="multiple"
          filterOption={(input, option) =>
            option!.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
          }
        >
          {resData?.subordinates.map((u) => (
            <Select.Option key={u.id} value={u.id}>
              {u.name}
            </Select.Option>
          ))}
          x
        </Select>
      </Form.Item>
      <Form.List name="contacts">
        {(fields, { add, remove }) => (
          <>
            {fields.map((field, i) => (
              <div key={field.key} style={{ textAlign: 'center' }}>
                <Divider>联系人 {i + 1}</Divider>
                <Form.Item
                  key="name"
                  label="联系人"
                  name={[field.name, 'name']}
                  rules={[{ required: true }]}
                >
                  <Input />
                </Form.Item>
                <Form.Item key="duties" label="职务" name={[field.name, 'duties']}>
                  <Input />
                </Form.Item>
                <Form.Item key="phone" label="电话" name={[field.name, 'phone']}>
                  <Input />
                </Form.Item>
                <MinusCircleOutlined className="dynamic-delete-button" onClick={() => remove(i)} />
              </div>
            ))}
            <Form.Item>
              <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                添加联系人
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );
};
