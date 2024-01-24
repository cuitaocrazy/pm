import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef } from 'react';
import { Button, Table, Tag, Space, Popconfirm } from 'antd';
import type { Agreement as AgreementType, AgreementInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useAgreementState } from './hook';
import AgreementForm from './AgreementForm';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { agreementType, useBaseState } from '@/pages/utils/hook';

const Agreement: React.FC<any> = () => {
  const { loading, agreements, projs, projectAgreements, customers, deleteAgreement, pushAgreement } = useAgreementState();
  const { buildProjName } = useBaseState();
  const ref = useRef<FormDialogHandle<AgreementInput>>(null);
  const editHandle = (agreement: AgreementType) => {
    const projArr = projectAgreements.filter(item => {
      return item.agreementId === agreement.id
    }).map(pro => pro.id)
    
    agreement.contactProj = projArr
    agreement.time = [moment(agreement.startTime), moment(agreement.endTime)]
    ref.current?.showDialog({ ...agreement });
  }

  const columns = [
    {
      title: '合同名称',
      dataIndex: 'name',
      key: 'name',
      width: '15%',
      render: (text: string, record: AgreementType) => (
        <a onClick={() => editHandle(record)}>{record.name}</a>
      ),
    },
    {
      title: '关联客户',
      dataIndex: 'customer',
      key: 'customer',
      width: 100,
      render: (text: string, record: AgreementType) => (
        customers.filter(item => item.id === record.customer).length ? customers.filter(item => item.id === record.customer)[0].name : ''
      ),
    },
    {
      title: '合同类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (text: string, record: AgreementType) => (
        agreementType[record.type]
      ),
    },
    {
      title: '关联项目',
      width: 100,
      render: (text: string, record: AgreementType) => {
        const projArr = projectAgreements.filter(item => {
          return item.agreementId === record.id
        })
        const nameArrTags = projArr.map(pro => {
          const projName = projs?.find((item) => pro.id === item.id)?.name || ''
          return <Tag color="processing" key={pro.id}>{buildProjName(pro.id, projName)}</Tag>
        })
        return nameArrTags
      },
    },
    {
      title: '开始时间',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (startTime: string) => {
        return startTime && moment(startTime, 'YYYYMMDD').format('YYYY年MM月DD日');
      },
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (endTime: string) => {
        return endTime && moment(endTime, 'YYYYMMDD').format('YYYY年MM月DD日');
      },
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
      render: (id: string, record: AgreementType) => (
        <Space>
          <Popconfirm title="是否删除？" okText="是" cancelText="否" onConfirm={() => deleteAgreement(id)}>
            <a key="delete">
              删除
            </a>
          </Popconfirm>
        </Space>
      ),
    },
  ];
  return (
    <PageContainer
      extra={[
        <Button
          key="create"
          type="primary"
          onClick={() =>
            ref.current?.showDialog({
              name: '',
              customer: '',
              type: '',
              contactProj: [],
              startTime: '',
              endTime: '',
              fileList: [],
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
        dataSource={agreements}
        pagination={false}
        size="middle"
      />
      <DialogForm submitHandle={(v: AgreementInput) => {
        let customerName = customers.find(item => item.id === v.customer)?.name
        return pushAgreement({ ...v, customerName })
      }} ref={ref} title="编辑合同">
        {AgreementForm}
      </DialogForm>
    </PageContainer>
  );
}

export default () => (
  <ApolloProvider client={client}>
    <Agreement />
  </ApolloProvider>
);
