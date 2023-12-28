import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef } from 'react';
import { Button, Table, Popconfirm, Tag, Input, Space, Radio, Badge } from 'antd';
import type { Project as Proj, ProjectInput, ActiveInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useProjStatus } from './hook';
import ProjForm from './ProjForm';
import ProjActiveForm from './ProjActiveForm';
import DailyModal from './DailyModal';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { useBaseState } from '@/pages/utils/hook';
import { getStatusDisplayName, projStatus } from './utils';
import { history } from 'umi';

const Project: React.FC<any> = () => {
  const isAdmin = history?.location.pathname.split('/').pop() === 'allEdit' ? true : false;
  const ref = useRef<FormDialogHandle<ProjectInput>>(null);
  const dailyRef = useRef<FormDialogHandle<Proj>>(null);
  const activeRef = useRef<FormDialogHandle<ProjectInput>>(null);

  const { projs, todoProjs, subordinates, customers, projectAgreements, loading, archive,
    setArchive, setFilter, archiveProj, deleteProj, pushProj } = useProjStatus();
  const { status, orgCode, zoneCode, projType, buildProjName,groupType } = useBaseState();

  const editHandle = (proj: Proj, openRef: any) => {
    const agree = projectAgreements.filter(item => item.id === proj.id)
    const { actives, ...pro } = proj;
    openRef.current?.showDialog({
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
      width: 120
    },
    {
      title: '项目ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string, record: Proj) => (
        <div>
          <a onClick={() => editHandle(record, ref)}>{buildProjName(record.id, record.name)} </a>
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
        },
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
      title: '项目部门',
      dataIndex: 'group',
      key: 'group',
      width: '200px',
      render: (status: string) =>  {
        let name = status&&status.split('/')[2];
        return name;
      },
      filters: groupType.map((s) => ({ text: s.toString().split('/')[2], value: s })),
      onFilter: (value: string | number | boolean, record: Proj) => record.group === value,
    },
//{
//   text: '部门',
//   value: 'groupType',
//   children: Object.keys(groupType).map((s) => ({ text: groupType[s], value: s })),
// },
    {
      title: '预算人天',
      dataIndex: 'estimatedWorkload',
      key: 'estimatedWorkload',
      width: '80px',
      render: (text: string, record: Proj) => <Tag color="cyan">{ text ? text : 0 }</Tag>,
    },
    {
      title: '实际人天',
      dataIndex: 'timeConsuming',
      key: 'timeConsuming',
      width: '80px',
      render: (text: number, record: Proj) =>
        <Button type="text" onClick={() => dailyRef.current?.showDialog(record)}><Tag color="cyan">{ text ? ((text - 0) / 8).toFixed(2) : 0 }</Tag></Button>,
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
    //   title: '采购成本(元)',
    //   dataIndex: 'actualCost',
    //   key: 'actualCost',
    // },
    // {
    //   title: '税后金额(元)',
    //   dataIndex: 'taxAmount',
    //   key: 'taxAmount',
    // },
    // {
    //   title: '创建日期',
    //   dataIndex: 'createDate',
    //   key: 'createDate',
    //   render: (createDate: string) => {
    //     return moment(createDate, 'YYYYMMDD').format('YYYY年MM月DD日');
    //   },
    //   width: 150,
    // },
    // {
    //   title: '更新时间',
    //   dataIndex: 'updateTime',
    //   key: 'updateTime',
    //   render: (updateTime: string) => {
    //     return moment(updateTime, 'YYYYMMDD HH:mm:ss').format('YYYY年MM月DD日 HH:mm:ss');
    //   },
    //   width: 200,
    // },
    {
      title: '确认年度',
      dataIndex: 'confirmYear',
      key: 'confirmYear',
      render: (confirmYear: string) => {
        return confirmYear;
      },
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      render: (id: string, record: Proj) => (
        <Space>
          <a key="archive" onClick={() => {editHandle(record, activeRef)}}>
            添加项目活动
          </a>
          <Popconfirm title="将项目数据归档，只能到归档列表查看！" okText="是" cancelText="否" onConfirm={() => archiveProj(record.id)}>
            <a key="archive" hidden={record.isArchive}>
              归档
            </a>
          </Popconfirm>
          <Popconfirm title="将会彻底删除源数据，且无法恢复？" okText="是" cancelText="否" onConfirm={() => deleteProj(record.id)}>
            <a key="delete" hidden={record.isArchive}>
              删除
            </a>
          </Popconfirm>
        </Space>
      ),
      fixed: 'right' as 'right',
      width: 180,
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

  return (
    <PageContainer
      extra={[
        <Radio.Group key="archive" value={archive} onChange={e => setArchive(e.target.value)}>
          <Radio.Button value="0">项目</Radio.Button>
          {isAdmin?
            <Radio.Button value="1">归档项目</Radio.Button>
            :
            <Radio.Button value="2">
              <Badge count={todoProjs.length}>
                待办项目
              </Badge>
            </Radio.Button>
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
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={ !isAdmin&&archive === "2" ? todoProjs : projs}
        scroll={{ x: 1500 }}
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
        ref={dailyRef}
        title="查看日报"
        width={1300}
      >
        {DailyModal}
      </DialogForm>
      <DialogForm
        ref={activeRef}
        title="项目活动管理"
        width={1000}
        submitHandle={(v: ProjectInput) => pushProj(v)}
      >
        {ProjActiveForm}
      </DialogForm>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Project />
  </ApolloProvider>
);
