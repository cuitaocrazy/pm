import React, { useRef, useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ChangeLeaderForm from './ChangeLeaderForm';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';
import { Button, Table, message, Input, Space } from 'antd';
import type { ChangePmInput } from '@/apollo';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { useChangePmState } from './hook';
import type { Project, User } from '@/apollo';
import { useBaseState } from '@/pages/utils/hook';
import { SearchOutlined } from '@ant-design/icons';
import type { FilterDropdownProps } from 'antd/lib/table/interface';

const ChangePm: React.FC<any> = () => {
  const { buildProjName } = useBaseState()
  const ref = useRef<FormDialogHandle<ChangePmInput>>(null);
  const state = useChangePmState();
  const users = state?.users || [];
  const [localState, setLocalState] = useState<{
    isRemovePart: boolean;
    selectProject: string[];
    search: string;
  }>({ isRemovePart: false, selectProject: [], search: '' });

  const onFinish = (value: ChangePmInput) => {
    return state.pushChangePm({
      ...value,
      ...{ isRemovePart: localState.isRemovePart, projIds: localState.selectProject },
    });
  };

  const handleSearch = (selectedKeys: any[], confirm: () => void) => {
    confirm();

    setLocalState({
      ...localState,
      ...{
        search: selectedKeys[0],
      },
    });
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setLocalState({
      ...localState,
      ...{
        search: '',
      },
    });
  };

  const getShowProject = () => {
    return state?.projs.filter((proj) => {
      if (localState.search === '' || localState.search === undefined) {
        return true;
      }
      return buildProjName(proj.id, proj.name).indexOf(localState.search) > -1;
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
    <PageContainer
      extra={[
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
        {ChangeLeaderForm(users, localState.isRemovePart, setReomvePart)}
      </DialogForm>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <ChangePm />
  </ApolloProvider>
);
