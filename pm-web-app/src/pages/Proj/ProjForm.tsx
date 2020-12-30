import React from 'react';
import { Form, Input, Modal, InputNumber, Select, Button, Divider } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { Project, Query } from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import { projType } from './utils';

const userQuery = gql`
  {
    subordinates {
      id
      name
    }
    myProjs {
      id
    }
  }
`;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

type ProjFormProps = {
  proj?: Project;
  visible: boolean;
  onCancel: () => void;
  onSubmit: (proj: Project) => void;
};

function ProjForm(props: ProjFormProps) {
  const [from] = Form.useForm<Project>();
  const { loading, data } = useQuery<Query>(userQuery);
  const handleSubmit = async () => {
    let fieldValues;
    try {
      fieldValues = await from.validateFields();
    } catch (e) {
      // 也发生错误，Form也已接管
      return undefined;
    }

    return props.onSubmit(fieldValues);
  };

  const isNew = !props.proj;

  const validator = (rule: any, value: string) =>
    isNew && data?.myProjs.find((sp) => sp.id === value)
      ? Promise.reject(Error('id已存在'))
      : Promise.resolve();
  return (
    <Modal
      destroyOnClose
      visible={props.visible}
      title="编辑项目"
      onCancel={props.onCancel}
      onOk={handleSubmit}
    >
      <Form {...layout} form={from} initialValues={props.proj}>
        <Form.Item label="ID" name="id" rules={[{ required: true }, { validator }]}>
          <Input disabled={!isNew} />
        </Form.Item>
        <Form.Item label="名称" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="预算（元）" name="budget" rules={[{ required: true }]}>
          <InputNumber min={0} />
        </Form.Item>
        <Form.Item label="类型" name="type" rules={[{ required: true }]}>
          <Select loading={loading}>
            {projType.map((s) => (
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
      </Form>
    </Modal>
  );
}

// 不可见时销毁ProjForm，主要销毁里面的userForm，Modal是在全局节点由destroyOnClose销毁
export default (props: ProjFormProps) => (props.visible ? <ProjForm {...props} /> : null);
