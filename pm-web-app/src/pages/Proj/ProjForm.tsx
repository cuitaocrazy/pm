import React from 'react';
import { Form, Input, Modal, InputNumber, Select, Button } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { Project, Query } from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import { projStage } from './utils';

const userQuery = gql`
  {
    subordinates {
      id
      name
    }
  }
`;
type ProjFormProps = {
  proj?: Project;
  visible: boolean;
  onCancel: () => void;
  onSubmit: (proj: Promise<Project>) => void;
};

function ProjForm(props: ProjFormProps) {
  const [from] = Form.useForm<Project>();
  const { loading, data } = useQuery<Query>(userQuery);
  const handleSubmit = () => {
    props.onSubmit(from.validateFields());
  };

  return (
    <Modal
      destroyOnClose
      visible={props.visible}
      title="编辑项目"
      onCancel={props.onCancel}
      onOk={handleSubmit}
    >
      <Form form={from} initialValues={props.proj}>
        <Form.Item label="ID" name="id">
          <Input disabled={!!props.proj} />
        </Form.Item>
        <Form.Item label="名称" name="name">
          <Input />
        </Form.Item>
        <Form.Item label="预算" name="budget">
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item label="阶段" name="stage">
          <Select loading={loading}>
            {projStage.map((s) => (
              <Select.Option key={s[0]} value={s[0]}>
                {s[1]}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="参与人员" name="participants">
          <Select mode="multiple">
            {data?.subordinates.map((u) => (
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
                <Form.Item key={field.key}>
                  <Form.Item key="name" label="联系人" name={[field.name, 'name']}>
                    <Input />
                  </Form.Item>
                  <Form.Item key="duties" label="职务" name={[field.name, 'duties']}>
                    <Input />
                  </Form.Item>
                  <Form.Item key="phone" label="电话" name={[field.name, 'phone']}>
                    <Input />
                  </Form.Item>
                  <MinusCircleOutlined
                    className="dynamic-delete-button"
                    onClick={() => remove(i)}
                  />
                </Form.Item>
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
    </Modal>
  );
}

// 不可见时销毁ProjForm，主要销毁里面的userForm，Modal是在全局节点由destroyOnClose销毁
export default (props: ProjFormProps) => (props.visible ? <ProjForm {...props} /> : null);
