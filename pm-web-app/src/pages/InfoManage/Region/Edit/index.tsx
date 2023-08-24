import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef } from 'react';
import { Button, Table, Switch } from 'antd';
import type { Region as RegionType, RegionInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useRegionState } from './hook';
import RegionForm from './RegionForm';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';

function getColumns(
  createHandle: (region: RegionType) => void,
  editHandle: (region: RegionType) => void,
  deleteHandle: (id: string) => void,
  changeEnable:(region: RegionType) => void,
) {
  return [
    {
      title: '区域名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: RegionType) => (
        <a onClick={() => editHandle(record)}>{record.name}</a>
      ),
      width: '20%',
    },
    {
      title: '区域编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '是否启用',
      dataIndex: 'enable',
      key: 'enable',
      render: (text: string, record: RegionType) => (
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
    // {
    //   title: '操作',
    //   dataIndex: 'id',
    //   key: 'action',
    //   render: (id: string, record: IndustryType) => (
    //     <Space>
    //       <Popconfirm title="是否删除？" okText="是" cancelText="否" onConfirm={() => deleteHandle(id)}>
    //         <a key="delete">
    //           删除
    //         </a>
    //       </Popconfirm>
    //     </Space>
    //   ),
    // },
  ];
}
function Region() {
  const { regions, loading, deleteRegion, pushRegion } = useRegionState();
  const ref = useRef<FormDialogHandle<RegionInput>>(null);
  const columns = getColumns(
    (region) => {
      ref.current?.showDialog({
        name: '',
        code: '',
        enable: true,
        sort: 0,
        remark: '',
      });
    },
    (region) => {
      ref.current?.showDialog({ ...region });
    },
    deleteRegion,
    (region) => {
      pushRegion({
        id: region.id,
        name: region.name,
        code: region.code,
        enable: !region.enable,
        sort: region.sort,
        remark: region.remark,
      })
    }
  );
  return (
    <PageContainer
      extra={[
        <Button
          key="create"
          type="primary"
          onClick={() =>
            ref.current?.showDialog({
              name: '',
              code: '',
              enable: true,
              sort: 0,
              remark: '',
            })
          }
        >
          新建
        </Button>,
      ]}
    >
      <Table
        loading={loading}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={regions}
        pagination={false}
        size="middle"
      />
      <DialogForm submitHandle={(v: RegionInput) => pushRegion(v)} ref={ref} title="编辑行业">
        {RegionForm}
      </DialogForm>
    </PageContainer>
  );
}

export default () => (
  <ApolloProvider client={client}>
    <Region />
  </ApolloProvider>
);
