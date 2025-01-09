import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef, useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Input,
  ButtonProps,
  DatePicker,
  Col,
  Row,
  Button,
  Select,
  Pagination,
  Cascader,
  Space,
} from 'antd';
import type { Project as Proj, ProjectInput, ActiveInput, AgreementInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useProjStatus } from './hook';
import ProjDetail from './ProjDetail';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { useBaseState } from '@/pages/utils/hook';
import { getStatusDisplayName, projStatus } from './utils';
import '@/common.css';
import AgreementForm from './AgreementForm';

const Project: React.FC<any> = (props) => {
  const detailRef = useRef<FormDialogHandle<ProjectInput>>(null);
  const {
    projs,
    subordinates,
    customers,
    projectAgreements,
    agreements,
    loading,
    setQuery,
    query,
    total,
    access,
    pushAgreement,
    getArgByProId,
    yearManages,
  } = useProjStatus();
  const { status, orgCode, zoneCode, projType, buildProjName, groupType } = useBaseState();
  const editHandle = (proj: Proj) => {
    const agree = projectAgreements.filter((item) => item.id === proj.id);
    const { actives, ...pro } = proj;
    detailRef.current?.showDialog({
      ...pro,
      contName: agree.length ? agree[0].agreementId : '',
      actives: (actives as ActiveInput[])?.map((item) => {
        // @ts-ignore
        item.date = moment(item.date);
        return item;
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

  //=====zhouyueyang
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
  });
  const handleChange = (value = '', type: string) => {
    setParams({
      ...params,
      [type]:
        type !== 'regions' && type !== 'industries' && type !== 'projTypes' ? String(value) : value,
      page: 1,
    });
  };
  const handleChangeCas = (value: any, type: string) => {
    setParams({
      ...params,
      group: value,
      page: 1,
    });
  };
  const onChange = (confirmYear: any) => {
    setParams({
      ...params,
      confirmYear,
      page: 1,
    });
  };
  const handleChangeInput = (name: string) => {
    setParams({
      ...params,
      name,
      page: 1,
    });
  };
  const handleEnter = (name: string) => {
    setParams({
      ...params,
      name,
      page: 1,
    });
  };
  const pageChange = (page: any,pageSize:any) => {
    setParams({ ...params, page ,pageSize});
    let obj = { group: params.group.length !== 0
      ? params.group.reduce((accumulator: string, currentValue: string) => {
          return `${accumulator}/${currentValue}`;
        }, '')
      : '',};
    setQuery({
      ...query,
      ...params,
      page,
      pageSize,
      ...obj,
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
      ...{
        group:
          params.group.length !== 0
            ? params.group.reduce((accumulator: string, currentValue: string) => {
                return `${accumulator}/${currentValue}`;
              }, '')
            : '',
      },
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
    });
    setQuery({
      ...query,
      ...params,
      ...{
        regions: [],
        industries: [],
        projTypes: [],
        page: 1,
        confirmYear: null,
        group: '',
        status: '',
        name: '',
      },
    });
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
  const ref = useRef<FormDialogHandle<AgreementInput>>(null);
  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      render: (text: string, record: Proj,index:number) => (
         ++index
      ),

    },
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
          <a onClick={() => editHandle(record)}>{buildProjName(record.id, record.name)} </a>
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
      title: '客户名称',
      dataIndex: 'customer',
      key: 'customer',
      render: (text: string, record: Proj) => {
        return record.customerObj?.name;
      },
      width: 150,
    },
    {
      title: '合同名称',
      dataIndex: 'contName',
      key: 'contName',
      render: (text: string, record: Proj) => {
        // return record.agreements && record.agreements.length > 0 ? record.agreements[0].name : '';
        let agreementId = projectAgreements.filter(item=>item.id==record.id) || []
          let contract: string | any[] = []
          if(agreementId.length > 0){
            contract = agreements.filter(item=>item.id == agreementId[0].agreementId) || []
          }
          if(contract.length > 0){
            return contract[0].name
          }else{
            
            return '---'
          }
          
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
      title: '项目部门',
      dataIndex: 'group',
      key: 'group',
      width: '200px',
    },
    {
      title: '合同状态',
      dataIndex: 'contStatus',
      key: 'contStatus',
      render: (text: string, record: Proj) => {
        // return status?.find((statu) => statu.id === record.contStatus)?.name;
        let agreementId = projectAgreements.filter(item=>item.id==record.id) || []
          let contract: string | any[] = []
          if(agreementId.length > 0){
            contract = agreements.filter(item=>item.id == agreementId[0].agreementId) || []
          }
          
          if(contract.length > 0){
            return  '已签署'
          }else{
            
            return '未签署'
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
  ];
  // if (access?.includes('realm:assistant')) {
  //   columns.push({
  //     title: '操作',
  //     key: 'action',
  //     render: (id: string, record: Proj) => {
  //       let proType = record.id.split('-')[2];
  //       return (
  //         proType !== 'SQ' && (
  //           <Space>
  //             <a
  //               key="archive"
  //               onClick={async () => {
  //                 // 点击操作
  //                 let res = await getArgByProId(record.id);
  //                 if (res.data.getAgreementsByProjectId.length !== 0) {
  //                   res.data.getAgreementsByProjectId[0].contactProj = [record.id];
  //                   res.data.getAgreementsByProjectId[0].time = [
  //                     moment(res.data.getAgreementsByProjectId[0].startTime),
  //                     moment(res.data.getAgreementsByProjectId[0].endTime),
  //                   ];
  //                   ref.current?.showDialog({ ...res.data.getAgreementsByProjectId[0] });
  //                 } else {
  //                   ref.current?.showDialog({
  //                     name: '',
  //                     customer: record.customer,
  //                     type: '',
  //                     contactProj: [record.id],
  //                     startTime: '',
  //                     endTime: '',
  //                     fileList: [],
  //                     remark: '',
  //                   });
  //                 }
  //               }}
  //             >
  //               添加合同
  //             </a>
  //           </Space>
  //         )
  //       );
  //     },
  //     fixed: 'right',
  //     width: 120,
  //   } as any);
  // }

  //=====zhouyueyang

  const onCancelButtonProps: ButtonProps = {
    style: { display: 'none' }, // 设置样式让按钮消失
  };
  const [confirmYearOptions, setConfirmYearOptions] = useState([]);
  useEffect(() => {
    if (yearManages) {
      
      let yearManages_ = yearManages.filter((item) => item.enable == true);
      setConfirmYearOptions(yearManages_);
    }
  }, [yearManages]);
  return (
    <PageContainer className="bgColorWhite paddingBottom20">
      <Row gutter={[16, 16]}>
        <Col className="gutter-row">
          <Input
            value={params.name}
            key="search"
            addonBefore="项目名称"
            allowClear
            onChange={(e) => handleChangeInput(e.target.value)}
            onPressEnter={(e: any) => {
              handleEnter(e.target.value);
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
          <Select
            value={params.confirmYear}
            allowClear
            className="width120"
            placeholder="请选择"
            onChange={(value, event) => handleChange(value, 'confirmYear')}
            fieldNames={{ value: 'code', label: 'name' }}
            options={confirmYearOptions}
          />
          {/* <DatePicker
            format="YYYY"
            value={params.confirmYear ? moment(params.confirmYear, 'YYYY') : null}
            picker="year"
            onChange={(value, event) => {
              onChange(event);
            }}
          /> */}
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
        scroll={{ x: 1700 }}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={projs}
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
        cancelButtonProps={onCancelButtonProps}
        ref={detailRef}
        title="项目详情"
        width={1000}
      >
        {ProjDetail}
      </DialogForm>
      <DialogForm
        submitHandle={(v: AgreementInput) => {
          let customerName = customers.find((item) => item.id === v.customer)?.name;
          return pushAgreement({ ...v, customerName });
        }}
        ref={ref}
        title="添加合同"
      >
        {AgreementForm}
      </DialogForm>
    </PageContainer>
  );
};
export default () => {
  return (
    <ApolloProvider client={client}>
      <Project />
    </ApolloProvider>
  );
};
