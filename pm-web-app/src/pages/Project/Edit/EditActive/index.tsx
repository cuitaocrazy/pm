import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef } from 'react';
import { Table, Tag, Input, Space } from 'antd';
import type { Project as Proj, ProjectInput, ActiveInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useProjStatus } from './hook';
import ProjForm from './ProjForm';
import ProjDetail from './ProjDetail';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { useBaseState } from '@/pages/utils/hook';
import { getStatusDisplayName, projStatus } from './utils';

const Project: React.FC<any> = () => {
  const ref = useRef<FormDialogHandle<ProjectInput>>(null);
  const detailRef = useRef<FormDialogHandle<ProjectInput>>(null);
  const { projs, subordinates, customers, agreements, projectAgreements, routeProjType, loading, setFilter, pushProj } = useProjStatus();
  const { status, orgCode, zoneCode, projType, buildProjName } = useBaseState();
  const editHandle = (proj: Proj) => {
    const agree = projectAgreements.filter(item => item.id === proj.id)
    const { actives, ...pro } = proj;
    ref.current?.showDialog({ 
      ...pro,
      contName: agree.length ? agree[0].agreementId : '', 
      actives: (actives as ActiveInput[]),
      // @ts-ignore
      acceptDate: pro.acceptDate && moment(pro.acceptDate),
    });
  };

  const detailHandle = (proj: Proj) => {
    const agree = projectAgreements.filter(item => item.id === proj.id)
    const { actives, ...pro } = proj;
    detailRef.current?.showDialog({ 
      ...pro,
      contName: agree.length ? agree[0].agreementId : '', 
      actives: (actives as ActiveInput[]),
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
        <div>
          <a onClick={() => detailHandle(record)}>{buildProjName(record.id, text)} </a>
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
      title: '项目经理',
      dataIndex: 'leader',
      key: 'leader',
      render: (text: string, record: Proj) => {
        return subordinates.find((user) => user.id === record.leader)?.name;
      },
      width: 110,
    },
    {
      title: '市场经理',
      dataIndex: 'salesLeader',
      key: 'salesLeader',
      render: (text: string, record: Proj) => {
        return subordinates.find((user) => user.id === record.salesLeader)?.name;
      },
      width: 110,
    },
    {
      title: '阶段状态',
      dataIndex: 'status',
      key: 'status',
      width: '120px',
      render: (status: string) => <Tag color={ status ? status === 'onProj' ? "success" : 'default' : 'warning' }>{ getStatusDisplayName(status) }</Tag> ,
      filters: projStatus.map((s) => ({ text: s[1], value: s[0] })),
      onFilter: (value: string | number | boolean, record: Proj) => record.status === value,
    },  
    {
      title: '客户名称',
      dataIndex: 'customer',
      key: 'customer',
      render: (text: string, record: Proj) => {
        return customers.find((cum) => cum.id === record.customer)?.name;
      },
      width:150,
    },
    {
      title: '合同名称',
      dataIndex: 'contName',
      key: 'contName',
      render: (text: string, record: Proj) => {
        const agree = projectAgreements.filter(item => item.id === record.id)
        return agree.length ? agreements.find((cum) => cum.id === agree[0].agreementId)?.name : ''
      },
      width:150,
    },
    {
      title: '项目状态',
      dataIndex: 'projStatus',
      key: 'projStatus',
      render: (text: string, record: Proj) => {
        return status?.find((statu) => statu.id === record.projStatus)?.name;
      },
      width:100,
    },
    {
      title: '合同状态',
      dataIndex: 'contStatus',
      key: 'contStatus',
      render: (text: string, record: Proj) => {
        return status?.find((statu) => statu.id === record.contStatus)?.name;
      },
      width:100,
    },
    {
      title: '验收状态',
      dataIndex: 'acceStatus',
      key: 'acceStatus',
      render: (text: string, record: Proj) => {
        return status?.find((statu) => statu.id === record.acceStatus)?.name;
      },
      width:100,
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
      dataIndex: 'id',
      key: 'action',
      render: (id: string, record: Proj) => (
        <Space>
          <a key="change" onClick={() => editHandle(record)}>
            添加{ routeProjType === 'SQ' ? '销售' : '巡检'  }活动
          </a>
          {/* <Popconfirm title="是否删除？" okText="是" cancelText="否" onConfirm={() => deleteProj(id)}>
            <a key="delete">
              删除
            </a>
          </Popconfirm> */}
        </Space>
      ),
      fixed: 'right' as 'right',
      width: 150,
    },
  ];

  return (
    <PageContainer
      extra={[
        <Input
          key="search"
          addonBefore="项目名称"
          allowClear
          onChange={(e) => setFilter(e.target.value)}
        />
      ]}
    >
      <Table
        loading={loading}
        scroll={{ x: 1100 }}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={projs}
        size="middle"
      />
      <DialogForm
        ref={ref}
        title="编辑项目"
        width={1000}
        submitHandle={(v: ProjectInput) => pushProj(v)}
      >
        {ProjForm}
      </DialogForm>
      <DialogForm
        ref={detailRef}
        title="项目详情"
        width={1000}
      >
        {ProjDetail}
      </DialogForm>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Project />
  </ApolloProvider>
);
