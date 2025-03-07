import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef, useState } from 'react';
import { Button, Table, Tag, Space, Popconfirm, Row, Col, Input, Select,Cascader } from 'antd';
import type { Agreement as AgreementType, AgreementInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useAgreementState } from './hook';
import AgreementForm from './AgreementForm';
import PayWayForm from './PayWayForm';
import ProjForm from './ProjForm';
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
    contractPaymentManages,
  } = useAgreementState();
  const [params, setParams] = useState({
    name: '',
    customer: [],
    type: [],
    group:[],
  });
  const contractType = Object.entries(agreementType).map(([key, value]) => ({
    label: value,
    value: key,
  }));
  const [type, setType] = useState(1);
  const { buildProjName,groupType } = useBaseState();
  const ref = useRef<FormDialogHandle<AgreementInput>>(null);
  const payWayref = useRef<FormDialogHandle<AgreementInput>>(null);
  const proDetailref = useRef<FormDialogHandle<AgreementInput>>(null);
  const editHandle = (agreement: AgreementType) => {
    setType(2);
    const projArr = projectAgreements
      .filter((item) => {
        return item.agreementId === agreement.id;
      })
      .map((pro) => pro.id);

    agreement.contactProj = projArr;
    agreement.time = [moment(agreement.startTime), moment(agreement.endTime)];
    ref.current?.showDialog({ ...agreement });
  };
  const groupDatas = (inputArray: any) => {
    let result: any = [];
    inputArray.forEach((item: any) => {
      const path = item.substring(1).split('/');
      let currentLevel = result;
      path.forEach((segment: any, index: number) => {
        const existingSegment = currentLevel.find((el: any) => el.value === segment);

        if (existingSegment) {
          currentLevel = existingSegment.children || [];
        } else {
          const newSegment = {
            value: segment,
            label: segment,
            children: index === path.length - 1 ? [] : [],
          };

          currentLevel.push(newSegment);
          currentLevel = newSegment.children || [];
        }
      });
    });
    return result;
  };
  const [groupsOptions] = useState(groupDatas(groupType));
  const handleChangeCas = (value: any, type: string) => {
    setParams({
      ...params,
      group: value,
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
      group:
        params.group.length !== 0
          ? params.group.reduce((accumulator: string, currentValue: string) => {
              return `${accumulator}/${currentValue}`;
            }, '')
          : '',
    });
  };
  const canaelBtn = () => {
    setParams({
      ...params,
      name: '',
      customer: [],
      type: [],
      group: [],
    });
    setQuery({
      ...query,
      ...params,
      name: '',
      customer: [],
      type: [],
      group: '',
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
  const transformData = (data:any, targetContId:any) => {
    // 过滤出指定 contId 的数据
    const filteredData = data.filter((item:any) => item.contractId === targetContId);

    // 获取唯一的 payName（假设所有 payName 相同）
    const payName = filteredData.length > 0 ? filteredData[0].payWayName : null;
    console.log(data,'data PPPPP')
    console.log(targetContId,'targetContId PPPPP')
    // 转换数据格式
    const milestone = filteredData.map((item:any) => ({
      id: item.id.toString(),
      name: item.milestoneName,
      value: Number(item.milestoneValue),
    }));

    return {
      payWayName: payName,
      milestone: milestone,
    };
  };
  const [projInfo, setProjInfo] = useState();
  const payWayBtn = (record:any) => {
    setProjInfo(record);
    let info = transformData(contractPaymentManages?.result, record.id);
    payWayref.current?.showDialog({
      ...info,
    });
  };
  // 累加 number1 的总和
const totalNumber1 = agreements.reduce((sum, item) => sum + Number(item.contractAmount), 0);
// 累加 number1 的总和
const totalNumber2 = agreements.reduce((sum, item) => sum + Number(item.afterTaxAmount), 0);

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      render: (text: string, record: AgreementType,index) => (
        ++index
      ),
    },
    {
      title: '合同名称',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (text: string, record: AgreementType) => (
        <a onClick={() => editHandle(record)}>{record.name}</a>
      ),
    },
    {
      title: '关联项目',
      width: 200,
      render: (text: string, record: AgreementType) => {
        const projArr = projectAgreements.filter((item) => {
          return item.agreementId === record.id;
        });
        const nameArrTags = projArr.map((pro) => {
          const proj = projs?.find((item) => pro.id === item.id);
          return (
            <Tag
              color="processing"
              key={pro.id}
              style={{ whiteSpace: 'normal', overflowWrap: 'break-word' }}
              onClick={()=>{console.log('000');proDetailref.current?.showDialog({
                ...proj,
                contName: proj.agreements && proj.agreements.length > 0 ? proj.agreements[0].name : '',
              });}}
            >
              {buildProjName(pro.id, proj.name)}
            </Tag>
          );
        });
        return nameArrTags;
      },
    },
    {
      title: '客户名称',
      dataIndex: 'customer',
      key: 'customer',
      width: 100,
      align:'right' as 'right',
      render: (text: string, record: AgreementType) => {
        return customers.find((item) => item.id === text)?.name
      },
    },
    {
      title: '部门',
      dataIndex: 'group',
      key: 'group',
      width: 200,
      align:'right' as 'right'
    },
    {
      title: '合同类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align:'right' as 'right',
      render: (text: string, record: AgreementType) => {
        return contractType.find((item) => item.value === text)?.label
      },
    },
    {
      title: '合同签订日期',
      dataIndex: 'contractSignDate',
      key: 'contractSignDate',
      width: 100,
      align:'right' as 'right',
      render: (text: string, record: AgreementType) => {
        if(text){
          return moment(text).format('YYYY-MM-DD')
        }else{
          return '----'
        }
      },
    },
    {
      title: '合同周期',
      dataIndex: 'contractPeriod',
      key: 'contractPeriod',
      width: 100,
      align:'right' as 'right'
    },
    {
      title: '合同金额',
      dataIndex: 'contractAmount',
      key: 'contractAmount',
      width: 100,
      align:'right' as 'right',
      children: [
        {
          title: '('+new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalNumber1)+')',
          dataIndex: 'contractAmount',
          align:'right',
          render:(text: any, record: AgreementType)=>{
            return new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((text))
        },
        width: 100,
        }
      ],
     
    },
    {
      title: '不含税金额',
      dataIndex: 'afterTaxAmount',
      key: 'afterTaxAmount',
      width: 100,
      align:'right' as 'right',
      children: [
        {
          title: '('+new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalNumber2)+')',
          dataIndex: 'contractAmount',
          align:'right',
          render:(text: any, record: AgreementType)=>{
            return new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((text))
        },
        width: 100,
        }
      ],
    },
    {
      title: '免维期',
      dataIndex: 'maintenanceFreePeriod',
      key: 'maintenanceFreePeriod',
      width: 100,
      align:'right' as 'right',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
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
          <Button type="link" onClick={() => payWayBtn(record)}>
            付款方式
          </Button>
        </Space>
      ),
      width: 150,
      fixed: 'right' as 'right',
    },
  ];
  const onCancelButtonProps: ButtonProps = {
    style: { display: 'none' }, // 设置样式让按钮消失
  };
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
        <Col className="gutter-row">
        <label>项目部门：</label>
          <Cascader
            value={params.group}
            allowClear
            changeOnSelect
            className="width122"
            placeholder="请选择"
            onChange={(value, event) => {
              handleChangeCas(value, 'group');
            }}
            options={groupsOptions}
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
      <Row justify="start" className="marginTop20">
        <Col>
          <Button key="create" type="primary" onClick={() => addContract()}>
            新建
          </Button>
        </Col>
      </Row>
      <Table
        style={{ marginTop: '12px' }}
        loading={loading}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={agreements}
        pagination={false}
        size="middle"
        scroll={{ x: 1300 }}
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
          return payWaySub({ ...projInfo || {}, ...v });
        }}
        ref={payWayref}
        title="付款方式"
      >
        {PayWayForm}
      </DialogForm>
      <DialogForm
       width={1000}
        ref={proDetailref}
        title="项目详情"
        cancelButtonProps={onCancelButtonProps}
      >
        {ProjForm}
      </DialogForm>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Agreement />
  </ApolloProvider>
);
