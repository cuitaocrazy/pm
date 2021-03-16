import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ChangePmForm from './ChangePmForm';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';
import { Button, Table, message, Input, Space } from 'antd';
import type { ChangePmInput } from '@/apollo';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { useChangePmState } from './hook';
import type { Project, User } from '@/apollo';
import { buildProjName } from '@/pages/utils';
import { SearchOutlined } from '@ant-design/icons';
import type { FilterDropdownProps } from 'antd/lib/table/interface';

const ChangePm: React.FC<any> = () => {
  const ref = useRef<FormDialogHandle<ChangePmInput>>(null);
  const state = useChangePmState();

  const users = state?.users || [];
  const [isRemovePart, setReomvePart] = useState<boolean>(true);
  const [selectProject, setSelectProject] = useState<string[]>([]);
  const [searchState, setSearchState] = useState<{ search: string }>({
    search: '',
  });

  const onFinish = (value: ChangePmInput) => {
    return state.pushChangePm({ ...value, ...{ isRemovePart, projIds: selectProject } });
  };

  const handleSearch = (selectedKeys: any[], confirm: () => void) => {
    confirm();

    setSearchState({
      search: selectedKeys[0],
    });
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchState({ search: '' });
  };

  const getShowProject = () => {
    return state?.projs.filter((proj) => {
      if (searchState.search === '' || searchState.search === undefined) {
        return true;
      }
      return buildProjName(proj.id, proj.name).indexOf(searchState.search) > -1;
    });
  };

  const revertProjs = getShowProject().map((proj) => {
    return { ...proj, filters: '', onFilter: '' };
  });

  const hasProj = (user: User) => {
    return (
      getShowProject().filter((proj) => {
        return proj.leader === user.id;
      }).length > 0
    );
  };

  const userFilter = users
    .filter((user) => hasProj(user))
    .map((user) => {
      return { text: user.name, value: user.id };
    });

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
      filterDropdown: (filterDropdownProps: FilterDropdownProps) => (
        <div style={{ padding: 8 }}>
          <Input
            value={filterDropdownProps.selectedKeys[0]}
            onChange={(e) =>
              filterDropdownProps.setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() =>
              handleSearch(filterDropdownProps.selectedKeys, filterDropdownProps.confirm)
            }
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() =>
                handleSearch(filterDropdownProps.selectedKeys, filterDropdownProps.confirm)
              }
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              搜索
            </Button>
            <Button
              onClick={() => {
                if (filterDropdownProps.clearFilters) {
                  return handleReset(filterDropdownProps.clearFilters);
                }
                return '';
              }}
              size="small"
              style={{ width: 90 }}
            >
              重置
            </Button>
          </Space>
        </div>
      ),
    },
    {
      title: '当前项目经理',
      dataIndex: 'leader',
      filters: userFilter,
      onFilter: (value: string | number | boolean, record: Project) => {
        return record.leader === value;
      },
      render: (leader: string) => {
        return users.filter((user) => user.id === leader)[0]?.name;
      },
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectProject,
    onChange: (selectedRowKeys: any[]) => {
      setSelectProject(selectedRowKeys);
    },
  };
  return (
    <PageContainer
      extra={[
        <Button
          key="modify"
          type="primary"
          onClick={() => {
            if (selectProject.length === 0) {
              message.success('修改项目经理需要选择项目');
            } else {
              ref.current!.showDialog();
            }
          }}
        >
          修改
        </Button>,
      ]}
    >
      <Table
        dataSource={revertProjs}
        pagination={false}
        columns={columns}
        rowKey="id"
        rowSelection={rowSelection}
      />
      <DialogForm submitHandle={onFinish} ref={ref} title="选择新的项目经理">
        {ChangePmForm(users, isRemovePart, setReomvePart)}
      </DialogForm>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <ChangePm />
  </ApolloProvider>
);
