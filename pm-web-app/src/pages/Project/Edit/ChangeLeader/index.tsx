import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ChangeLeaderForm from './ChangeLeaderForm';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';
import { Button, Table, message, Input, Row, Col, Select, Pagination} from 'antd';
import type { ChangePmInput } from '@/apollo';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { useChangePmState, } from './hook';
import type { Project } from '@/apollo';
import { useBaseState } from '@/pages/utils/hook';
// import { SearchOutlined } from '@ant-design/icons';
// import type { FilterDropdownProps } from 'antd/lib/table/interface';
import '@/common.css';


const ChangePm: React.FC<any> = () => {
  const { buildProjName } = useBaseState()
  const ref = useRef<FormDialogHandle<ChangePmInput>>(null);
  const {query,setQuery,projs,users,pushChangePm,total,realSubordinates} = useChangePmState();
  // const state = useChangePmState();
  const localUsers = users || [];
  const localSubordinates = realSubordinates || [];
  const [localState, setLocalState] = useState<{
    isRemovePart: boolean;
    selectProject: string[];
    search: string;
  }>({ isRemovePart: false, selectProject: [], search: '' });

  const [params,setParams] = useState({
    leaders: [],
    name: '',
    page: 1,
    pageSize: 10,
  })
  

  const onFinish = (value: ChangePmInput) => {
    return pushChangePm({
      ...value,
      ...{ isRemovePart: localState.isRemovePart, projIds: localState.selectProject },
    });
  };

  // const handleSearch = (selectedKeys: any[], confirm: () => void) => {
  //   confirm();

  //   setLocalState({
  //     ...localState,
  //     ...{
  //       search: selectedKeys[0],
  //     },
  //   });
  // };

  // const handleReset = (clearFilters: () => void) => {
  //   clearFilters();
  //   setLocalState({
  //     ...localState,
  //     ...{
  //       search: '',
  //     },
  //   });
  // };

  const getShowProject = () => {
    return projs?.filter((proj) => {
      if (localState.search === '' || localState.search === undefined) {
        return true;
      }
      return buildProjName(proj.id, proj.name).indexOf(localState.search) > -1;
    });
  };

  const revertProjs = getShowProject().map((proj) => {
    return { ...proj, filters: '', onFilter: '' };
  });
  const handleChangeInput = (name:string)=>{
    setParams({
      ...params,
      name,
      page:1
    })
  }

  const handleChange = (value:[]) => {
    setParams({
      ...params,
      leaders: value,
      page:1
    })
  };

  const pageChange = (page:any) => {
    setParams({
      ...params,
      page,
    })
    setQuery({
      ...query,
      ...params,
      page,
    })
  }

  const searchBtn = () => {
    setParams({
      ...params,
      page:1
    })
    setQuery({
      ...query,
      ...params,
      page:1,
    })
  }

  const canaelBtn = ()=>{
    setParams({
      ...params,
      name:'',
      leaders: [],
      page: 1,
    })
    setQuery({
      ...query,
      ...params,
      name:'',
      leaders: [], 
      page: 1,
    })
  }

  // const userFilter = localSubordinates
  //   // .filter((user) => hasProj(user))
  //   .map((user) => {
  //     return { text: user.name, value: user.id };
  //   });

  // const optionArr:any = []
  // if(userFilter.length>0) {
  //   userFilter.forEach((item) => {
  //     const newOption = {
  //       label: item.text,
  //       value: item.value,
  //     }
  //     optionArr.push(newOption)
  //   })
  // }
  const optionArr = localSubordinates.map((user) => {
    return { label: user.name, value: user.id };
  })
  
  const columns = [
    {
      title: 'id',
      dataIndex: 'id',
      colSpan: 0,
      render: () => {
        return {
          children: null,
          props: { colSpan: 0 },
        };
      },
    },
    {
      title: '项目名称',
      dataIndex: 'name',
      render: (name: string, record: Project) => {
        return buildProjName(record.id, name);
      },
      // filterDropdown: (filterDropdownProps: FilterDropdownProps) => (
      //   <div style={{ padding: 8 }}>
      //     <Input
      //       value={filterDropdownProps.selectedKeys[0]}
      //       onChange={(e) =>
      //         filterDropdownProps.setSelectedKeys(e.target.value ? [e.target.value] : [])
      //       }
      //       onPressEnter={() =>
      //         handleSearch(filterDropdownProps.selectedKeys, filterDropdownProps.confirm)
      //       }
      //       style={{ width: 188, marginBottom: 8, display: 'block' }}
      //     />
      //     <Space>
      //       <Button
      //         type="primary"
      //         onClick={() =>
      //           handleSearch(filterDropdownProps.selectedKeys, filterDropdownProps.confirm)
      //         }
      //         icon={<SearchOutlined />}
      //         size="small"
      //         style={{ width: 90 }}
      //       >
      //         搜索
      //       </Button>
      //       <Button
      //         onClick={() => {
      //           if (filterDropdownProps.clearFilters) {
      //             return handleReset(filterDropdownProps.clearFilters);
      //           }
      //           return '';
      //         }}
      //         size="small"
      //         style={{ width: 90 }}
      //       >
      //         重置
      //       </Button>
      //     </Space>
      //   </div>
      // ),
    },
    {
      title: '当前项目经理',
      dataIndex: 'leader',
      // filters: userFilter,
      onFilter: (value: string | number | boolean, record: Project) => {
        return record.leader === value;
      },
      render: (leader: string) => {
        return localUsers.filter((user) => user.id === leader)[0]?.name;
      },
    },
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: any[]) => {
      setLocalState({
        ...localState,
        ...{ selectProject: selectedRowKeys },
      });
    },
  };

  const setReomvePart = (isRemovePart: boolean) => {
    setLocalState({ ...localState, ...{ isRemovePart } });
  };

  return (
    <PageContainer className="bgColorWhite paddingBottom20">
      <Row gutter={16} className='justfyCenter'>
        <Col className="gutter-row">
          <label>项目名称：</label> 
            <Input
              id="proName"
              value={params.name}
              key="search"
              className="width160"
              placeholder="请输入项目名称"
              allowClear
              onChange={(e) =>  handleChangeInput(e.target.value)}
            />
        </Col>
        <Col className="gutter-row">
          <label>当前项目经理：</label> 
            <Select
              value={params.leaders}
              allowClear
              className="width160"
              placeholder="请选择项目经理"
              options={optionArr}
              onChange={(value:any) => handleChange(value)}
            > 
            </Select> 
        </Col>
      </Row>
      <Row justify="center" className='marginTop20'>
        <Col>
          <Button type="primary" onClick={()=>searchBtn()} className='marginRight10'>查询</Button>
          <Button className='marginRight10' onClick={()=>canaelBtn()}>重置</Button>
          <Button
            key="modify"
            type="primary"
            onClick={() => {
              if (localState.selectProject.length === 0) {
                message.success('修改项目经理需要选择项目');
              } else {
                ref.current!.showDialog();
              }
            }}
          >
            修改
          </Button>
        </Col>
      </Row>
      
      <Table
        className="marginTop20"
        dataSource={revertProjs}
        pagination={false}
        columns={columns}
        rowKey="id"
        rowSelection={rowSelection}
      />
      <div className="paginationCon marginTop20 lineHeight32">
        <Pagination onChange={(page, pageSize)=>pageChange(page)} current={params.page} total={total} className="floatRight " />
        <label className="floatRight ">一共{total}条</label>
      </div>
      <DialogForm submitHandle={onFinish} ref={ref} title="选择新的项目经理">
        {ChangeLeaderForm(localUsers, localState.isRemovePart, setReomvePart)}
      </DialogForm>
      
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <ChangePm />
  </ApolloProvider>
);
