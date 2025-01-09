import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef,useState } from 'react';
import { Space, Button, Table, Switch } from 'antd';
import type { TreeStatu as StatuType, StatuInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useStatusState } from './hook';
import StatuForm from './StatuForm';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';

function getColumns(
  createHandle: (statu: StatuType) => void,
  editHandle: (statu: StatuType) => void,
  deleteHandle: (id: string) => void,
  changeEnable:(statu: StatuType) => void,
) {
  return [
    {
      title: '状态名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: StatuType) => (
        <a onClick={() => editHandle(record)}>{record.name}</a>
      ),
      width: '20%',
    },
    {
      title: '状态编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '是否启用',
      dataIndex: 'enable',
      key: 'enable',
      render: (text: string, record: StatuType) => (
        <Switch checked={record.enable} onChange={() => changeEnable(record)} />
      )
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
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
      key: 'action',
      render: (id: string, record: StatuType) => (
        <Space>
          <a key="creat" onClick={() => createHandle(record)}>
            新增子状态
          </a>
          {/* <Popconfirm title="是否删除？" okText="是" cancelText="否" onConfirm={() => deleteHandle(id)}>
            <a key="delete">
              删除
            </a>
          </Popconfirm> */}
        </Space>
      ),
    },
  ];
}
function Statu() {
  const { status, loading, deleteStatu, pushStatu } = useStatusState();
  const ref = useRef<FormDialogHandle<StatuInput>>(null);
  const [isAdd,setIsAdd] = useState(true)
  const columns = getColumns(
    (statu) => {
      ref.current?.showDialog({
        pId: statu.id ? statu.id : '0',
        name: '',
        code: '',
        enable: true,
        sort: 0,
        remark: '',
      });
      setIsAdd(true)
    },
    (statu) => {
      ref.current?.showDialog({ ...statu ,type_:'edit' });
      setIsAdd(false)
    },
    deleteStatu,
    (statu) => {
      pushStatu({
        id: statu.id,
        pId: statu.pId,
        name: statu.name,
        code: statu.code,
        enable: !statu.enable,
        sort: statu.sort,
        remark: statu.remark,
      })
    }
  );
  return (
    <PageContainer
      extra={[
        <Button
          key="create"
          type="primary"
          onClick={() =>{
            ref.current?.showDialog({
              pId: '0',
              name: '',
              code: '',
              enable: true,
              sort: 0,
              remark: '',
            })
            setIsAdd(true)
          }}
        >
          新建
        </Button>,
      ]}
    >
      <Table
        loading={loading}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={status}
        pagination={false}
        size="middle"
      />
      <DialogForm submitHandle={(v: StatuInput) => pushStatu(v)} ref={ref} title={isAdd == true ? '新增项目类型' : '编辑项目类型'}>
        {StatuForm}
      </DialogForm>
    </PageContainer>
  );
}

export default () => (
  <ApolloProvider client={client}>
    <Statu />
  </ApolloProvider>
);
