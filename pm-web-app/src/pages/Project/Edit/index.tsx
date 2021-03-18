import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef } from 'react';
import { Button, Table } from 'antd';
import type { Project as Proj, ProjectInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useProjStatus } from './hook';
import ProjForm from './ProjForm';
import { getStatusDisplayName, projStatus } from './utils';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { buildProjName } from '../../utils';

function getColumns(editHandle: (proj: Proj) => void, deleteHandle: (id: string) => void) {
  return [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Proj) => (
        <a onClick={() => editHandle(record)}>{buildProjName(record.id, text)}</a>
      ),
      width: '50%',
    },
    {
      title: '预算(元)',
      dataIndex: 'budget',
      key: 'budget',
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
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: '120px',
      render: (status: string) => getStatusDisplayName(status),
      filters: projStatus.map((s) => ({ text: s[1], value: s[0] })),
      onFilter: (value: string | number | boolean, record: Proj) => record.status === value,
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'action',
      render: (id: string) => (
        <a key="delete" onClick={() => deleteHandle(id)}>
          删除
        </a>
      ),
    },
  ];
}
function Project() {
  const { projs, loading, deleteProj, pushProj } = useProjStatus();
  const ref = useRef<FormDialogHandle<ProjectInput>>(null);
  const columns = getColumns((proj) => {
    ref.current?.showDialog({
      id: proj.id,
      name: proj.name,
      budget: proj.budget,
      status: proj.status,
      participants: proj.participants,
      contacts: proj.contacts,
    });
  }, deleteProj);
  return (
    <PageContainer
      extra={[
        <Button key="create" type="primary" onClick={() => ref.current?.showDialog()}>
          新建
        </Button>,
      ]}
    >
      <Table
        loading={loading}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={projs}
      />
      <DialogForm submitHandle={(v: ProjectInput) => pushProj(v)} ref={ref} title="编辑项目">
        {ProjForm}
      </DialogForm>
    </PageContainer>
  );
}

export default () => (
  <ApolloProvider client={client}>
    <Project />
  </ApolloProvider>
);
