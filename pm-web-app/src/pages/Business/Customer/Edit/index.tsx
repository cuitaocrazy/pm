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
      officeAddress: customer.officeAddress,
      contacts: customer.contacts,
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
        <a onClick={() => editHandle({...record,type_:'edit'})}>{record.name}</a>
      ),
      width: '20%',
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
        
        let name = ''
        if (typeof record.salesman === 'string') {
          record.salesman = [record.salesman]
        }
        record.salesman.map((item, index) => {
          const user = subordinates.find((user) =>  user.id === item)
          if (index !== record.salesman.length - 1) {
            name += user ? user.enabled ? user?.name + ',' : user?.name + '(已离职)' + ','  : ''
          } else {
            name += user ? user.enabled ? user.name : user.name + '(已离职)' : ''
          }
        })
        return name;
      },
    },
    {
      title: '办公地址',
      dataIndex: 'officeAddress',
      key: 'officeAddress',
      render: (text: string, record: CustomerType) => (
        <a onClick={() => editHandle({...record,type_:'edit'})}>{record.officeAddress}</a>
      ),
      width: '20%',
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
            return <Tag color="cyan" key={tag}>{tag}</Tag>
          })
          return tagMap
        },
      },
      {
        title: '录入人',
        dataIndex: 'recorder',
        key: 'recorder',
        render: (text: string, record: CustomerContact) => {
          return subordinates.find((user) => user.id === record.recorder)?.name;
        },
        width: '15%',
      },
      {
        title: '备注',
        dataIndex: 'remark',
        key: 'remark',
        width: '30%'
      },
    ];

    const data = record.contacts.map(cont => {
      const { name, phone, tags, recorder } = cont
      return { key: name + phone, name, phone, tags, recorder }
    })

    return <Table columns={expandedColumns} dataSource={data} pagination={false} size="middle" />
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
              salesman: ['25070008', '25080004'],
              officeAddress: '',
              contacts: [],
              enable: true,
              remark: '',
              type_:'add',
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
      <DialogForm submitHandle={(v: CustomerInput) => pushCustomer(v)} ref={ref} title="编辑客户">
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
