import React from 'react';
import type { FormInstance } from 'antd/es/form/Form';
import type { CostInput, Query } from '@/apollo';
import { Form, Input, InputNumber, Select, Button, Divider } from 'antd';
import { gql, useQuery } from '@apollo/client';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

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

    projs {
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
      <Form.Item label="参与人员" name="participant" rules={[{ required: true }]}>
        <Select
          showSearch
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
      <Form.List
        name="projs"
        rules={[
          {
            validator: (rule: any, value?: any[]) =>
              value?.length ? Promise.resolve() : Promise.reject(Error('至少需要一个项目')),
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, i) => (
              <div key={field.key}>
                <Divider />
                <Form.Item
                  key="id"
                  name={[field.name, 'id']}
                  label="项目"
                  rules={[{ required: true }]}
                >
                  <Select
                    showSearch
                    filterOption={(input, option) =>
                      option!.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {resData?.projs.map((u) => (
                      <Select.Option key={u.id} value={u.id}>
                        {u.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="金额" name={[field.name, 'amount']} rules={[{ required: true }]}>
                  <InputNumber min={0} />
                </Form.Item>
                <Form.Item label="类型" name={[field.name, 'type']} rules={[{ required: true }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="描述" name={[field.name, 'description']}>
                  <Input.TextArea autoSize />
                </Form.Item>
                <div key={field.key} style={{ textAlign: 'center' }}>
                  <MinusCircleOutlined
                    className="dynamic-delete-button"
                    onClick={() => remove(i)}
                  />
                </div>
              </div>
            ))}
            <Form.Item key="action">
              <Button type="dashed" onClick={() => add({})} icon={<PlusOutlined />}>
                添加项目
              </Button>
              <Form.ErrorList errors={errors} />
            </Form.Item>
          </>
        )}
      </Form.List>
    </Form>
  );
};
