import React, { useState } from 'react';
import { Form, Input, Switch, Select, Row, Col, Divider, Button  } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { SelectProps } from 'antd';
import type { Mutation, CustomerInput, MutationPushTagsArgs, Query, QueryGroupUsersArgs} from '@/apollo';
import { gql, useQuery, useMutation } from '@apollo/client';
import type { FormInstance } from 'antd/lib/form';
import { useBaseState } from '@/pages/utils/hook';
// import { gql, useLazyQuery, useMutation } from '@apollo/client';

const { Option } = Select;

const userQuery = gql`
  query GetGroupUsers($group: String!) {
    groupUsers(group: $group) {
      id
      name
    }
    tags
  }
`;

const pushTagsGql = gql`
  mutation ($tags: [String!]!) {
    pushTags(tags: $tags)
  }
`;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export default (form: FormInstance<CustomerInput>, data?: CustomerInput) => {
  const { data: resData } = useQuery<Query, QueryGroupUsersArgs>(userQuery, { fetchPolicy: 'no-cache', variables: {
    group: '/项目二部/市场组',
  } });

  const [pushTagsHandle] = useMutation<Mutation, MutationPushTagsArgs>(
    pushTagsGql,
  );
  const [tags, setTags] = useState(resData?.tags || []);
  const { orgCode, zoneCode } = useBaseState();
  let options: SelectProps['options'] = [];

  const getOptions = () => {
    options = [...new Set(resData?.tags.concat(tags))].map(tag => {
      return {
        value: tag,
        label: tag
      }
    })
    return options
  }

  const handleTagsChange = async (value: any, option: any) => {
    await pushTagsHandle({
      variables: {
        tags: value,
      },
    })
    setTags([...new Set(tags.concat(value))])
  }

  return (
    <Form {...layout} form={form} initialValues={data}>
      <Form.Item label="ID" name="id" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="客户名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="所属行业" name="industryCode" rules={[{ required: true }]}>
        <Select
          key="code"
          placeholder="选择行业"
        >
          {Object.keys(orgCode).map((k) => (
            <Option key={k} value={k}>
              {orgCode[k]}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="所属区域" name="regionCode" rules={[{ required: true }]}>
      <Select
          key="code"
          placeholder="选择区域"
        >
          {Object.keys(zoneCode).map((k) => (
            <Option key={k} value={k}>
              {zoneCode[k]}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="销售负责人" name="salesman" rules={[{ required: true }]}>
        <Select>
          {resData?.groupUsers.map((u) => (
            <Select.Option key={u.id} value={u.id}>
              {u.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>     
      <Form.Item label="是否启用" name="enable" valuePropName="checked" rules={[{ required: true }]}>
        <Switch />
      </Form.Item>
      <Form.Item label="备注" name="remark" rules={[{ required: false }]}>
        <Input.TextArea />
      </Form.Item>
      <Row>
        <Col span={24}>
          <Form.List name="contacts">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, i) => (
                  <div key={field.key} style={{ textAlign: 'center' }}>
                    <Divider>联系人 {i + 1}</Divider>
                    <Form.Item
                      labelCol={{ span: 6, offset: 0 }}
                      key="name"
                      label="联系人姓名"
                      name={[field.name, 'name']}
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 6, offset: 0 }}
                      key="phone"
                      label="联系人电话"
                      name={[field.name, 'phone']}
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item 
                      labelCol={{ span: 6, offset: 0 }}
                      label="联系人标签" 
                      key="tags"
                      name={[field.name, 'tags']}
                    >
                      <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="输入/选择标签"
                        onChange={handleTagsChange}
                        options={getOptions()}
                      />
                    </Form.Item>
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      onClick={() => remove(i)}
                    />
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
        </Col>
      </Row>
    </Form>
  );
};