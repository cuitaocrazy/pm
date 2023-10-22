import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef, useState } from 'react';
import { Button, Table, Popconfirm, Tag, Input, Space, Radio } from 'antd';
import type { Project as Proj, ProjectInput, ActiveInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useProjStatus } from './hook';
import ProjForm from './ProjForm';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { useBaseState } from '@/pages/utils/hook';
import { getStatusDisplayName, projStatus } from './utils';
import { history } from 'umi';

const Project: React.FC<any> = () => {
  const isAdmin = history?.location.pathname.split('/').pop() === 'allEdit' ? true : false;
  const ref = useRef<FormDialogHandle<ProjectInput>>(null);
  const { projs, projectAgreements, loading, deleteProj, pushProj } = useProjStatus();
  const { status, orgCode, zoneCode, projType, buildProjName } = useBaseState();
  const [editProj, setEditProj] = useState<Proj>();

  const editHandle = (proj: Proj) => {
    const agree = projectAgreements.filter(item => item.id === proj.id)
    const { actives, ...pro } = proj;
    setEditProj(proj)
    ref.current?.showDialog({ 
      ...pro,
      contName: agree.length ? agree[0].agreementId : '', 
      actives: (actives as ActiveInput[])?.map(item => {
        // @ts-ignore
        item.date = moment(item.date)
        return item
      }),
      // @ts-ignore
      startTime: pro.startTime && moment(pro.startTime),
      // @ts-ignore
      endTime: pro.endTime && moment(pro.endTime),
      // @ts-ignore
      productDate: pro.productDate && moment(pro.productDate),
      // @ts-ignore
      acceptDate: pro.acceptDate && moment(pro.acceptDate),
    });
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Proj) => (
        <div>{text}</div>
      ),
      width: 120
    },
    {
      title: '项目ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string, record: Proj) => (
        <div>
          <a onClick={() => editHandle(record)}>{buildProjName(record.id, record.name)} </a>
        </div>
      ),
      filters: [
        {
          text: '行业',
          value: 'orgCode',
          children: Object.keys(orgCode).map((s) => ({ text: orgCode[s], value: s })),
        },
        {
          text: '区域',
          value: 'zoneCode',
          children: Object.keys(zoneCode).map((s) => ({ text: zoneCode[s], value: s })),
        },
        {
          text: '类型',
          value: 'projType',
          children: Object.keys(projType).map((s) => ({ text: projType[s], value: s })),
        }
      ],
      onFilter: (value: string | number | boolean, record: Proj) => record.id.indexOf(value + '') > -1,
      width: 250
    },
    {
      title: '总人天数',
      dataIndex: 'timeConsuming',
      key: 'timeConsuming',
      width: '80px',
      render: (text: string, record: Proj) => <Tag color="cyan">{ text ? text : 0 }</Tag>,
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (createDate: string) => {
        return moment(createDate, 'YYYYMMDD').format('YYYY年MM月DD日');
      },
      width: 150,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (updateTime: string) => {
        return moment(updateTime, 'YYYYMMDD HH:mm:ss').format('YYYY年MM月DD日 HH:mm:ss');
      },
      width: 200,
    },
    {
      title: '操作',
      key: 'action',
      render: (id: string, record: Proj) => (
        <Space>
          <Popconfirm title="将会彻底删除源数据，且无法恢复？" okText="是" cancelText="否" onConfirm={() => deleteProj(record.id)}>
            <a key="delete">
              删除
            </a>
          </Popconfirm>
        </Space>
      ),
      fixed: 'right' as 'right',
      width: 120,
    },
  ];

  return (
    <PageContainer
      extra={[
        <Button key="create" type="primary" onClick={() => ref.current?.showDialog()}>
          新建
        </Button>
      ]}
    >
      <Table
        loading={loading}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={projs}
        scroll={{ x: 1500 }}
        size="middle"
      />
      <DialogForm
        ref={ref}
        title="编辑项目"
        width={1000}
        submitHandle={(v: ProjectInput) => {  
          // if (editProj?.status === 'endProj') { return Promise.resolve() }
          return pushProj(v)
        } }
      >
        {ProjForm}
      </DialogForm>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Project />
  </ApolloProvider>
);
