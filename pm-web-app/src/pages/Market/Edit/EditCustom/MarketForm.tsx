import React from 'react';
import { Form, Input, Select, Button, Divider, Row, Col } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { MarketInput, Query, QueryGroupsUsersArgs } from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import { useModel } from 'umi';
import type { FormInstance } from 'antd/lib/form';

const userQuery = gql`
  query($groups: [String!]) {
    groupsUsers(groups: $groups) {
      id
      name
    }
    subordinates {
      id
      name
    }
    customers {
      id
      name
      industryCode
      regionCode
      enable
    }
    projs {
      id
    }
  }
`;

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 16 },
};

export default (form: FormInstance<MarketInput>, data?: MarketInput) => {
  const { loading, data: resData } = useQuery<Query, QueryGroupsUsersArgs>(userQuery, { fetchPolicy: 'no-cache', variables: {
    groups: ['/软件事业部/项目一部/市场组', '/软件事业部/项目二部/市场组', '/软件事业部/创新业务部/市场组'],
  } });
  const { initialState } = useModel('@@initialState');

  return (
    <Form 
      {...layout} 
      form={form} 
      initialValues={data || { leader: initialState?.currentUser?.id }} 
    >
      <Row>
        <Col span={8}>
         <Form.Item hidden label="ID" name="id">
            <Input />
          </Form.Item>
          <Form.Item label="机构名称" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="机构负责人" name="leader" rules={[{ required: true }]}>
            <Select disabled={!!data?.id } allowClear>
              {resData?.subordinates.map((u) => (
                <Select.Option key={u.id} value={u.id}>
                  {u.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.List name="contacts">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, i) => (
                  <div key={field.key} style={{ textAlign: 'center' }}>
                    <Divider>联系人 {i + 1}</Divider>
                    <Form.Item
                      labelCol={{ span: 3, offset: 0 }}
                      key="name"
                      label="姓名"
                      name={[field.name, 'name']}
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 3, offset: 0 }}
                      key="duties"
                      label="职务"
                      name={[field.name, 'duties']}
                    >
                      <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="输入职务"
                      />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 3, offset: 0 }}
                      key="phone"
                      label="电话"
                      name={[field.name, 'phone']}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 3, offset: 0 }}
                      key="remark"
                      label="备注"
                      name={[field.name, 'remark']}
                    >
                      <Input />
                    </Form.Item>
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      onClick={() => remove(i)}
                    />
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    添加机构联系人
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Col>
      </Row>
    </Form>
  );
};