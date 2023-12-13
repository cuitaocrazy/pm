import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef } from 'react';
import { Table, Tag, Input, Space } from 'antd';
import type { Project as Proj, ProjectInput, ActiveInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useProjStatus } from './hook';
import ProjDetail from './ProjDetail';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { useBaseState } from '@/pages/utils/hook';
import { getStatusDisplayName, projStatus } from './utils';

const Project: React.FC<any> = () => {
  const detailRef = useRef<FormDialogHandle<ProjectInput>>(null);
  const { projs, subordinates, customers, agreements, projectAgreements, loading, setFilter } = useProjStatus();
  const { status, orgCode, zoneCode, projType, buildProjName } = useBaseState();
  const editHandle = (proj: Proj) => {
    const agree = projectAgreements.filter(item => item.id === proj.id)
    const { actives, ...pro } = proj;
    detailRef.current?.showDialog({ 
      ...pro,
      contName: agree.length ? agree[0].agreementId : '', 
      actives: (actives as ActiveInput[])?.map(item => {
        // @ts-ignore
        item.date = moment(item.date)
        return item
      }),
      // @ts-ignore
      startTime: pro.startTime && moment(pro.startTime),
      // @ts-ignore
      endTime: pro.endTime && moment(pro.endTime),
      // @ts-ignore
      productDate: pro.productDate && moment(pro.productDate),
      // @ts-ignore
      acceptDate: pro.acceptDate && moment(pro.acceptDate),
    });
  };

  const makeGroupProps = (children: any, row: Proj, index: number) => {
    const obj = {
      children,
      props: {} as any,
    };
    if (index === 0) {
      // @ts-ignore
      obj.props.rowSpan = row.props.allIndex - row.props.index;
    } else {
      // @ts-ignore
      obj.props.rowSpan = row.props.index === 0 ? row.props.allIndex : 0;
    }
    return obj;
  };
  const makeGroupRender = (value: string, row: Proj, index: number) => {
    return makeGroupProps(value, row, index);
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: makeGroupRender,
      width: 120
    },
    {
      title: '项目ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string, record: Proj) => (
        <div>
          <a onClick={() => editHandle(record)}>{buildProjName(record.id, record.name)} </a>
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
        }
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
      title: '客户名称',
      dataIndex: 'customer',
      key: 'customer',
      render: (text: string, record: Proj) => {
        return customers.find((cum) => cum.id === record.customer)?.name;
      },
      width:150,
    },
    {
      title: '合同名称',
      dataIndex: 'contName',
      key: 'contName',
      render: (text: string, record: Proj) => {
        const agree = projectAgreements.filter(item => item.id === record.id)
        return agree.length ? agreements.find((cum) => cum.id === agree[0].agreementId)?.name : ''
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
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (createDate: string) => {
        return moment(createDate, 'YYYYMMDD').format('YYYY年MM月DD日');
      },
      width: 150,
    },
    {
      title: '更新时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (updateTime: string) => {
        return moment(updateTime, 'YYYYMMDD HH:mm:ss').format('YYYY年MM月DD日 HH:mm:ss');
      },
      width: 200,
    }
  ];

  return (
    <PageContainer
      extra={[
        <Input
          key="search"
          addonBefore="项目名称"
          allowClear
          onChange={(e) => setFilter(e.target.value)}
        />
      ]}
    >
      <Table
        loading={loading}
        scroll={{ x: 1700 }}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={projs}
        size="middle"
      />
      <DialogForm
        ref={detailRef}
        title="项目详情"
        width={1000}
      >
        {ProjDetail}
      </DialogForm>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Project />
  </ApolloProvider>
);
