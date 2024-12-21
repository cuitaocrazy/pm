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
    proConfirmStateManages,
    incomeConfirmProj,
    agreements,
    projectAgreements,
  } = useProjStatus();
  const { status, orgCode, zoneCode, projType, buildProjName, groupType } = useBaseState();
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
  const columns = [
    {
      title: '项目ID',
      dataIndex: 'id',
      key: 'id',
      fixed: 'left',
      render: (text: string, record: Proj) => (
        <div>
          <a onClick={() => editHandle(record, ref)}>{buildProjName(record.id, record.name)} </a>
        </div>
      ),
      width: 250,
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
            console.log(contract,'VNVNVNVN')
            if(contract.length > 0){
              return  '已签署'
            }else{
              console.log('未签署未签署')
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
      title: '确认状态',
      dataIndex: 'incomeConfirm',
      key: 'incomeConfirm',
      render: (text: string, record: Proj) => {
        return record.incomeConfirm == 0
          ? '未确认'
          : record.incomeConfirm == 1
          ? '待确认'
          : record.incomeConfirm == 2
          ? '已确认'
          : record.incomeConfirm == 3
          ? '无法确认'
          : '---';
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
    },
    {
      title: '合同金额',
      dataIndex: 'contractAmount',
      key: 'contractAmount',
      render: (contractAmount: string, record: Proj) => {
        let contract = projectAgreements.filter((item) => item.id == record.id);
        let amount = agreements?.result.filter((item) => item.id == contract[0]?.agreementId);
        return amount[0]?.contractAmount;
      },
      width: 100,
    },
    {
      title: '税后金额',
      dataIndex: 'afterTaxAmount',
      key: 'afterTaxAmount',
      render: (afterTaxAmount: string, record: Proj) => {
        let contract = projectAgreements.filter((item) => item.id == record.id);
        let amount = agreements?.result.filter((item) => item.id == contract[0]?.agreementId);
        return amount[0]?.afterTaxAmount;
      },
      width: 100,
    },
    {
      title: '确认金额',
      dataIndex: 'recoAmount',
      key: 'recoAmount',
      render: (recoAmount: string) => {
        return recoAmount;
      },
      width: 100,
    },
    {
      title: '合同签订日期',
      dataIndex: 'contractSignDate',
      key: 'contractSignDate',
      render: (contractSignDate: string, record: Proj) => {
        let contract = projectAgreements.filter((item) => item.id == record.id);
        let amount = agreements?.result.filter((item) => item.id == contract[0]?.agreementId);
        return moment(amount[0]?.contractSignDate).format('YYYY-MM-DD');
      },
      width: 100,
    },
    {
      title: '项目部门',
      dataIndex: 'group',
      key: 'group',
      width: '250px',
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

    // {
    //   title: '操作',
    //   key: 'action',
    //   render: (id: string, record: Proj) => (
    //     <Space>
    //       <Popconfirm
    //         disabled={
    //           !(
    //             status?.find((statu) => statu.id === record.acceStatus)?.name == '已验收' &&
    //             record.contractState == 1
    //           )
    //         }
    //         title="把项目进行收入确认？"
    //         okText="是"
    //         cancelText="否"
    //         onConfirm={() => incomeConfirmProj(record.id)}
    //       >
    //         <Button
    //           type="link"
    //           key="confirm"
    //           disabled={
    //             !(
    //               status?.find((statu) => statu.id === record.acceStatus)?.name == '已验收' &&
    //               record.contractState == 1
    //             )
    //           }
    //         >
    //           {/** */}
    //           收入确认
    //         </Button>
    //       </Popconfirm>
    //     </Space>
    //   ),
    //   fixed: 'right' as 'right',
    //   width: 100,
    // },
  ];

  if (!isAdmin && archive === '2') {
    columns.splice(2, 0, {
      title: '待办内容',
      dataIndex: 'todoTip',
      key: 'todoTip',
      width: 180,
      render: (text: string, record: Proj) => {
        let proType = record.id.split('-')[2];
        if (proType === 'SZ') {
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
    confirmYear: null,
    group: [],
    status: '',
    name: '',
    contractState: '',
    acceptanceStatus: '',
    confirmYear: '',
    incomeConfirm: '',
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
  const pageChange = (page: any) => {
    setParams({ ...params, page });
    setQuery({
      ...query,
      ...params,
      page,
      group: '',
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
      incomeConfirm: '',
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
      incomeConfirm: '',
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
  const [incomeConfirmOptions, setIncomeConfirmOptions] = useState([]);
  useEffect(() => {
    if (yearManages) {
      let yearManages_ = yearManages.filter((item) => item.enable == true);
      setConfirmYearOptions(yearManages_);
    }
    if (proConfirmStateManages) {
      let proConfirmStateManages_ = proConfirmStateManages.filter((item) => item.enable == true);
      setIncomeConfirmOptions(proConfirmStateManages_);
    }
  }, [yearManages, proConfirmStateManages]);

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
      <Row gutter={16}>
        {/* <Col className="gutter-row">
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
        </Col> */}
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
          <label>确认状态：</label>
          <Select
            value={params.incomeConfirm}
            allowClear
            className="width120"
            placeholder="请选择"
            onChange={(value, event) => handleChange(value, 'incomeConfirm')}
            fieldNames={{ value: 'code', label: 'name' }}
            options={incomeConfirmOptions}
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
        {/* <Col className="gutter-row">
          <label>阶段状态：</label>
          <Select
            value={params.status}
            allowClear
            className="width120"
            placeholder="请选择"
            onChange={(value, event) => handleChange(value, 'status')}
            options={statusOptions}
          />
        </Col> */}

        {/* <Col className="gutter-row">
          <label>合同状态：</label>
          <Select
            value={params.contractState}
            allowClear
            className="width120"
            placeholder="请选择"
            onChange={(value, event) => handleChange(value, 'contractState')}
            options={contractStatesOptions}
          />
        </Col> */}
        {/**incomeConfirm */}

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
        {/* <Col>
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
        </Col> */}
      </Row>
      <Row justify="center" className="marginTop20">
        <Col>
          <Button onClick={() => searchBtn()} type="primary" className="marginRight10">
            查询
          </Button>
          <Button onClick={() => canaelBtn()}>重置</Button>
        </Col>
      </Row>
      {/* <div style={{ overflowX: 'auto' }}> */}
      <Table
        className="marginTop20"
        loading={loading}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={!isAdmin && archive === '2' ? todoProjs : projs}
        scroll={{ x: 1000 }}
        pagination={false}
        size="middle"
      />
      {/* </div> */}
      <div className="paginationCon marginTop20 lineHeight32">
        <Pagination
          onChange={(page, pageSize) => pageChange(page)}
          current={params.page}
          total={total}
          className="floatRight "
        />
        <label className="floatRight ">一共{total}条</label>
      </div>

      <DialogForm
        ref={ref}
        title="收入确认"
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
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Project />
  </ApolloProvider>
);
