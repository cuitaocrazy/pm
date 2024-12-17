import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef, useState } from 'react';
import { Button, Table, Tag, Space, Popconfirm, Row, Col, Input, Select } from 'antd';
import type { Agreement as AgreementType, AgreementInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useAgreementState } from './hook';
import AgreementForm from './AgreementForm';
import PayWayForm from './PayWayForm';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { agreementType, useBaseState } from '@/pages/utils/hook';
import '@/common.css';

const Agreement: React.FC<any> = () => {
  const {
    loading,
    agreements,
    projs,
    projectAgreements,
    customers,
    deleteAgreement,
    pushAgreement,
    payWaySub,
    query,
    setQuery,
    collectionQuarterManages,
  } = useAgreementState();
  const [params, setParams] = useState({
    name: '',
    customer: [],
    type: [],
  });
  const contractType = Object.entries(agreementType).map(([key, value]) => ({
    label: value,
    value: key,
  }));
  const [type, setType] = useState(1);
  const { buildProjName } = useBaseState();
  const ref = useRef<FormDialogHandle<AgreementInput>>(null);
  const payWayref = useRef<FormDialogHandle<AgreementInput>>(null);
  const editHandle = (agreement: AgreementType) => {
    // setType(2);
    // const projArr = projectAgreements
    //   .filter((item) => {
    //     return item.agreementId === agreement.id;
    //   })
    //   .map((pro) => pro.id);

    // agreement.contactProj = projArr;
    // agreement.time = [moment(agreement.startTime), moment(agreement.endTime)];
    // console.log(agreement, 'agreement KKKKK');
    payWayref.current?.showDialog({
      ...agreement,
    });
  };
  const handleChange = (value = '', type: string) => {
    setParams({
      ...params,
      [type]: type !== 'customer' && type !== 'type' ? String(value) : value,
    });
  };
  const handleChangeInput = (name: string) => {
    setParams({
      ...params,
      name,
    });
  };
  const searchBtn = () => {
    setParams({
      ...params,
    });
    setQuery({
      ...query,
      ...params,
    });
  };
  const canaelBtn = () => {
    setParams({
      ...params,
      name: '',
      customer: [],
      type: [],
    });
    setQuery({
      ...query,
      ...params,
      name: '',
      customer: [],
      type: [],
    });
  };
  const addContract = () => {
    ref.current?.showDialog({
      name: '',
      customer: '',
      type: '',
      contactProj: [],
      startTime: '',
      endTime: '',
      fileList: [],
      remark: '',
    });
    setType(1);
  };
  const [projInfo, setProjInfo] = useState();
  const payWayBtn = (record:any) => {
    // console.log(record, 'MMMMJJJJJ');
    setProjInfo(record);
    payWayref.current?.showDialog({
      ...record,
    });
    /**ref.current?.showDialog({ ...agreement }); */
  };
  // 计算 rowSpan
  const calculateRowSpan = (data:any, key:any) => {
    const map:any = {};
    data.forEach((item:any, index:any) => {
      if (map[item[key]]) {
        map[item[key]].count++;
      } else {
        map[item[key]] = { start: index, count: 1 };
      }
    });

    return map;
  };
  // 按 name 排序数据
  const sortedData = [...agreements].sort((a, b) => (a.name > b.name ? 1 : -1));
  // 根据数据计算 rowSpan
  const rowSpanMap = calculateRowSpan(sortedData, 'name');
  const rowSpanMap1 = calculateRowSpan(sortedData, 'customer');
  const rowSpanMap2 = calculateRowSpan(sortedData, 'payWayName');

  console.log(rowSpanMap1, 'rowSpanMap1 JJJJJJJJ');
  const columns = [
    {
      title: '合同名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (value:any, row:any, index:any) => {
        const obj = {
          children: value,
          props: {
            rowSpan:0
          },
        };

        // 设置 rowSpan 值
        if (rowSpanMap[value].start === index) {
          obj.props.rowSpan = rowSpanMap[value].count;
        } else {
          obj.props.rowSpan = 0; // 隐藏后续行
        }

        return obj;
      },
    },
    {
      title: '关联客户',
      dataIndex: 'customer',
      key: 'customer',
      width: 100,
      render: (value:any, row:any, index:any) =>{
        const obj = {
          children: customers.filter((item) => item.id === value).length
            ? customers.filter((item) => item.id === value)[0].name
            : '',
          props: {
            rowSpan:0
          },
        };

        // // 设置 rowSpan 值
        if (rowSpanMap1[value].start === index) {
          obj.props.rowSpan = rowSpanMap1[value].count;
        } else {
          obj.props.rowSpan = 0; // 隐藏后续行
        }

        return obj;
        },
    },
    // {
    //   title: '合同类型',
    //   dataIndex: 'type',
    //   key: 'type',
    //   width: 200,
    //   render: (text: string, record: AgreementType) => agreementType[record.type],
    // },
    {
      title: '付款方式名称',
      dataIndex: 'payWayName',
      key: 'payWayName',
      width: 100,
      render: (value:any, row:any, index:any) => {
        const obj = {
          children: value,
          props: {
            rowSpan:0
          },
        };

        // // 设置 rowSpan 值
        if (rowSpanMap2[value].start === index) {
          obj.props.rowSpan = rowSpanMap2[value].count;
        } else {
          obj.props.rowSpan = 0; // 隐藏后续行
        }
        return obj;
      },
    },
    {
      title: '里程碑名称',
      dataIndex: 'milestoneName',
      key: 'milestoneName',
      width: 100,
      render: (text: string, record: AgreementType) => {
        return <a onClick={() => editHandle(record)}>{record.milestoneName}</a>;
      },
    },
    {
      title: '百分比',
      dataIndex: 'milestoneValue',
      key: 'milestoneValue',
      width: 100,
      render: (text: string, record: AgreementType) => record.milestoneValue,
    },
    {
      title: '款项金额',
      dataIndex: 'milestoneValue',
      key: 'milestoneValue',
      width: 100,
      render: (text: string, record: AgreementType) => {
        return (Number(record.contractAmount) * Number(record.milestoneValue)) / 100;
      },
    },
    {
      title: '回款季度',
      dataIndex: 'actualQuarter',
      key: 'actualQuarter',
      width: 100,
      render: (text: string, record: AgreementType) => {
        if (record.actualQuarter) {
          return collectionQuarterManages?.filter((item) => item.code == record.actualQuarter)[0]
            .name;
        } else {
          return '---';
        }
      },
    },
    // {
    //   title: '备注',
    //   dataIndex: 'remark',
    //   key: 'remark',
    //   width: 250,
    // },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (createDate: string) => {
        return moment(createDate, 'YYYYMMDD').format('YYYY年MM月DD日');
      },
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'action',
      render: (id: string, record: AgreementType) => (
        <Space>
          <Popconfirm
            title="是否删除？"
            okText="是"
            cancelText="否"
            onConfirm={() => deleteAgreement(id)}
          >
            <a key="delete">删除</a>
          </Popconfirm>
        </Space>
      ),
      width: 100,
      fixed: 'right' as 'right',
    },
  ];
  return (
    <PageContainer className="bgColorWhite paddingBottom20">
      <Row gutter={16}>
        <Col className="gutter-row">
          <Input
            id="proName"
            value={params.name}
            key="search"
            addonBefore="合同名称"
            allowClear
            onChange={(e) => {
              handleChangeInput(e.target.value);
            }}
          />
        </Col>
        <Col className="gutter-row">
          <label>关联客户：</label>
          <Select
            value={params.customer}
            style={{ width: '200px' }}
            onChange={(value: any, event) => {
              handleChange(value, 'customer');
            }}
            fieldNames={{ value: 'id', label: 'name' }}
            options={customers}
          />
        </Col>
        <Col className="gutter-row">
          <label>合同类型：</label>
          <Select
            value={params.type}
            style={{ width: '200px' }}
            onChange={(value: any, event) => {
              handleChange(value, 'type');
            }}
            options={contractType}
          />
        </Col>
      </Row>
      <Row justify="center" className="marginTop20">
        <Col>
          <Button onClick={() => searchBtn()} type="primary" className="marginRight10">
            查询
          </Button>
          <Button onClick={() => canaelBtn()}>重置</Button>
        </Col>
      </Row>
      {/* <Row justify="left" className="marginTop20">
        <Col>
          <Button key="create" type="primary" onClick={() => addContract()}>
            新建
          </Button>
        </Col>
      </Row> */}
      <Table
        style={{ marginTop: '20px' }}
        loading={loading}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={sortedData}
        pagination={false}
        size="middle"
        scroll={{ x: 1500 }}
        bordered
      />
      <DialogForm
        submitHandle={(v: AgreementInput) => {
          let customerName = customers.find((item) => item.id === v.customer)?.name;
          return pushAgreement({ ...v, customerName });
        }}
        ref={ref}
        title={type == 1 ? '新增合同' : type == 2 ? '编辑合同' : ''}
      >
        {AgreementForm}
      </DialogForm>
      <DialogForm
        submitHandle={(v: AgreementInput) => {
          return payWaySub({ ...(projInfo||{}), ...v });
        }}
        ref={payWayref}
        title="款项填写"
      >
        {PayWayForm}
      </DialogForm>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Agreement />
  </ApolloProvider>
);
