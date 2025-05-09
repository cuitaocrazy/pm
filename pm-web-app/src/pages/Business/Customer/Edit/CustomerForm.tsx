import React, { useState } from 'react';
import { Form, Input, Switch, Select, Row, Col, Divider, Button } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { SelectProps } from 'antd';
import type {
  Mutation,
  CustomerInput,
  MutationPushTagsArgs,
  Query,
  QueryGroupsUsersArgs,
} from '@/apollo';
import { gql, useQuery, useMutation } from '@apollo/client';
import type { FormInstance } from 'antd/lib/form';
import { useBaseState } from '@/pages/utils/hook';
import { useModel } from 'umi';
// import { gql, useLazyQuery, useMutation } from '@apollo/client';

const { Option } = Select;

const userQuery = gql`
  query GetGroupUsers($groups: [String!]) {
    groupsUsers(groups: $groups) {
      id
      name
    }
    tags
    subordinates {
      id
      name
    }
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
  const { data: resData } = useQuery<Query, QueryGroupsUsersArgs>(userQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      groups: [
        '/软件事业部/市场组'],
    },
  });

  const [pushTagsHandle] = useMutation<Mutation, MutationPushTagsArgs>(pushTagsGql);

  const { initialState } = useModel('@@initialState');
  const [tags, setTags] = useState(resData?.tags || []);
  const { orgCode, zoneCode } = useBaseState();
  let options: SelectProps['options'] = [];

  const getOptions = () => {
    options = [...new Set(resData?.tags.concat(tags))].map((tag) => {
      return {
        value: tag,
        label: tag,
      };
    });
    return options;
  };

  const handleTagsChange = async (value: any, option: any) => {
    await pushTagsHandle({
      variables: {
        tags: value,
      },
    });
    setTags([...new Set(tags.concat(value))]);
  };

  const onContactChange = (filed: any) => {
    let tempContact = form.getFieldValue('contacts');
    tempContact[filed.name].recorder = initialState?.currentUser?.id;
    form.setFieldValue('contacts', tempContact);
  };

  return (
    <Form {...layout} form={form} initialValues={data}>
      <Form.Item label="ID" name="id" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="客户名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="所属行业" name="industryCode" rules={[{ required: true }]}>
        <Select key="code" placeholder="选择行业">
          {Object.keys(orgCode).map((k) => (
            <Option key={k} value={k}>
              {orgCode[k]}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="所属区域" name="regionCode" rules={[{ required: true }]}>
        <Select key="code" placeholder="选择区域">
          {Object.keys(zoneCode).map((k) => (
            <Option key={k} value={k}>
              {zoneCode[k]}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="销售负责人" name="salesman" rules={[{ required: true }]}>
        <Select mode="multiple">
          {resData?.groupsUsers.map((u) => (
            <Select.Option key={u.id} value={u.id}>
              {u.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="办公地址" name="officeAddress" rules={[{ required: false }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="是否启用"
        name="enable"
        valuePropName="checked"
        rules={[{ required: true }]}
      >
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
                {fields.map((field: any, i) => (
                  <div key={field.key} style={{ textAlign: 'center' }}>
                    <Divider>联系人 {i + 1}</Divider>
                    <Form.Item
                      labelCol={{ span: 6, offset: 0 }}
                      key="recorder"
                      label="录入人"
                      name={[field.name, 'recorder']}
                      rules={[{ required: true }]}
                    >
                      <Select disabled>
                        {resData?.subordinates.map((u) => (
                          <Select.Option key={u.id} value={u.id}>
                            {u.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 6, offset: 0 }}
                      key="name"
                      label="联系人姓名"
                      name={[field.name, 'name']}
                      rules={[{ required: true }]}
                    >
                      <Input onChange={() => onContactChange(field)} />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 6, offset: 0 }}
                      key="phone"
                      label="联系人电话"
                      name={[field.name, 'phone']}
                      rules={[{ required: true }]}
                    >
                      <Input onChange={() => onContactChange(field)} />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 6, offset: 0 }}
                      label="联系人标签"
                      key="tags"
                      name={[field.name, 'tags']}
                      rules={[{ required: true }]}
                      extra="请包括部门和职位信息，例：卡部主管"
                    >
                      <Select
                        mode="tags"
                        style={{ width: '100%' }}
                        placeholder="输入/选择标签"
                        onChange={handleTagsChange}
                        options={getOptions()}
                      />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 6, offset: 0 }}
                      key="remark"
                      label="备注"
                      name={[field.name, 'remark']}
                      rules={[{ required: false }]}
                      extra="可以填写该联系人所在地等信息"
                    >
                      <Input onChange={() => onContactChange(field)} />
                    </Form.Item>
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      onClick={() => remove(i)}
                    />
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => {add({recorder: initialState?.currentUser?.id})}} icon={<PlusOutlined />}>
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
