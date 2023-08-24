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
  const { projs, todoProjs, subordinates, customers, agreements, projectAgreements, loading, archive, 
    setArchive, setFilter, archiveProj, deleteProj, pushProj, restartProj } = useProjStatus();
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
      width: '100%'
    }
  ];

  const expandedRowRender = (nameObj: any) => {
    const columns = [
      {
        title: '项目名称',
        dataIndex: 'name',
        key: 'name',
        render: (text: string, record: Proj) => (
          <div>
            <a onClick={() => editHandle(record)}>{buildProjName(record.id, text)} </a>
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
        title: '项目负责人',
        dataIndex: 'leader',
        key: 'leader',
        render: (text: string, record: Proj) => {
          return subordinates.find((user) => user.id === record.leader)?.name;
        },
        width: 110,
      },
      {
        title: '市场负责人',
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
        title: '总人天数',
        dataIndex: 'allTime',
        key: 'allTime',
        width: '80px',
        render: (text: string, record: Proj) => <Tag color="cyan">{ text }</Tag>,
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
      // {
      //   title: '合同金额(元)',
      //   dataIndex: 'contAmount',
      //   key: 'contAmount',
      // },
      // {
      //   title: '确认收入金额(元)',
      //   dataIndex: 'recoAmount',
      //   key: 'recoAmount',
      // },
      // {
      //   title: '项目预算(元)',
      //   dataIndex: 'projBudget',
      //   key: 'projBudget',
      // },
      // {
      //   title: '预算费用(元)',
      //   dataIndex: 'budgetFee',
      //   key: 'budgetFee',
      // },
      // {
      //   title: '预算成本(元)',
      //   dataIndex: 'budgetCost',
      //   key: 'budgetCost',
      // },
      // {
      //   title: '实际费用(元)',
      //   dataIndex: 'actualFee',
      //   key: 'actualFee',
      // },
      // {
      //   title: '实际成本(元)',
      //   dataIndex: 'actualCost',
      //   key: 'actualCost',
      // },
      // {
      //   title: '税后金额(元)',
      //   dataIndex: 'taxAmount',
      //   key: 'taxAmount',
      // },
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
          
            <Popconfirm title="将项目数据归档，只能到归档列表查看！" okText="是" cancelText="否" onConfirm={() => archiveProj(id)}>
              <a key="archive" hidden={record.isArchive}>
                归档
              </a>
            </Popconfirm>
            <Popconfirm title="将会彻底删除源数据，且无法恢复？" okText="是" cancelText="否" onConfirm={() => deleteProj(id)}>
              <a key="delete" hidden={record.isArchive}>
                删除
              </a>
            </Popconfirm>
            {record.status === 'endProj' ?
              <Popconfirm title="是否将项目阶段状态重置为未启动状态？" okText="是" cancelText="否" onConfirm={() => restartProj(id)}>
                <a key="archive">
                  重置阶段状态
                </a>
              </Popconfirm> : ''
            }
          </Space>
        ),
        fixed: 'right' as 'right',
        width: 120,
      },
    ];

    if (!isAdmin&&archive === "2") {
      columns.splice(2, 0, {
        title: '待办内容',
        dataIndex: 'todoTip',
        key: 'todoTip',
        width: 180,
        render: (text: string, record: Proj) => text,
      });
    }
    return <Table rowKey={(record) => record.id} columns={columns} dataSource={nameObj.projects} pagination={false} />;
  };

  return (
    <PageContainer
      extra={[
        <Radio.Group key="archive" value={archive} onChange={e => setArchive(e.target.value)}>
          <Radio.Button value="0">项目</Radio.Button>
          {isAdmin? 
            <Radio.Button value="1">归档项目</Radio.Button>
            :
            <Radio.Button value="2">待办项目({todoProjs.length})</Radio.Button>
          }
        </Radio.Group>
        ,
        <Input
          key="search"
          addonBefore="项目名称"
          allowClear
          onChange={(e) => setFilter(e.target.value)}
        />,
        <Button key="create" type="primary" onClick={() => ref.current?.showDialog()}>
          新建
        </Button>
      ]}
    >
      <Table
        loading={loading}
        rowKey={(record) => record.name}
        expandable={{ expandedRowRender, defaultExpandedRowKeys: ['0'] }}
        columns={columns}
        dataSource={ !isAdmin&&archive === "2" ? todoProjs : projs}
        scroll={{ x: 1500 }}
        size="middle"
      />
      <DialogForm
        ref={ref}
        title="编辑项目"
        width={1000}
        submitHandle={(v: ProjectInput) => {  
          if (editProj?.status === 'endProj') { return Promise.resolve() }
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
