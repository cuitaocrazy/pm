import { PageContainer } from '@ant-design/pro-layout';
import React, { useRef,useState} from 'react';
import { Button, Table, Switch } from 'antd';
import type { ProjectClass as ProjectClassType, ProjectClassInput } from '@/apollo';
import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import moment from 'moment';
import { useProjectClassState } from './hook';
import ProjectClassForm from './ProjectClassForm';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';

function getColumns(
  createHandle: (projectclass: ProjectClassType) => void,
  editHandle: (projectclass: ProjectClassType) => void,
  deleteHandle: (id: string) => void,
  changeEnable:(projectclass: ProjectClassType) => void,
) {
  return [
    {
      title: '项目分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: ProjectClassType) => (
        <a onClick={() => editHandle(record)}>{record.name}</a>
      ),
      width: '20%',
    },
    {
      title: '区域项目分类编码',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: '是否启用',
      dataIndex: 'enable',
      key: 'enable',
      render: (text: string, record: ProjectClassType) => (
        <Switch checked={record.enable} onChange={() => changeEnable(record)} />
      )
    },
    {
      title: '排序',
      dataIndex: 'sort',
      key: 'sort',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (createDate: string) => {
        return moment(createDate, 'YYYYMMDD').format('YYYY年MM月DD日');
      },
    },
    // {
    //   title: '操作',
    //   dataIndex: 'id',
    //   key: 'action',
    //   render: (id: string, record: IndustryType) => (
    //     <Space>
    //       <Popconfirm title="是否删除？" okText="是" cancelText="否" onConfirm={() => deleteHandle(id)}>
    //         <a key="delete">
    //           删除
    //         </a>
    //       </Popconfirm>
    //     </Space>
    //   ),
    // },
  ];
}
function ProjectClass() {
  const { projectclasses, loading, deleteProjectClass, pushProjectClass } = useProjectClassState();
  const ref = useRef<FormDialogHandle<ProjectClassInput>>(null);
  const [isAdd,setIsAdd] = useState(true)
  const columns = getColumns(
    (projectclass) => {
      ref.current?.showDialog({
        name: '',
        code: '',
        enable: true,
        sort: 0,
        remark: '',
      });
    },
    (projectclass) => {
      ref.current?.showDialog({ ...projectclass,type_:'edit' });
      setIsAdd(false)
    },
    deleteProjectClass,
    (projectclass) => {
      pushProjectClass({
        id: projectclass.id,
        name: projectclass.name,
        code: projectclass.code,
        enable: !projectclass.enable,
        sort: projectclass.sort,
        remark: projectclass.remark,
      })
    }
  );
  return (
    <PageContainer
      extra={[
        <Button
          key="create"
          type="primary"
          onClick={() =>{
            ref.current?.showDialog({
              name: '',
              code: '',
              enable: true,
              sort: 0,
              remark: '',
            })
            setIsAdd(true)
          }}
        >
          新建
        </Button>,
      ]}
    >
      <Table
        loading={loading}
        rowKey={(record) => record.id}
        columns={columns}
        dataSource={projectclasses}
        pagination={false}
        size="middle"
      />
      <DialogForm submitHandle={(v: ProjectClassInput) => pushProjectClass(v)} ref={ref} title={isAdd == true ? '新增项目分类' : '编辑项目分类'}>
        {ProjectClassForm}
      </DialogForm>
    </PageContainer>
  );
}

export default () => (
  <ApolloProvider client={client}>
    <ProjectClass />
  </ApolloProvider>
);
