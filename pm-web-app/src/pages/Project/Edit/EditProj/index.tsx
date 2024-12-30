import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef, useState, useEffect } from 'react';
import {
  Button,
  Table,
  Popconfirm,
  Tag,
  Input,
  Space,
  Radio,
  Badge,
  Row,
  Col,
  Select,
  DatePicker,
  Pagination,
  Cascader,
} from 'antd';
import type { Project as Proj, ProjectInput, ActiveInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useProjStatus } from './hook';
import ProjForm from './ProjForm';
import ProjActiveForm from './ProjActiveForm';
import DailyModal from './DailyModal';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { useBaseState } from '@/pages/utils/hook';
import { getStatusDisplayName, projStatus } from './utils';
import { history } from 'umi';
import '@/common.css';

const Project: React.FC<any> = () => {
  const isAdmin = history?.location.pathname.split('/').pop() === 'allEdit' ? true : false;
  const ref = useRef<FormDialogHandle<ProjectInput>>(null);
  const dailyRef = useRef<FormDialogHandle<Proj>>(null);
  const activeRef = useRef<FormDialogHandle<ProjectInput>>(null);

  const {
    projs,
    todoProjs,
    subordinates,
    loading,
    archive,
    setArchive,
    archiveProj,
    deleteProj,
    pushProj,
    setQuery,
    query,
    total,
    todoProjsTotal,
    yearManages,
    projectAgreements,
    agreements,
    printProj,
  } = useProjStatus();
  const { status, orgCode, zoneCode, projType, buildProjName, groupType ,subordinatesOnJob} = useBaseState();
  const editHandle = (proj: Proj, openRef: any) => {
    const { actives, ...pro } = proj;
    openRef.current?.showDialog({
      ...pro,
      // contName: proj.agreements[0].name ? proj.agreements[0].name : '',
      contName: proj.agreements && proj.agreements.length > 0 ? proj.agreements[0].name : '',
      actives: actives as ActiveInput[],
      // @ts-ignore
      acceptDate: pro.acceptDate && moment(pro.acceptDate),
    });
  };
  const [objectInfo,setObjectInfo] = useState({}) as any
  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      width: 120,
    },
    {
      title: '项目ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string, record: Proj) => (
        <div>
          <a onClick={() => editHandle(record, ref)}>{buildProjName(record.id, record.name)} </a>
        </div>
      ),
      width: 250,
    },
    {
      title: '审核状态',
      dataIndex: 'proState',
      key: 'proState',
      render: (proState: string) => {
        return proState == 0
          ? '待审核'
          : proState == 1 || !proState
          ? '审核通过'
          : proState == 2
          ? '审核不通过'
          : '---';
      },
      width: 100,
    },
    {
      title: '预算人天',
      dataIndex: 'estimatedWorkload',
      key: 'estimatedWorkload',
      width: '80px',
      align:'right',
      render: (text: string, record: Proj) => <Tag color="cyan">{text ? text : 0}</Tag>,
    },
    {
      title: '实际人天',
      dataIndex: 'timeConsuming',
      key: 'timeConsuming',
      width: '80px',
      align:'right',
      render: (text: number, record: Proj) => (
        <Button type="text" onClick={() => dailyRef.current?.showDialog(record)}>
          <Tag color="cyan">{text ? ((text - 0) / 8).toFixed(2) : 0}</Tag>
        </Button>
      ),
    },

    {
      title: '阶段状态',
      dataIndex: 'status',
      key: 'status',
      width: '120px',
      render: (status: string) => (
        <Tag color={status ? (status === 'onProj' ? 'success' : 'default') : 'warning'}>
          {getStatusDisplayName(status)}
        </Tag>
      ),
    },
    {
      title: '项目状态',
      dataIndex: 'projStatus',
      key: 'projStatus',
      render: (text: string, record: Proj) => {
        return status?.find((statu) => statu.id === record.projStatus)?.name;
      },
      width: 100,
    },
    {
      title: '合同状态',
      dataIndex: 'contractState',
      key: 'contractState',
      render: (text: string, record: Proj) => {
        if(record.contractState){
          return record?.contractState == 0 ? '未签署' : record?.contractState == 1 ? '已签署' : '';
        }else{
          
          let agreementId = projectAgreements.filter(item=>item.id==record.id) || []
          let contract: string | any[] = []
          if(agreementId.length > 0){
            contract = agreements.result.filter(item=>item.id == agreementId[0].agreementId) || []
          }
          
          if(contract.length > 0){
            return  '已签署'
          }else{
            
            return '未签署'
          }
          
        }
      },
      width: 100,
    },
    {
      title: '验收状态',
      dataIndex: 'acceStatus',
      key: 'acceStatus',
      render: (text: string, record: Proj) => {
        return status?.find((statu) => statu.id === record.acceStatus)?.name;
      },
      width: 100,
    },

    {
      title: '确认年度',
      dataIndex: 'confirmYear',
      key: 'confirmYear',
      render: (confirmYear: string) => {
        return confirmYear;
      },
      width: 100,
      align:'right',
    },
    {
      title: '合同金额',
      dataIndex: 'contractAmount',
      key: 'contractAmount',
      align:'right',
      render: (contractAmount: string, record: Proj) => {
        if (projectAgreements && agreements.result && agreements.result.length != 0) {
          let contract = projectAgreements?.filter((item) => item.id == record.id);
          let amount = agreements?.result.filter((item) => item.id == contract[0]?.agreementId);
          
          if(amount[0]?.contractAmount){
              return new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((Number(amount[0]?.contractAmount)));
          }else{
            return new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((0.00));
          }
        } else {
          return '---';
        }
      },
      width: 100,
    },
    {
      title: '确认金额',
      dataIndex: 'recoAmount',
      key: 'recoAmount',
      align:'right',
      render: (recoAmount: any) => {
        return new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((recoAmount));
      },
      width: 100,
    },
    {
      title: '税后金额',
      dataIndex: 'afterTaxAmount',
      key: 'afterTaxAmount',
      align:'right',
      render: (afterTaxAmount: string, record: Proj) => {
        if (projectAgreements && agreements.result && agreements.result.length != 0) {
          let contract = projectAgreements?.filter((item) => item.id == record.id);
          let amount = agreements?.result?.filter((item) => item.id == contract[0]?.agreementId);
          if(amount[0]?.afterTaxAmount){
            return new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((amount[0]?.afterTaxAmount));
          }else{
            return new Intl.NumberFormat('en-US',{ minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((0.00));
          }
          
        } else {
          return '---';
        }
      },
      width: 100,
    },
    {
      title: '投产日期',
      dataIndex: 'productDate',
      key: 'productDate',
      render: (productDate: string) => {
        return productDate ? moment(productDate).format('YYYY-MM-DD') : '---';
      },
      width: 100,
      align:'right',
    },
    {
      title: '合同签订日期',
      dataIndex: 'contractSignDate',
      key: 'contractSignDate',
      render: (contractSignDate: string, record: Proj) => {
        if (projectAgreements && agreements.result && agreements.result.length != 0) {
          let contract = projectAgreements.filter((item) => item.id == record.id);
          let amount = agreements?.result.filter((item) => item.id == contract[0]?.agreementId);
          if(amount.length > 0){
            return moment(amount[0]?.contractSignDate).format('YYYY-MM-DD');
          }else{
            return '---'
          }
          
        } else {
          return '---';
        }
      },
      width: 150,
      align:'right',
    },
    {
      title: '项目部门',
      dataIndex: 'group',
      key: 'group',
      width: '200px',
    },

    {
      title: '客户名称',
      dataIndex: 'customer',
      key: 'customer',
      render: (text: string, record: Proj) => {
        return record.customerObj ? record.customerObj.name : '';
      },
      width: 150,
    },
    {
      title: '项目经理',
      dataIndex: 'leader',
      key: 'leader',
      render: (text: string, record: Proj) => {
        return subordinates.find((user: { id: string }) => user.id === record.leader)?.name;
      },
      width: 110,
    },
    {
      title: '市场经理',
      dataIndex: 'salesLeader',
      key: 'salesLeader',
      render: (text: string, record: Proj) => {
        return subordinates.find((user: { id: string }) => user.id === record.salesLeader)?.name;
      },
      width: 110,
    },
    {
      title: '操作',
      key: 'action',
      render: (id: string, record: Proj) => (
        <Space>
          <a
            disabled={record.proState && (record.proState == 0 || record.proState == 2)?true:false}
            key="archive"
            onClick={() => {
              if(record.proState && ( record.proState == 0 || record.proState == 2)){
                return 
              }else{
                editHandle(record, activeRef);
              }
              
            }}
          >
            添加项目活动
          </a>
          <Popconfirm
          disabled={record.proState &&( record.proState == 0 || record.proState == 2)?true:false}
            title="将项目数据归档，只能到归档列表查看！"
            okText="是"
            cancelText="否"
            onConfirm={() => {
              if(record.proState && (record.proState == 0 || record.proState == 2)){
                return 
              }else{
                return archiveProj(record.id)
              }}}
          >
            <a disabled={record.proState && (record.proState == 0 || record.proState == 2)?true:false} key="archive" hidden={record.isArchive}>
              归档
            </a>
          </Popconfirm>
          <Popconfirm
            title="将会彻底删除源数据，且无法恢复？"
            okText="是"
            cancelText="否"
            onConfirm={() => deleteProj(record.id)}
          >
            <a key="delete" hidden={record.isArchive}>
              删除
            </a>
          </Popconfirm>
          <Popconfirm
          disabled={record.proState &&( record.proState == 0 || record.proState == 2)?true:false}
            title="打印该项目的立项申请书？"
            okText="是"
            cancelText="否"
            onConfirm={() => handleConfirm(record)}
          >
            <a key="print" hidden={record.isArchive} disabled={record.proState &&( record.proState == 0 || record.proState == 2)?true:false}>
              打印
            </a>
          </Popconfirm>
          {/* <Popconfirm
            title={'驳回原因：' + record.reason}
            okText="关闭"
            showCancel={false}
            disabled={record.proState != 2}
          >
            <Button disabled={record.proState != 2} type="link" hidden={isAdmin}>
              驳回原因
            </Button>
          </Popconfirm> */}
          {/**isAdmin */}
        </Space>
      ),
      fixed: 'right' as 'right',
      width: 280,
    },
  ];
  const handleConfirm = (record:any) => {
    if (projectAgreements && agreements.result && agreements.result.length != 0) {
      let contract = projectAgreements?.filter((item) => item.id == record.id);
      let amount = agreements?.result.filter((item) => item.id == contract[0]?.agreementId);
      record.contractName =  amount[0]?.name;
      record.contractCount = amount[0]?.contractAmount;
    } else {
      record.contractName = ''
      record.contractCount = ''
    }
    record.persons = record.participants.map((son:any,index:any)=>{
      if(index == record.participants.length - 1){
        return subordinatesOnJob.filter(item=>item.id == son)[0].name
      }else {
        return subordinatesOnJob.filter(item=>item.id == son)[0].name + '、'
      }
      
    })
    new Promise<void>((resolve) => {
      console.log(record,'record MMMMMMM')
      setObjectInfo(record);
      resolve();
    }).then(() => {
      // console.log('subordinatesOnJob:',subordinatesOnJob)
      printProj(record);
    });
  };
  if (!isAdmin && archive === '2') {
    columns.splice(2, 0, {
      title: '待办内容',
      dataIndex: 'todoTip',
      key: 'todoTip',
      width: 180,
      render: (text: string, record: Proj) => {
        let proType = record.id.split('-')[2];
        if (record.proState == 2) {
          return '重新申请审核';
        } else if (proType === 'SZ') {
          return '免费维护期不足三个月，请及时签署维护合同';
        } else if (proType === 'SH') {
          return '维护服务即将不足三个月，请及时巡检';
        } else {
          return '-----';
        }
      },
    });
  }
  //=====zhouyueyang
  const [params, setParams] = useState({
    regions: [],
    industries: [],
    projTypes: [],
    page: 1,
    pageSize:10,
    confirmYear: null,
    group: [],
    status: '',
    name: '',
    contractState: '',
    acceptanceStatus: '',
  });
  const handleChange = (value = '', type: string) => {
    setParams({
      ...params,
      [type]:
        type !== 'regions' && type !== 'industries' && type !== 'projTypes' ? String(value) : value,
    });
  };
  const handleChangeCas = (value: any, type: string) => {
    setParams({
      ...params,
      group: value,
    });
  };
  const onChange = (confirmYear: any) => {
    setParams({
      ...params,
      confirmYear,
    });
  };
  const handleChangeInput = (name: string) => {
    setParams({
      ...params,
      name,
    });
  };
  const pageChange = (page: any,pageSize:any) => {
    console.log('page:',page,'pageSize:',pageSize)
    setParams({ ...params, page,pageSize });
    setQuery({
      ...query,
      ...params,
      page,
      pageSize,
      group:
        params.group.length !== 0
          ? params.group.reduce((accumulator: string, currentValue: string) => {
              return `${accumulator}/${currentValue}`;
            }, '')
          : '',
    });
  };
  const searchBtn = () => {
    setParams({
      ...params,
      page: 1,
    });
    setQuery({
      ...query,
      ...params,
      page: 1,
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
      regions: [],
      industries: [],
      projTypes: [],
      page: 1,
      confirmYear: null,
      group: [],
      status: '',
      name: '',
      contractState: '',
    });
    setQuery({
      ...query,
      ...params,
      regions: [],
      industries: [],
      projTypes: [],
      page: 1,
      confirmYear: null,
      group: '',
      status: '',
      name: '',
      contractState: '',
    });
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
  const [orgCodeOptions] = useState(
    Object.keys(orgCode).map((s) => ({ label: orgCode[s], value: s })),
  );
  const [zoneCodeOptions] = useState(
    Object.keys(zoneCode).map((s) => ({ label: zoneCode[s], value: s })),
  );
  const [projTypeOptoins] = useState(
    Object.keys(projType).map((s) => ({ label: projType[s], value: s })),
  );
  const [statusOptions] = useState(projStatus.map((s) => ({ label: s[1], value: s[0] })));
  const [groupsOptions] = useState(groupDatas(groupType));
  const [contractStatesOptions] = useState([
    {
      value: '0',
      label: '未签署',
    },
    {
      value: '1',
      label: '已签署',
    },
  ]);
  const [confirmYearOptions, setConfirmYearOptions] = useState([]);
  useEffect(() => {
    if (yearManages) {
      
      let yearManages_ = yearManages.filter((item) => item.enable == true);
      setConfirmYearOptions(yearManages_);
    }
    
  }, [yearManages]);

  // const [customerListData, setCustomerListData] = useState({} as any);
  // const queryCustomerVariables: QueryCustomersArgs = {
  //   region: region || '',
  //   industry: industry || '',
  //   page: 1,
  //   pageSize: 100000
  // };
  // const customerQuery = gql`
  //   query GetCustomers($region: String!, $industry: String!,$page:Int!,$pageSize:Int!) {
  //     customers(region: $region, industry: $industry,page:$page,pageSize:$pageSize) {
  //       result{
  //         id
  //         name
  //         enable
  //       }
  //       page
  //       total
  //     }
  //   }
  // `;
  // const { data: customerListData1 } = useQuery<CustomersQuery, QueryCustomersArgs>(customerQuery, {
  //   fetchPolicy: 'no-cache',
  //   variables: queryCustomerVariables,
  // });

  // useEffect(() => {

  //   setCustomerListData(customerListData1?.result)
  // }, [customerListData1])

  //=====zhouyueyang
  return (
    <PageContainer className="bgColorWhite paddingBottom20">
      <Row gutter={[16, 16]}>
        <Col className="gutter-row">
          <Input
            id="proName"
            value={params.name}
            key="search"
            addonBefore="项目名称"
            allowClear
            onChange={(e) => {
              handleChangeInput(e.target.value);
            }}
          />
        </Col>
        <Col className="gutter-row">
          <label>行业：</label>
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            value={params.industries}
            mode="multiple"
            allowClear
            className="width120"
            placeholder="请选择"
            onChange={(value: any, event) => {
              handleChange(value, 'industries');
            }}
            options={orgCodeOptions}
          />
        </Col>
        <Col className="gutter-row">
          <label>区域：</label>
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            value={params.regions}
            mode="multiple"
            allowClear
            className="width120"
            placeholder="请选择"
            onChange={(value: any, event) => handleChange(value, 'regions')}
            options={zoneCodeOptions}
          />
        </Col>
        <Col className="gutter-row">
          <label>类型：</label>
          <Select
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            value={params.projTypes}
            mode="multiple"
            allowClear
            className="width120"
            placeholder="请选择"
            onChange={(value: any, event) => handleChange(value, 'projTypes')}
            options={projTypeOptoins}
          />
        </Col>
        <Col className="gutter-row">
          <label>阶段状态：</label>
          <Select
            value={params.status}
            allowClear
            className="width120"
            placeholder="请选择"
            onChange={(value, event) => handleChange(value, 'status')}
            options={statusOptions}
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
        <Col className="gutter-row">
          <label>确认年度：</label>
          {/* <DatePicker
            format="YYYY"
            value={params.confirmYear ? moment(params.confirmYear, 'YYYY') : null}
            picker="year"
            onChange={(value, event) => {
              onChange(event);
            }}
          /> yearManages*/}
          <Select
            value={params.confirmYear}
            allowClear
            className="width120"
            placeholder="请选择"
            onChange={(value, event) => handleChange(value, 'confirmYear')}
            fieldNames={{ value: 'code', label: 'name' }}
            options={confirmYearOptions}
          />
        </Col>
        <Col className="gutter-row">
          <label>合同状态：</label>
          <Select
            value={params.contractState}
            allowClear
            className="width120"
            placeholder="请选择"
            onChange={(value, event) => handleChange(value, 'contractState')}
            options={contractStatesOptions}
          />
        </Col>
        {/* <Col className="gutter-row">
          <label>验收状态：</label>
          <Select
            value={params.acceptanceStatus}
            allowClear
            className="width120"
            placeholder="请选择"
            onChange={(value, event) => handleChange(value, 'acceptanceStatus')}
            options={acceptanceStatusOptions}
          />
        </Col> */}
        <Col>
          <Radio.Group
            className="gutter-row displayInlineBlock"
            key="archive"
            value={archive}
            onChange={(e) => {
              setArchive(e.target.value);
              setQuery({
                ...query,
                ...params,
                page: 1,
                group:
                  params.group.length !== 0
                    ? params.group.reduce((accumulator: string, currentValue: string) => {
                        return `${accumulator}/${currentValue}`;
                      }, '')
                    : '',
              });
              setParams({ ...params, page: 1 });
            }}
          >
            <Radio.Button value="0">项目</Radio.Button>
            {isAdmin ? (
              <Radio.Button value="1">归档项目</Radio.Button>
            ) : (
              <Radio.Button value="2">
                <Badge count={todoProjsTotal}>待办项目</Badge>
              </Radio.Button>
            )}
          </Radio.Group>
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
      <Table
        className="marginTop20"
        loading={loading}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={!isAdmin && archive === '2' ? todoProjs : projs}
        scroll={{ x: 1500 }}
        pagination={false}
        size="middle"
        bordered
      />
      <div className="paginationCon marginTop20 lineHeight32">
        <Pagination
          onChange={(page, pageSize) => pageChange(page,pageSize)}
          current={params.page}
          total={total}
          className="floatRight "
          showSizeChanger
        />
        <label className="floatRight ">一共{total}条</label>
      </div>

      <DialogForm
        ref={ref}
        title="编辑项目"
        width={1000}
        submitHandle={(v: ProjectInput) => pushProj(v)}
      >
        {ProjForm}
      </DialogForm>
      <DialogForm ref={dailyRef} title="查看日报" width={1300}>
        {DailyModal}
      </DialogForm>
      <DialogForm
        ref={activeRef}
        title="项目活动管理"
        width={1000}
        submitHandle={(v: ProjectInput) => pushProj(v)}
      >
        {ProjActiveForm}
      </DialogForm>
      <iframe id="print-frame" style={{display:'none'}}></iframe>
      <div id='printContent' style={{display:'none'}}>
        <table style={{width:'100%',textAlign:'center',borderCollapse: 'collapse',fontSize:'14px',tableLayout: 'fixed'}}>
              {/**objectInfo */}
              <colgroup>
                <col style={{ width: '28mm' }} />
                <col style={{ width: '28mm' }} />
                <col style={{ width: '28mm' }} />
                <col style={{ width: '28mm' }} />
                <col style={{ width: '28mm' }} />
                <col style={{ width: '28mm' }} />
              </colgroup>
              <tbody>
                <tr >
                  <td colSpan={6} style={{fontSize:'20px',border:'1px solid #000',padding:'10px'}}>立项申请书</td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>项目名称</td>
                  <td colSpan={3} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.name}</td>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>项目类型</td>
                  <td style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo?.id ? projType[objectInfo.id.split('-')[2]] : ''}</td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>项目编号</td>
                  <td colSpan={3} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.id}</td>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>项目负责人</td>
                  <td style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{subordinates.find((user: { id: string }) => user.id === objectInfo.leader)?.name}</td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>产品名称</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.productName}</td>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>工作量评估</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.estimatedWorkload}</td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>客户单位</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo?.customerObj ? objectInfo?.customerObj.name : ''}</td>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>地址</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.address}</td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>客户联系人</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.customerContact}</td>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>联系方式</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.contactDetailsCus}</td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>商户联系人</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.merchantContact}</td>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>联系方式</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.contactDetailsMerchant}</td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>销售负责人</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.salesManager}</td>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>联系方式</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.copyrightNameSale}</td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>合同名称</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.contractName}</td>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>合同金额</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.contractCount}</td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>著作权名称</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.copyrightName}</td>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>项目阶段</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.status == 'onProj' ? '启动' : objectInfo.status == 'endProj' ? '关闭' :'' }</td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>项目说明</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}></td>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>项目参与人员</td>
                  <td colSpan={2} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.persons}</td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td  style={{borderRight:'1px solid #000',padding:'10px'}}>项目概况</td>
                  <td  colSpan={5} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.description}</td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>项目安排</td>
                  <td colSpan={5} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{objectInfo.projectArrangement}</td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>申请人(签字)</td>
                  <td colSpan={3} style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{subordinates.find((user: { id: string }) => user.id === objectInfo.leader)?.name}</td>
                  <td  style={{borderRight:'1px solid #000',padding:'10px'}}>立项日期</td>
                  <td style={{borderRight:'1px solid #000',padding:'10px',wordWrap: 'break-word', wordBreak: 'break-all'}}>{moment().format('YYYY-MM-DD')}</td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>部门经理意见(签字)</td>
                  <td colSpan={5} style={{borderRight:'1px solid #000',padding:'10px'}}></td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>销售部意见(签字)</td>
                  <td colSpan={5} style={{borderRight:'1px solid #000',padding:'10px'}}></td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>财务部意见(签字)</td>
                  <td colSpan={5} style={{borderRight:'1px solid #000',padding:'10px'}}></td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>副总经理意见(签字)</td>
                  <td colSpan={5} style={{borderRight:'1px solid #000',padding:'10px'}}></td>
                </tr>
                <tr style={{border:'1px solid #000'}}>
                  <td style={{borderRight:'1px solid #000',padding:'10px'}}>总经理意见(签字)</td>
                  <td colSpan={5} style={{borderRight:'1px solid #000',padding:'10px'}}></td>
                </tr>
                <tr>
                <td ></td>
                <td ></td>
                <td ></td>
                <td ></td>
                <td ></td>
                <td ></td>
                </tr>
               
              </tbody>
        </table>
      </div>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Project />
  </ApolloProvider>
);
