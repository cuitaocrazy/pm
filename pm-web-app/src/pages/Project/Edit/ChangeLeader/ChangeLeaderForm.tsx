/*
 * @Author: 13718154103 1161593628@qq.com
 * @Date: 2024-11-21 09:20:39
 * @LastEditors: 13718154103 1161593628@qq.com
 * @LastEditTime: 2024-12-15 15:07:38
 * @FilePath: /pm/pm-web-app/src/pages/Project/Edit/ChangeLeader/ChangeLeaderForm.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React from 'react';
import type { FormInstance } from 'antd/es/form/Form';
import { Form, Select, Checkbox, Row, Col } from 'antd';
import type { ChangePmInput, User } from '@/apollo';

const layout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 16 },
};

export default (
    users: User[],
    isRemovePart: boolean,
    setReomvePart: (isRemovePart: boolean) => void,
  ) =>
  (form: FormInstance<ChangePmInput>, data?: ChangePmInput) => {
    return (
      <Form {...layout} form={form} initialValues={data}>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item label="新项目经理" name="leader" rules={[{required:true}]}>
              <Select>
                {users?.map((u) => (
                  <Select.Option key={u.id} value={u.id}>
                    {u.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={24}>
          <Col span={24}>
            <Form.Item name="isRemovePart" hidden>
              <Checkbox checked={isRemovePart} onChange={() => setReomvePart(!isRemovePart)}>
                将原项目经理从项目成员中移除
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  };
