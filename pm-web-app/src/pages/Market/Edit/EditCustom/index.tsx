import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef, useState } from 'react';
import { Button, Table, Popconfirm, Tag, Input, Space } from 'antd';
import type { Market as Mark, MarketInput, MarketProject, MarketProjectInput, MarketProjectVisit } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useProjStatus } from './hook';
import MarketForm from './MarketForm';
import MarketProjectForm from './MarketProjectForm';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { getStatusDisplayName } from './utils';

const Market: React.FC<any> = () => {
  const ref = useRef<FormDialogHandle<MarketInput>>(null);
  const projRef = useRef<FormDialogHandle<MarketProjectInput>>(null);
  const { markets, subordinates, loading, deleteMarket, pushMarket } = useProjStatus();
  const [editeMarket, setEditeMarket] = useState({});
  const [editeIndex, setEditeIndex] = useState(0);

  const editHandle = (mark: Mark) => {
    ref.current?.showDialog({ ...mark });
  };

  const columns = [
    {
      title: '机构名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Mark) => (
        <a onClick={() => editHandle(record)}>{record.name}</a>
      ),
    },
    {
      title: '市场负责人',
      dataIndex: 'leader',
      key: 'leader',
      render: (text: string, record: Mark) => {
        return subordinates.find((user) => user.id === record.leader)?.name;
      },
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
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (updateTime: string) => {
        return moment(updateTime, 'YYYYMMDD HH:mm:ss').format('YYYY年MM月DD日 HH:mm:ss');
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (id: string, record: Mark) => (
        <Space>
          <a key="archive" onClick={() => editeMarketProject(record, record.projects?.length ? record.projects?.length : 0)}>
            添加项目
          </a>
          <Popconfirm title="将会彻底删除源数据，且无法恢复？" okText="是" cancelText="否" onConfirm={() => deleteMarket(record.id)}>
            <a key="delete">
              删除机构
            </a>
          </Popconfirm>
        </Space>
      ),
      fixed: 'right' as 'right',
    },
  ];

  const expandedRowRender = (record: Mark) => {
    const expandedColumns = [
      {
        title: '项目名称',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: '项目简介',
        dataIndex: 'introduct',
        key: 'introduct',
      },
      {
        title: '项目规模',
        dataIndex: 'scale',
        key: 'scale',
      },
      {
        title: '项目计划',
        dataIndex: 'plan',
        key: 'plan',
      },
      {
        title: '项目状态',
        dataIndex: 'status',
        key: 'status',
        render: (status: string) => <Tag color={ status === 'track' ?  "success" : status === 'stop' ? 'default' : 'warning' }>{ getStatusDisplayName(status) }</Tag> ,
      },
      {
        title: '操作',
        dataIndex: 'index',
        key: 'index',
        render: (index: number, market: MarketProject) => (
          <Space>
            <a key="archive" onClick={() => editeMarketProject(record, index)}>
              编辑项目
            </a>
            <Popconfirm title="将会彻底删除源数据，且无法恢复？" okText="是" cancelText="否" onConfirm={() => deleteMarketProject(record, index)}>
              <a key="delete">
                删除项目
              </a>
            </Popconfirm>
          </Space>
        ),
        fixed: 'right' as 'right',
        with: '10%'
      },
    ];

    const data = record.projects?.map((market, index) => {
      return { ...market, index }
    })
    
    return <Table rowKey={(record) => record.index} columns={expandedColumns} dataSource={data} pagination={false} size="middle"/>
  };
  const rowExpandable = (record: Mark) => {
    return record.projects && record.projects.length ? true : false
  }

  const editeMarketProject = (record: Mark, index: number) => {
    setEditeMarket(record)
    setEditeIndex(index);
    let visitRecord: MarketProjectVisit[] = []
    if (record.projects && record.projects[index] && record.projects[index].visitRecord) {
      visitRecord = record.projects[index].visitRecord?.map(item => {
        // @ts-ignore
        item.date = moment(item.date)
        return item
      }) || []
    }
    projRef.current?.showDialog(record.projects ?  {
      ...record.projects[index],
      visitRecord
    } : undefined);
  }

  const deleteMarketProject = (record: Mark, index: number) => {
    let tempMarket: MarketInput = JSON.parse(JSON.stringify(record))
    tempMarket.projects?.splice(index, 1);
    console.log(tempMarket)
    pushMarket(tempMarket)
  }

  return (
    <PageContainer
      extra={[
        // <Input
        //   key="name"
        //   addonBefore="机构名称"
        //   allowClear
        //   onChange={(e) => setFilter(e.target.value)}
        // />,
        <Button key="create" type="primary" onClick={() => ref.current?.showDialog()}>
          新建
        </Button>
      ]}
    >
      <Table
        loading={loading}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={ markets }
        expandable={{ expandedRowRender, rowExpandable }}
        // scroll={{ x: 1500 }}
        size="middle"
      />
      <DialogForm
        ref={ref}
        title="编辑机构"
        width={1000}
        submitHandle={(v: MarketInput) => {  
          return pushMarket(v)
        } }
      >
        {MarketForm}
      </DialogForm>
      <DialogForm
        ref={projRef}
        title="编辑项目"
        width={1000}
        submitHandle={(v: MarketProjectInput) => {
          let tempMarket: MarketInput = JSON.parse(JSON.stringify(editeMarket))
          if (tempMarket?.projects) {
            tempMarket.projects[editeIndex] = v
          } else {
            tempMarket.projects = [v]
          }
          return pushMarket(tempMarket)
        } }
      >
        {MarketProjectForm}
      </DialogForm>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Market />
  </ApolloProvider>
);
