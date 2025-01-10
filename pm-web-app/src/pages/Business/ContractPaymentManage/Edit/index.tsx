import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef, useState } from 'react';
import { Button, Table, Space, Popconfirm, Row, Col, Input, Select,Cascader } from 'antd';
import type { Agreement as AgreementType, AgreementInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useAgreementState } from './hook';
import AgreementForm from './AgreementForm';
import PayWayForm from './PayWayForm';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { agreementType,useBaseState } from '@/pages/utils/hook';
import '@/common.css';

const Agreement: React.FC<any> = () => {
  const {
    loading,
    agreements,
    // projs,
    // projectAgreements,
    customers,
    agreements_,
    deleteAgreement,
    pushAgreement,
    payWaySub,
    query,
    setQuery,
    collectionQuarterManages,
    payStateManages,
  } = useAgreementState();
  const [params, setParams] = useState({
    name: '',
    customer: [],
    type: [],
    actualQuarter:[],
    expectedQuarter:[],
    payState:[],
    group:[],
  });
  const { groupType} = useBaseState();
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
  const contractType = Object.entries(agreementType).map(([key, value]) => ({
    label: value,
    value: key,
  }));
  const [type] = useState(1);
  // const { buildProjName } = useBaseState();
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
    
    payWayref.current?.showDialog({
      ...agreement,
    });
  };
  const handleChange = (value = '', type: string) => {
    setParams({
      ...params,
      [type]: type !== 'customer' && type !== 'type' && type !== 'actualQuarter' && type !== 'expectedQuarter' && type !== 'payState' ? String(value) : value,
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
      actualQuarter:[],
      expectedQuarter:[],
      payState:[],
      group: [],
    });
    setQuery({
      ...query,
      ...params,
      name: '',
      customer: [],
      type: [],
      actualQuarter:[],
      expectedQuarter:[],
      payState:[],
      group: '',
    });
  };
  // const addContract = () => {
  //   ref.current?.showDialog({
  //     name: '',
  //     customer: '',
  //     type: '',
  //     contactProj: [],
  //     startTime: '',
  //     endTime: '',
  //     fileList: [],
  //     remark: '',
  //   });
  //   setType(1);
  // };
  // const [projInfo, setProjInfo] = useState();
  // const payWayBtn = (record:any) => {
  //   setProjInfo(record);
  //   payWayref.current?.showDialog({
  //     ...record,
  //   });
  //   /**ref.current?.showDialog({ ...agreement }); */
  // };
  let count = 1;
  // 计算 rowSpan
  const calculateRowSpan = (data:any, key:any) => {
    const map:any = {};
    data.forEach((item:any, index:any) => {
      if (map[item[key]]) {
        map[item[key]].count++;
      } else {
        map[item[key]] = { start: index, count: 1,index:count++};
      }
    });

    return map;
  };
  // 按 name 排序数据
  const sortedData = [...agreements].sort((a, b) => (a.name > b.name ? 1 : -1));
  // 根据数据计算 rowSpan
 
  const rowSpanMap = calculateRowSpan(sortedData, 'contractId');
  console.log(rowSpanMap,'rowSpanMap NNNNNNN')
  // 去重 name 并计算 count1 的总和
const uniqueCounts = {};
sortedData.forEach((item) => {
  if (!uniqueCounts[item.name]) {
    uniqueCounts[item.name] = item.contractAmount;
  }
});
const totalCount1 = Object.values(uniqueCounts).reduce((sum, count) => sum + Number(count), 0);

