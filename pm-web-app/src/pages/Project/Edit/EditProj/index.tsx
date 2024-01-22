import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef, useState } from 'react';
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
import type {
  Project as Proj, ProjectInput, ActiveInput
} from '@/apollo';
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
    customers,
    projectAgreements,
    loading,
    archive,
    setArchive,
    archiveProj,
    deleteProj,
    pushProj,
    setQuery,
    query,
    total,
  } = useProjStatus();
  const { status, orgCode, zoneCode, projType, buildProjName, groupType } = useBaseState();

  const editHandle = (proj: Proj, openRef: any) => {
    const agree = projectAgreements.filter((item) => item.id === proj.id);
    const { actives, ...pro } = proj;
    openRef.current?.showDialog({
      ...pro,
      contName: agree.length ? agree[0].agreementId : '',
      actives: actives as ActiveInput[],
      // @ts-ignore
      acceptDate: pro.acceptDate && moment(pro.acceptDate),
    });
  };
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
      render: (status: string) => (
        <Tag color={status ? (status === 'onProj' ? 'success' : 'default') : 'warning'}>
          {getStatusDisplayName(status)}
        </Tag>
      ),
    },
    {
      title: '项目部门',
      dataIndex: 'group',
      key: 'group',
      width: '200px',
    },
    {
      title: '预算人天',
      dataIndex: 'estimatedWorkload',
      key: 'estimatedWorkload',
      width: '80px',
      render: (text: string, record: Proj) => <Tag color="cyan">{text ? text : 0}</Tag>,
    },
    {
      title: '实际人天',
      dataIndex: 'timeConsuming',
      key: 'timeConsuming',
      width: '80px',
      render: (text: number, record: Proj) => (
        <Button type="text" onClick={() => dailyRef.current?.showDialog(record)}>
          <Tag color="cyan">{text ? ((text - 0) / 8).toFixed(2) : 0}</Tag>
        </Button>
      ),
    },
    {
      title: '客户名称',
      dataIndex: 'customer',
      key: 'customer',
      render: (text: string, record: Proj) => {
        return customers?.result?.find((cum) => cum.id === record.customer)?.name;
      },
      width: 150,
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
      dataIndex: 'contStatus',
      key: 'contStatus',
      render: (text: string, record: Proj) => {
        return status?.find((statu) => statu.id === record.contStatus)?.name;
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
    },
    {
      title: '操作',
      key: 'action',
      render: (id: string, record: Proj) => (
        <Space>
          <a
            key="archive"
            onClick={() => {
              editHandle(record, activeRef);
            }}
          >
            添加项目活动
          </a>
          <Popconfirm
            title="将项目数据归档，只能到归档列表查看！"
            okText="是"
            cancelText="否"
            onConfirm={() => archiveProj(record.id)}
          >
            <a key="archive" hidden={record.isArchive}>
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
        </Space>
      ),
      fixed: 'right' as 'right',
      width: 180,
    },
  ];

  if (!isAdmin && archive === '2') {
    columns.splice(2, 0, {
      title: '待办内容',
      dataIndex: 'todoTip',
      key: 'todoTip',
      width: 180,
      render: (text: string, record: Proj) => text,
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
  })
  const handleChange = (value = '', type: string) => {
    setParams({
      ...params,
      [type]: type !== 'regions' && type !== 'industries' && type !== 'projTypes' ? String(value) : value,
      page: 1
    })
  };
  const handleChangeCas = (value: any, type: string) => {
    setParams({
      ...params,
      group: value,
      page: 1,
    })
  }
  const onChange = (confirmYear: any) => {
    setParams({
      ...params,
      confirmYear,
      page: 1
    })
  };
  const handleChangeInput = (name: string) => {
    setParams({
      ...params,
      name,
      page: 1
    })
  }
  const pageChange = (page: any) => {
    setParams({ ...params, page })
    setQuery({
      ...query,
      ...params,
      page,
      group: ''
    })
  }
  const searchBtn = () => {
    setParams({
      ...params,
      page: 1,
    })
    setQuery({
      ...query,
      ...params,
      page: 1,
      group: params.group.length !== 0 ? params.group.reduce((accumulator: string, currentValue: string) => { return `${accumulator}/${currentValue}` }, '') : ''
    })
  }
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
    })
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
    })

  }
  const groupDatas = (inputArray: any) => {
    let result: any = []
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
    })
    return result
  }
  // console.log("index-----groupType------" + JSON.stringify(groupType))
  // console.log("index-----groupDatas------" + JSON.stringify(groupDatas(groupType)))
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
  const [groupsOptions] = useState(
    groupDatas(groupType)
  );


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
  // console.log('-------')
  // console.log(customerListData)
  // console.log(customerListData1)
  // useEffect(() => {
  //   console.log('useEffect')
  //   // console.log(customerListData1?.result)
  //   setCustomerListData(customerListData1?.result)
  // }, [customerListData1])

  //=====zhouyueyang
  return (
    <PageContainer className="bgColorWhite paddingBottom20">
      <Row gutter={16}>
        <Col className="gutter-row">
          <Input
            id="proName"
            value={params.name}
            key="search"
            addonBefore="项目名称"
            allowClear
            onChange={(e) => { handleChangeInput(e.target.value) }}

          />
        </Col>
        <Col className="gutter-row">
          <label>行业：</label>
          <Select
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
            onChange={(value, event) => { handleChangeCas(value, 'group') }}
            options={groupsOptions} />
        </Col>
        <Col className="gutter-row">
          <label>确认年度：</label>
          <DatePicker format="YYYY" value={params.confirmYear ? moment(params.confirmYear, 'YYYY') : null} picker="year" onChange={(value, event) => { onChange(event) }} />
        </Col>
        <Col>
          <Radio.Group
            className="gutter-row displayInlineBlock"
            key="archive"
            value={archive}
            onChange={(e) => setArchive(e.target.value)}
          >
            <Radio.Button value="0">项目</Radio.Button>
            {isAdmin ? (
              <Radio.Button value="1">归档项目</Radio.Button>
            ) : (
              <Radio.Button value="2">
                <Badge count={todoProjs.length}>待办项目</Badge>
              </Radio.Button>
            )}
          </Radio.Group>
        </Col>
      </Row>
      <Row justify="center" className='marginTop20'>
        <Col ><Button onClick={() => searchBtn()} type="primary" className='marginRight10'>查询</Button>
          <Button onClick={() => canaelBtn()} >重置</Button></Col>
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
      />
      <div className="paginationCon marginTop20 lineHeight32">

        <Pagination onChange={(page, pageSize) => pageChange(page)} current={params.page} total={total} className="floatRight " />
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
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Project />
  </ApolloProvider>
);
