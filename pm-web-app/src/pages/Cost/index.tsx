import type { Cost as CostType, CostInput, ProjCostAllocationScale } from '@/apollo';
import { client } from '@/apollo';
import { PageContainer } from '@ant-design/pro-layout';
import { ApolloProvider } from '@apollo/client';
import { Space, Table } from 'antd';
import moment from 'moment';
import React, { useRef } from 'react';
import { useCostState } from './hook';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import CostForm from './CostForm';
import { Button } from 'antd';

function getColumns(editHandle: (cost: CostType) => void, deleteHandle: (id: string) => void) {
  return [
    {
      title: '金额(元)',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '人员',
      dataIndex: 'participants',
      key: 'participants',
      render: (users: { name: string }[]) => users.map((u) => u.name).join(', '),
    },
    {
      title: '项目',
      dataIndex: 'projs',
      key: 'projs',
      render: (proj: ProjCostAllocationScale[]) => proj.map((p) => p.proj.name).join(', '),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (createDate: string) => {
        return moment(createDate, 'YYYYMMDD').format('YYYY年MM月DD日');
      },
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      render: (id: string, record: CostType) => (
        <Space>
          <a key="edit" onClick={() => editHandle(record)}>
            编辑
          </a>
          <a key="delete" onClick={() => deleteHandle(id)}>
            删除
          </a>
        </Space>
      ),
    },
  ];
}

const Cost = () => {
  const state = useCostState();
  const ref = useRef<FormDialogHandle<CostInput>>(null);
  return (
    <PageContainer
      loading={state.loading}
      extra={[
        <Button key="create" type="primary" onClick={() => ref.current!.showDialog()}>
          创建费用
        </Button>,
      ]}
    >
      <Table
        columns={getColumns((c: CostType) => {
          ref.current!.showDialog({
            id: c.id,
            amount: c.amount,
            description: c.description,
            participants: c.participants.map((p) => p.id),
            projs: c.projs.map((p) => ({ id: p.proj.id, scale: p.scale })),
          });
        }, state.deleteCost)}
        dataSource={state.costs}
        rowKey={(record) => record.id}
      />

      <DialogForm submitHandle={(v: CostInput) => Promise.resolve()} ref={ref} title="费用编辑">
        {CostForm}
      </DialogForm>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Cost />
  </ApolloProvider>
);