// 累加 number1 的总和
const totalNumber1 = sortedData.reduce((sum, item) => sum + (Number(item.contractAmount) * Number(item.milestoneValue)) / 100, 0);
  const columns = [
    {
      title: '序号',
      key: 'index',
      width: 60,
      render: (value:any, record:any, index:number) => {
        const obj = {
          children: '',
          props: {
            rowSpan:0
          },
        };

        // 设置 rowSpan 值
        if (rowSpanMap[record.contractId].start === index) {
          obj.props.rowSpan = rowSpanMap[record.contractId].count;
          obj.children = rowSpanMap[record.contractId].index;
        } else {
          obj.props.rowSpan = 0; // 隐藏后续行
        }

        return obj;
      }, // 使用索引生成序号
    },
    {
      title: '合同名称',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (value:any, row:any, index:any) => {
        const obj = {
          children: agreements_.result.filter(item=>item.id == row.contractId) && agreements_.result.filter(item=>item.id == row.contractId).length>0 ? agreements_.result.filter(item=>item.id == row.contractId)[0].name :'---',
          props: {
            rowSpan:0
          },
        };

        // 设置 rowSpan 值
        if (rowSpanMap[row.contractId].start === index) {
          obj.props.rowSpan = rowSpanMap[row.contractId].count;
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
          children: customers.filter((item) => item.id === agreements_.result.filter(item=>item.id == row.contractId)[0].customer) && customers.filter((item) => item.id === agreements_.result.filter(item=>item.id == row.contractId)[0].customer).length>0
            ? customers.filter((item) => item.id === agreements_.result.filter(item=>item.id == row.contractId)[0].customer)[0].name
            : '---',
          props: {
            rowSpan:0
          },
        };

        // // 设置 rowSpan 值
        if (rowSpanMap[row.contractId].start === index) {
          obj.props.rowSpan = rowSpanMap[row.contractId].count;
        } else {
          obj.props.rowSpan = 0; // 隐藏后续行
        }

        return obj;
        },
    },
    {
      title: '合同金额',
      dataIndex: 'contractAmount',
      key: 'contractAmount',
      width: 200,
      align:'right' as 'right',
      children: [
        {
          title: '('+new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalCount1)+')',
          dataIndex: 'contractAmount',
          align:'right',
          render: (value:any, row:any, index:any) =>{
            const obj = {
              children: agreements_.result.filter(item=>item.id == row.contractId) && agreements_.result.filter(item=>item.id == row.contractId).length>0 ? new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(agreements_.result.filter(item=>item.id == row.contractId)[0].contractAmount):'---',
              props: {
                rowSpan:0
              },
            };
    
            // // 设置 rowSpan 值
            if (rowSpanMap[row.contractId].start === index) {
              obj.props.rowSpan = rowSpanMap[row.contractId].count;
            } else {
              obj.props.rowSpan = 0; // 隐藏后续行
            }
    
            return obj;
            },
        width: 200,
        }
      ],
      
    },
    {
      title: '合同签订日期',
      dataIndex: 'contractSignDate',
      key: 'contractSignDate',
      width: 100,
      align:'right' as 'right',
      render: (value:any, row:any, index:any) =>{
        const obj = {
          children: agreements_.result.filter(item=>item.id == row.contractId) && agreements_.result.filter(item=>item.id == row.contractId).length>0?moment(agreements_.result.filter(item=>item.id == row.contractId)[0].contractSignDate).format('YYYY-MM-DD'):'---',
          props: {
            rowSpan:0
          },
        };

        // // 设置 rowSpan 值
        if (rowSpanMap[row.contractId].start === index) {
          obj.props.rowSpan = rowSpanMap[row.contractId].count;
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
        if (rowSpanMap[row.contractId].start === index) {
          obj.props.rowSpan = rowSpanMap[row.contractId].count;
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
      render: (text: string, record: any) => {
        return <a onClick={() => editHandle(record)}>{record.milestoneName}</a>;
      },
    },
    {
      title: '百分比',
      dataIndex: 'milestoneValue',
      key: 'milestoneValue',
      width: 100,
      align:'right' as 'right',
      render: (text: string, record: any) => record.milestoneValue+'%',
    },
    {
      title: '款项金额',
      dataIndex: 'milestoneValue',
      key: 'milestoneValue',
      width: 200,
      align:'right' as 'right',
      children: [
        {
          title: '('+new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(totalNumber1)+')',
          dataIndex: 'contractAmount',
          align:'right',
          render: (text: string, record: any) => {
            return new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((Number(record.contractAmount) * Number(record.milestoneValue)) / 100);
          },
        }
      ],
      
    },
    {
      title: '预计回款季度',
      dataIndex: 'expectedQuarter',
      key: 'expectedQuarter',
      width: 100,
      render: (text: string, record: any) => {
        if (record.expectedQuarter) {
          return collectionQuarterManages?.filter((item) => item.code == record.expectedQuarter)[0]
            .name;
        } else {
          return '---';
        }
      },
    },
    {
      title: '实际回款季度',
      dataIndex: 'actualQuarter',
      key: 'actualQuarter',
      width: 100,
      render: (text: string, record: any) => {
        if (record.actualQuarter) {
          return collectionQuarterManages?.filter((item) => item.code == record.actualQuarter)[0]
            .name;
        } else {
          return '---';
        }
      },
    },
    {
      title: '实际回款日期',
      dataIndex: 'actualDate',
      key: 'actualDate',
      width: 100,
      render: (text: string, record: any) => {
        if (record.actualDate) {
          return moment(record.actualDate).format('YYYY-MM-DD')
        } else {
          return '---';
        }
      },
    },
    {
      title: '付款状态',
      dataIndex: 'payState',
      key: 'payState',
      width: 100,
      render: (text: string, record: any) => {
        if (record.payState) {
          return payStateManages?.filter((item) => item.code == record.payState)[0]
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
    // {
    //   title: '创建日期',
    //   dataIndex: 'createDate',
    //   key: 'createDate',
    //   render: (createDate: string) => {
    //     return moment(createDate, 'YYYYMMDD').format('YYYY年MM月DD日');
    //   },
    //   width: 100,
    // },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'action',
      render: (id: string, record: any) => (
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
      <Row gutter={[16, 16]}>
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
          <label>付款状态：</label>
          <Select
              mode='multiple'
            value={params.payState}
            style={{ width: '200px' }}
            onChange={(value: any, event) => {
              handleChange(value, 'payState');
            }}
            fieldNames={{label:'name',value:'code'}}
            options={payStateManages?.filter(item=>item.enable == true)}
          />
        </Col>
        <Col className="gutter-row">
          <label>预计回款季度：</label>
          <Select
          mode='multiple'
            value={params.expectedQuarter}
            style={{ width: '200px' }}
            onChange={(value: any, event) => {
              handleChange(value, 'expectedQuarter');
            }}
            fieldNames={{label:'name',value:'code'}}
            options={collectionQuarterManages?.filter(item=>item.enable == true)}
          />
        </Col>
        <Col className="gutter-row">
          <label>实际回款季度：</label>
          <Select
          mode='multiple'
            value={params.actualQuarter}
            style={{ width: '200px' }}
            onChange={(value: any, event) => {
              handleChange(value, 'actualQuarter');
            }}
            fieldNames={{label:'name',value:'code'}}
            options={collectionQuarterManages?.filter(item=>item.enable == true)}
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
          v.actualDate = v.actualDate?.toString()
          return payWaySub({ ...v });
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
