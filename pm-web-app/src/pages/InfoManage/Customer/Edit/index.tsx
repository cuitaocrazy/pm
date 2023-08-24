import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef } from 'react';
import { Button, Table, Switch, Tag } from 'antd';
import type { Customer as CustomerType, CustomerInput, CustomerContactInput, CustomerContact } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useCustomerState } from './hook';
import CustomerForm from './CustomerForm';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { useBaseState } from '@/pages/utils/hook';

const Customer: React.FC<any> = () => {
  const { customers, loading, subordinates, pushCustomer } = useCustomerState();
  const { industries, regions } = useBaseState();
  const ref = useRef<FormDialogHandle<CustomerInput>>(null);
  const editHandle = (customer: CustomerType) => {
    let contacts = customer.contacts as unknown as CustomerContactInput[]
    ref.current?.showDialog({ ...customer, contacts });
  }
  const changeEnable = (customer: CustomerType) => {
    pushCustomer({
      id: customer.id,
      name: customer.name,
      industryCode: customer.industryCode,
      regionCode: customer.regionCode,
      salesman: customer.salesman,
      contacts: [],
      enable: !customer.enable,
      remark: customer.remark,
    })
  }
  const columns = [
    {
      title: '客户名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: CustomerType) => (
        <a onClick={() => editHandle(record)}>{record.name}</a>
      ),
      width: '10%',
    },
    {
      title: '所属行业',
      dataIndex: 'industryCode',
      key: 'industryCode',
      render: (text: string, record: CustomerType) => {
        return industries?.find((statu) => statu.code === record.industryCode)?.name;
      },
    },
    {
      title: '所属区域',
      dataIndex: 'regionCode',
      key: 'regionCode',
      render: (text: string, record: CustomerType) => {
        return regions?.find((statu) => statu.code === record.regionCode)?.name;
      },
    },
    {
      title: '销售负责人',
      dataIndex: 'salesman',
      key: 'salesman',
      render: (text: string, record: CustomerType) => {
        return subordinates.find((user) => user.id === record.salesman)?.name;
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '是否启用',
      dataIndex: 'enable',
      key: 'enable',
      render: (text: string, record: CustomerType) => (
        <Switch checked={record.enable} onChange={() => changeEnable(record)} />
      )
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
  const expandedRowRender = (record: CustomerType) => {
    const expandedColumns = [
      {
        title: '客户联系人',
        dataIndex: 'name',
        key: 'name',
        width: '30%'
      },
      {
        title: '联系方式',
        dataIndex: 'phone',
        key: 'phone',
        width: '20%'

      },
      {
        title: '标签',
        dataIndex: 'tags',
        key: 'tags',
        render: (text: string, record: CustomerContact) => {
          const tagMap = record.tags.map(tag => {
            return <Tag color="cyan" key={tag}>{ tag }</Tag>
          }) 
          return tagMap
        },
      }
    ];

    const data = record.contacts.map(cont => {
      const { name, phone, tags } = cont
      return { key: name + phone, name, phone, tags  }
    })
    
    return <Table columns={expandedColumns} dataSource={data} pagination={false} size="middle"/>
  };
  const rowExpandable = (record: CustomerType) => {
    return record.contacts.length ? true : false
  }
  return (
    <PageContainer
      extra={[
        <Button
          key="create"
          type="primary"
          onClick={() =>
            ref.current?.showDialog({
              name: '',
              industryCode: '',
              regionCode: '',
              salesman: '',
              contacts: [],
              enable: true,
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
        dataSource={customers}
        pagination={false}
        expandable={{ expandedRowRender, rowExpandable }}
        size="middle"
      />
      <DialogForm submitHandle={(v: CustomerInput) => pushCustomer(v)} ref={ref} title="编辑行业">
        {CustomerForm}
      </DialogForm>
    </PageContainer>
  );
}

export default () => (
  <ApolloProvider client={client}>
    <Customer />
  </ApolloProvider>
);
