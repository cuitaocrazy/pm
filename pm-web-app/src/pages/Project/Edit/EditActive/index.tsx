import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef, useState, } from 'react';
import { Table, Tag, Input, Space, ButtonProps, Select,Col, Row, Pagination , DatePicker,Button, Cascader} from 'antd';
import type { Project as Proj, ProjectInput, ActiveInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useProjStatus } from './hook';
import ProjForm from './ProjForm';
import ProjDetail from './ProjDetail';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { useBaseState } from '@/pages/utils/hook';
import { getStatusDisplayName, projStatus } from './utils';
import '@/common.css';

const Project: React.FC<any> = () => {
  const ref = useRef<FormDialogHandle<ProjectInput>>(null);
  const detailRef = useRef<FormDialogHandle<ProjectInput>>(null);
  const { projectAgreements, routeProjType, loading, pushProj,setQuery,query,total,tmpProjsResult} = useProjStatus();
  const { status, orgCode, zoneCode, buildProjName,groupType, subordinates } = useBaseState();
  console.log(subordinates)
  console.log(projectAgreements)
  const editHandle = (proj: Proj) => {
    const agree = projectAgreements.filter(item => item.id === proj.id)
    const { actives, ...pro } = proj;
    ref.current?.showDialog({ 
      ...pro,
      contName: agree.length ? agree[0].agreementId : '', 
      actives: (actives as ActiveInput[]),
      // @ts-ignore
      acceptDate: pro.acceptDate && moment(pro.acceptDate),
    });
  };

  // =======yuheming
  const [params,setParams] = useState({
    regions:[],
    industries:[],
    projTypes:[],
    page: 1,
    confirmYear:null,
    group:[],
    status:'',
    name:'',
  })
  
  const onChange = (confirmYear:any) => {
    setParams({
      ...params,
      confirmYear,
      page:1
    })
  };

  const handleChange = (value='', type:string) => {
    setParams({
      ...params,
      [type]:type !== 'regions' && type !== 'industries' && type !== 'projTypes' ? String(value) : value,
      page:1
    })
  };

  const handleChangeCas = (value:any,type:string) => {
    setParams({
      ...params,
      group:value,
      page:1,
    })
  }

  const searchBtn = ()=>{
    setParams({
      ...params,
      page:1
    })
    setQuery({
      ...query,
      ...params,
      page:1,
      group:params.group.length !== 0 ? params.group.reduce((accumulator:string, currentValue:string)=> {return `${accumulator}/${currentValue}`},'') : ''
    })
  }

  const canaelBtn = ()=>{
    setParams({
      ...params,
      regions:[],
      industries:[],
      projTypes:[],
      page: 1,
      confirmYear:null,
      group:[],
      status:'',
      name:'',
    })
    setQuery({
      ...query,
      ...params,
      regions:[],
      industries:[],
      projTypes:[],
      page: 1,
      confirmYear:null,
      group:'',
      status:'',
      name:'',
    })
  }

  const handleChangeInput = (name:string)=>{
    setParams({
      ...params,
      name,
      page:1
    })
  }
  
  // 分页器
  const pageChange = (page:any)=>{
    setParams({
      ...params,
      page
    })
    setQuery({
      ...query,
      ...params,
      page,
      group:''
    })
  }

  // 部门
  const groupDatas = (inputArray:any)=>{
    let result:any = []
    inputArray.forEach((item:any) => {
      const path = item.substring(1).split('/');
      let currentLevel = result;
      path.forEach((segment:any, index:number) => {
        const existingSegment = currentLevel.find((el:any) => el.value === segment);
  
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
  
  // 下拉选框
  const [orgCodeOptions] = useState(
    Object.keys(orgCode).map((s) => ({ label: orgCode[s], value: s })),
  );
  const [zoneCodeOptions] = useState(
    Object.keys(zoneCode).map((s) => ({ label: zoneCode[s], value: s })),
  );
  // const [projTypeOptoins] = useState(
  //   Object.keys(projType).map((s) => ({ label: projType[s], value: s })),
  // );
  const [statusOptions] = useState(projStatus.map((s) => ({ label: s[1], value: s[0] })));

  const [groupsOptions] = useState(
    groupDatas(groupType)
  )
  
  const detailHandle = (proj: Proj) => {
    const agree = projectAgreements.filter(item => item.id === proj.id)
    const { actives, ...pro } = proj;
    detailRef.current?.showDialog({ 
      ...pro,
      contName: agree.length ? agree[0].agreementId : '', 
      actives: (actives as ActiveInput[]),
      // @ts-ignore
      acceptDate: pro.acceptDate && moment(pro.acceptDate),
    });
  };

  const columns = [
    {
      title: '项目名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Proj) => (
        <div>
          <a onClick={() => detailHandle(record)}>{buildProjName(record.id, text)} </a>
        </div>
      ),
      // filters: [
      //   {
      //     text: '行业',
      //     value: 'orgCode',
      //     children: Object.keys(orgCode).map((s) => ({ text: orgCode[s], value: s })),
      //   },
      //   {
      //     text: '区域',
      //     value: 'zoneCode',
      //     children: Object.keys(zoneCode).map((s) => ({ text: zoneCode[s], value: s })),
      //   },
      //   {
      //     text: '类型',
      //     value: 'projType',
      //     children: Object.keys(projType).map((s) => ({ text: projType[s], value: s })),
      //   }
      // ],
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
      // filters: projStatus.map((s) => ({ text: s[1], value: s[0] })),
      onFilter: (value: string | number | boolean, record: Proj) => record.status === value,
    },  
    {
      title: '客户名称',
      dataIndex: 'customer',
      key: 'customer',
      render: (text: string, record: Proj) => {
        return record.customerObj.name
      },
      width:150,
    },
    {
      title: '合同名称',
      dataIndex: 'contName',
      key: 'contName',
      render: (text: string, record: Proj) => {
        // const agree = projectAgreements.filter(item => item.id === record.id)
        // return agree.length ? agreements.find((cum) => cum.id === agree[0].agreementId)?.name : ''
        return record.agreements ? record.agreements[0].name : ''
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
      title: '项目部门',
      dataIndex: 'group',
      key: 'group',
      width: '200px',
      // render: (status: string) =>  {
      //   let name = status&&status.split('/')[2];
      //   return name;
      // },
      // filters: groupType.map((s) => ({ text: s.toString().split('/')[2], value: s })),
      onFilter: (value: string | number | boolean, record: Proj) => record.group === value,
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
      dataIndex: 'id',
      key: 'action',
      render: (id: string, record: Proj) => (
        <Space>
          <a key="change" onClick={() => editHandle(record)}>
            添加{ routeProjType === 'SQ' ? '销售' : '售后'  }活动
          </a>
        </Space>
      ),
      fixed: 'right' as 'right',
      width: 150,
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
            addonBefore="项目名称"
            allowClear
            onChange={(e)=>handleChangeInput(e.target.value)}
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
            options={orgCodeOptions}
            onChange={(value:any, event) => {
              handleChange(value, 'industries');
            }}
          > 
          </Select>        
        </Col>
        <Col className="gutter-row">
          <label>区域：</label> 
          <Select
            value={params.regions}
            mode="multiple"
            allowClear
            className="width120"
            placeholder="请选择"
            onChange={(value:any, event) => handleChange(value, 'regions')}
            options={zoneCodeOptions}
          >
          </Select>
        </Col>
        {/* <Col className="gutter-row">
          <label>类型：</label> 
          <Select
            value={params.projTypes}
            mode="multiple"
            allowClear
            className="width120"
            placeholder="请选择"
            onChange={(value, event) => handleChange(value, 'projTypes')}
            options={projTypeOptoins}
          >
          </Select>
        </Col> */}
        <Col className="gutter-row">
          <label>阶段状态：</label> 
          <Select
            value={params.status}
            allowClear
            className="width120"
            placeholder="请选择"
            onChange={(value, event) => handleChange(value, 'status')}
            options={statusOptions}
          >
          </Select>
        </Col>
        <Col className="gutter-row">
          <label>项目部门：</label> 
          <Cascader 
            value={params.group}
            allowClear
            changeOnSelect
            className="width122"
            placeholder="请选择"
            onChange={(value, event) => handleChangeCas(value, 'group')}
            options={groupsOptions}
          >
          </Cascader>
        </Col>
        <Col className="gutter-row">
          <label>确认年度：</label> 
          <DatePicker format="YYYY" value={params.confirmYear ? moment(params.confirmYear, 'YYYY') : null} picker="year" onChange={(value,event)=>{onChange(event)}} />
        </Col>
      </Row>

      <Row justify="center" className='marginTop20'>
        <Col>
          <Button onClick={()=>searchBtn()} type="primary" className='marginRight10'>查询</Button>
          <Button onClick={()=>canaelBtn()}>重置</Button>
        </Col>
      </Row>
      
      <Table
        className="marginTop20"
        loading={loading}
        scroll={{ x: 1100 }}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={tmpProjsResult}
        size="middle"
        pagination={false}
      />
       <div className="paginationCon marginTop20 lineHeight32">
        <Pagination onChange={(page, pageSize)=>pageChange(page)} current={params.page} total={total} className="floatRight " />
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
      <DialogForm 
      cancelButtonProps={onCancelButtonProps}
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
