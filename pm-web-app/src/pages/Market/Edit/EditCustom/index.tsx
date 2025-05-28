import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef, useState } from 'react';
import { Button, Table, Popconfirm, Tag, Select, Space } from 'antd';
import type { Market as Mark, MarketInput, MarketProject, MarketProjectInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useProjStatus } from './hook';
import MarketForm from './MarketForm';
import MarketProjectForm from './MarketProjectForm';
import MarketProjectVisitForm from './MarketProjectVisitForm';
import ProjectVisitTable from './ProjectVisitTable';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { getStatusDisplayName } from './utils';
import { useModel } from 'umi';


const Market: React.FC<any> = () => {
  const { initialState } = useModel('@@initialState');
  const ref = useRef<FormDialogHandle<MarketInput>>(null);
  const projRef = useRef<FormDialogHandle<MarketProjectInput>>(null);
  const projVisitRef = useRef<FormDialogHandle<MarketProjectInput>>(null);
  const { isAdmin, markets, subordinates, groupsUsers, loading, setFilter, deleteMarket, pushMarket } = useProjStatus();
  const [editeMarket, setEditeMarket] = useState({});
  const [editeIndex, setEditeIndex] = useState(0);

  const editHandle = (mark: Mark) => {
    ref.current?.showDialog({ ...mark, participants: mark.participants || [] });
  };
  const isLeader = (mark: Mark, proj?: MarketProject) => {
    if (mark.leader === initialState?.currentUser?.id) {
      return true
    } else if (proj && proj.leader === initialState?.currentUser?.id) {
      return true
    }
    return false
  }

  const columns = [
    {
      title: '客户名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Mark) => (
        <a onClick={() => editHandle({...record,type_:'edit'})}>{record.name}</a>
      ),
    },
    {
      title: '市场经理',
      dataIndex: 'leader',
      key: 'leader',
      render: (text: string, record: Mark) => {
        const user = subordinates.find((user) => user.id === record.leader)
        return user ? user.enabled ? user.name : user.name+'(已离职)' : '---'
      },
    },
    {
      title: '参与人',
      dataIndex: 'participants',
      key: 'participants',
      render: (text: string, record: Mark) => {
        return subordinates.filter(s => record.participants?.includes(s.id)).map(user => user.enabled ? user.name : user.name+'(已离职)').join(' ');
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
      key: 'action',//
      render: (id: string, record: Mark) => (
        <Space>
          <a hidden={!isLeader(record)}  key="archive" onClick={() => editeMarketProject(record, record.projects?.length ? record.projects?.length : 0)}>
            添加项目
          </a>
          <Popconfirm title="将会彻底删除源数据，且无法恢复？" okText="是" cancelText="否" onConfirm={() => deleteMarket(record.id)}>
            <a hidden={!isLeader(record)} key="delete">
              删除客户
            </a>
          </Popconfirm>
        </Space>
      ),
      fixed: 'right' as 'right',
    },
  ];

  const expandedRowRender2 = (record: MarketProject) => {
    return <ProjectVisitTable
              proj={record}
              subordinates={groupsUsers}
            />
  };

  const rowExpandable2 = (record: MarketProject) => {
    // @ts-ignore
    const isShow = isAdmin || isLeader(record.market, record)
    return isShow && record.visitRecord && record.visitRecord.length ? true : false
  }

  const expandedRowRender = (record: Mark) => {
    const expandedColumns = [
      {
        title: '项目名称',
        dataIndex: 'name',
        key: 'name',
        width: '15%'
      },
      {
        title: '项目规模',
        dataIndex: 'scale',
        key: 'scale',
        width: '10%'
      },
      {
        title: '项目经理',
        dataIndex: 'leader',
        key: 'leader',
        width: '10%',
        render: (leader: string) => subordinates.find((user) => user.id === leader)?.name,
      },
      {
        title: '项目状态',
        dataIndex: 'status',
        key: 'status',
        width: '10%',
        render: (status: string) => <Tag color={ status === 'track' ?  "success" : status === 'stop' ? 'default' : 'warning' }>{ getStatusDisplayName(status) }</Tag> ,
      },
      {
        title: '项目简介',
        dataIndex: 'introduct',
        key: 'introduct',
        width: '15%'
      },
      {
        title: '项目计划',
        dataIndex: 'plan',
        key: 'plan',
        width: '15%'
      },
      {
        title: '操作',
        dataIndex: 'index',
        key: 'index',//hidden={!isLeader(record, market)}
        render: (index: number, market: MarketProject) => (
          <Space>
            <a  key="edit" onClick={() => editeMarketProject(record, index)}>
              编辑项目
            </a>
            <a hidden={!isLeader(record, market)} key="editVisit" onClick={() => editeMarketVisitProject(record, index)}>
              编辑拜访记录
            </a>
            <Popconfirm title="将会彻底删除源数据，且无法恢复？" okText="是" cancelText="否" onConfirm={() => deleteMarketProject(record, index)}>
              <a hidden={!isLeader(record, market)} key="delete">
                删除项目
              </a>
            </Popconfirm>
          
          </Space>
        ),
        fixed: 'right' as 'right',
        with: '15%'
      },
    ];

    const data = record.projects?.map((market, index) => {
      return { ...market, index, marketId: record.id, market: record }
    })
    
    return <Table
            rowKey={(record) => record.name}
            columns={expandedColumns}
            dataSource={ data }
            pagination={false}
            expandable={{ expandedRowRender: expandedRowRender2, rowExpandable: rowExpandable2 }}
            size="middle"
          />
  };
  const rowExpandable = (record: Mark) => {
    return record.projects && record.projects.length ? true : false
  }

  const editeMarketProject = (record: Mark, index: number) => {
    setEditeMarket(record)
    setEditeIndex(index);
    const participants = record.participants ? [...record.participants, record.leader] : [record.leader]
    const editProj = record.projects ? {
      ...record.projects[index],
      participants
    } : {
      participants
    }
    // @ts-ignore
    projRef.current?.showDialog(editProj);
  }

  const deleteMarketProject = (record: Mark, index: number) => {
    let tempMarket: MarketInput = JSON.parse(JSON.stringify(record))
    tempMarket.projects?.splice(index, 1);
    pushMarket(tempMarket)
  }


  const editeMarketVisitProject = (record: Mark, index: number) => {
    setEditeMarket(record)
    setEditeIndex(index);
    projVisitRef.current?.showDialog(record.projects ?  {
      ...record.projects[index],
    } : undefined);
  }

  return (
    <PageContainer
      extra={[
        isAdmin ?
        <Select key='filter' placeholder="请选择市场人员" allowClear onChange={setFilter}>
          {groupsUsers.map((u) => (
            <Select.Option key={u.id} value={u.id}>
              {u.enabled ? u.name : u.name+'(已离职)'}
            </Select.Option>
          ))}
        </Select> : ''
        ,
        <Button key="create" type="primary" onClick={() => ref.current?.showDialog({type_:'add'})}>
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
        title="编辑客户"
        width={1000}
        submitHandle={(v: MarketInput) => {
          if (v.leader !== initialState?.currentUser?.id) return Promise.resolve()
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
      <DialogForm
        ref={projVisitRef}
        title="编辑拜访记录"
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
        {MarketProjectVisitForm}
      </DialogForm>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Market />
  </ApolloProvider>
);
