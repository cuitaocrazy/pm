import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef ,useState} from 'react';
import { Space, Button, Table, Popconfirm, Switch } from 'antd';
import type { Industry as IndustryType, IndustryInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useIndustryState } from './hook';
import IndustryForm from './IndustryForm';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';

function getColumns(
  createHandle: (industry: IndustryType) => void,
  editHandle: (industry: IndustryType) => void,
  deleteHandle: (id: string) => void,
  changeEnable:(industry: IndustryType) => void,
) {
  return [
    {
      title: '行业名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: IndustryType) => (
        <a onClick={() => editHandle(record)}>{record.name}</a>
      ),
      width: '20%',
    },
    {
      title: '行业编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '是否启用',
      dataIndex: 'enable',
      key: 'enable',
      render: (text: string, record: IndustryType) => (
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
function Industry() {
  const { industries, loading, deleteIndustry, pushIndustry } = useIndustryState();
  const ref = useRef<FormDialogHandle<IndustryInput>>(null);
  const [isAdd,setIsAdd] = useState(true)
  const columns = getColumns(
    (industry) => {
      ref.current?.showDialog({
        name: '',
        code: '',
        enable: true,
        sort: 0,
        remark: '',
      });
    },
    (industry) => {
      ref.current?.showDialog({ ...industry,type_:'edit'  });
      setIsAdd(false)
    },
    deleteIndustry,
    (industry) => {
      pushIndustry({
        id: industry.id,
        name: industry.name,
        code: industry.code,
        enable: !industry.enable,
        sort: industry.sort,
        remark: industry.remark,
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
        dataSource={industries}
        pagination={false}
        size="middle"
      />
      <DialogForm submitHandle={(v: IndustryInput) => pushIndustry(v)} ref={ref} title={isAdd == true ? '新增行业' : '编辑行业'}>
        {IndustryForm}
      </DialogForm>
    </PageContainer>
  );
}

export default () => (
  <ApolloProvider client={client}>
    <Industry />
  </ApolloProvider>
);
