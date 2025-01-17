import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef } from 'react';
import { Button, Table, Popconfirm, Tag, Select, Space } from 'antd';
import type { MarketPlan as MarkPlan, MarketPlanInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useProjStatus } from './hook';
import MarketPlanForm from './MarketPlanForm';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { getStatusDisplayName } from './utils';

const Market: React.FC<any> = () => {
  const ref = useRef<FormDialogHandle<MarketPlanInput>>(null);
  const { isAdmin, marketPlans, subordinates, groupsUsers, loading, setFilter, deleteMarketPlan, pushMarketPlan, exportExcel } = useProjStatus();

  const editHandle = (mark: MarkPlan) => {
    ref.current?.showDialog({ ...mark });
  };

  const columns = [
    {
      title: '填写人',
      dataIndex: 'leader',
      key: 'leader',
      render: (text: string, record: MarkPlan) => {
        return subordinates.find((user) => user.id === record.leader)?.name;
      },
    },
    {
      title: '周号',
      dataIndex: 'week',
      key: 'week',
      render: (text: string, record: MarkPlan) => (
        <a onClick={() => editHandle(record)}>{ moment(record.week).format('YYYY-W周')}</a>
      ),
    },
    {
      title: '周开始日期',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (text: string, record: MarkPlan) => moment(record.week).weekday(0).format('YYYY-MM-DD'),
    },
    {
      title: '周结束日期',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text: string, record: MarkPlan) => moment(record.week).weekday(6).format('YYYY-MM-DD'),
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (createDate: string) => moment(createDate, 'YYYYMMDD').format('YYYY年MM月DD日'),
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (updateTime: string) => moment(updateTime, 'YYYYMMDD HH:mm:ss').format('YYYY年MM月DD日 HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (id: string, record: MarkPlan) => (
        <Space>
          <a key="delete" onClick={() => exportExcel(record)}>
            导出周报
          </a>
          <Popconfirm title="将会彻底删除源数据，且无法恢复？" okText="是" cancelText="否" onConfirm={() => deleteMarketPlan(record.id)}>
            <a key="delete">
              删除周计划
            </a>
          </Popconfirm>
        </Space>
      ),
      fixed: 'right' as 'right',
    },
  ];

  const expandedRowRender = (record: MarkPlan) => {
    const expandedColumns = [
      {
        title: '客户名称',
        dataIndex: 'marketName',
        key: 'marketName',
        width: '10%'
      },
      {
        title: '项目名称',
        dataIndex: 'projectName',
        key: 'projectName',
        width: '10%'
      },
      {
        title: '项目状态',
        dataIndex: 'projectStatus',
        key: 'projectStatus',
        width: '10%',
        render: (status: string) => <Tag color={ status === 'track' ?  "success" : status === 'stop' ? 'default' : 'warning' }>{ getStatusDisplayName(status) }</Tag> ,
      },
      {
        title: '项目规模',
        dataIndex: 'projectScale',
        key: 'projectScale',
        width: '10%'
      },
      {
        title: '项目计划',
        dataIndex: 'projectPlan',
        key: 'projectPlan',
        width: '14%'
      },
      {
        title: '上周工作',
        dataIndex: 'weekWork',
        key: 'weekWork',
        width: '23%'
      },
      {
        title: '本周计划',
        dataIndex: 'nextWeekPlan',
        key: 'nextWeekPlan',
        width: '23%'
      },
    ];

    const data = record.weekPlans?.map((plan, index) => {
      return { ...plan, index }
    })
    
    return <Table rowKey={(record) => record.index + record.marketName} columns={expandedColumns} dataSource={data} pagination={false} size="middle"/>
  };
  const rowExpandable = (record: MarkPlan) => {
    return record.weekPlans && record.weekPlans.length ? true : false
  }

  return (
    <PageContainer
      extra={[
        isAdmin ?
        <Select key='filter' placeholder="请选择市场人员" allowClear onChange={setFilter}>
          {groupsUsers.filter(item=>item.enabled == true).map((u) => (
            <Select.Option key={u.id} value={u.id}>
              {u.name}
            </Select.Option>
          ))}
        </Select> : ''
        ,
        <Button key="create" type="primary" onClick={() => ref.current?.showDialog()}>
          新建
        </Button>
      ]}
    >
      <Table
        loading={loading}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={ marketPlans }
        expandable={{ expandedRowRender, rowExpandable }}
        // scroll={{ x: 1500 }}
        size="middle"
      />
      <DialogForm
        ref={ref}
        title="编辑客户"
        width={1000}
        submitHandle={(v: MarketPlanInput) => {  
          return pushMarketPlan(v)
        } }
      >
        {MarketPlanForm}
      </DialogForm>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Market />
  </ApolloProvider>
);
