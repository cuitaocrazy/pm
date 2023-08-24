import type { Expense as CostType, CostInput } from '@/apollo';
import { client } from '@/apollo';
import { PageContainer } from '@ant-design/pro-layout';
import { ApolloProvider } from '@apollo/client';
import { Space, Table, Input } from 'antd';
import moment from 'moment';
import React, { useRef, useState } from 'react';
import { useCostState } from './hook';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import ExpenseForm from './ExpenseForm';
import { Button } from 'antd';
import { append, last, unnest, zip } from 'ramda';
import { useBaseState } from '@/pages/utils/hook';
import { SearchOutlined } from '@ant-design/icons';
import type { FilterDropdownProps } from 'antd/lib/table/interface';

type CostRowType = {
  id: string;
  participant: string;
  proj: string;
  amount: number;
  type: string;
  description?: string;
  createDate: string;
  key: string;
  raw: CostType;
};

function getColumns(
  editHandle: (cost: CostRowType) => void,
  deleteHandle: (id: string) => void,
  visibleIndex: number[][],
  userFilter: { text: string; value: string }[],
  search: (filterDropdownProps: FilterDropdownProps) => any,
) {
  const makeGroupProps = (children: any, row: CostRowType, index: number) => {
    const obj = {
      children,
      props: {} as any,
    };
    if (visibleIndex.findIndex((i) => i[0] === index) !== -1) {
      // eslint-disable-next-line prefer-destructuring
      obj.props.rowSpan = visibleIndex.find((i) => i[0] === index)![1];
    } else {
      obj.props.rowSpan = 0;
    }
    return obj;
  };
  const makeGroupRender = (value: string, row: CostRowType, index: number) => {
    return makeGroupProps(value, row, index);
  };
  return [
    {
      title: '人员',
      dataIndex: 'participant',
      key: 'participant',
      filters: userFilter,
      onFilter: (value: string | number | boolean, record: { raw: CostType }) => {
        return record.raw.participant.id === value;
      },
      render: makeGroupRender,
    },
    {
      title: '项目',
      dataIndex: 'proj',
      key: 'proj',
      filterDropdown: search,
    },
    {
      title: '金额(元)',
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '创建日期',
      dataIndex: 'createDate',
      key: 'createDate',
      render: (createDate: string, row: CostRowType, index: number) => {
        return makeGroupProps(moment(createDate, 'YYYYMMDD').format('YYYY年MM月DD日'), row, index);
      },
    },
    {
      title: '操作',
      dataIndex: 'id',
      key: 'id',
      render: (id: string, record: CostRowType, index: number) =>
        makeGroupProps(
          <Space>
            <a key="edit" onClick={() => editHandle(record)}>
              编辑
            </a>
            <a key="delete" onClick={() => deleteHandle(id)}>
              删除
            </a>
          </Space>,
          record,
          index,
        ),
    },
  ];
}

const Cost = () => {
  const { buildProjName } = useBaseState()
  const [localState, setLocalState] = useState<{
    search: string;
  }>({ search: '' });

  const getShowCost = (costRows: CostType[]) => {
    return costRows
      .filter((costRow) => {
        if (localState.search === '' || localState.search === undefined) {
          return true;
        }
        if (costRow.items[0]) {
          return costRow.items.reduce((result: boolean, item) => {
            return (
              result ||
              buildProjName(item.project.id, item.project.name).indexOf(localState.search) > -1
            );
          }, false);
        }
        return false;
      })
      .map((costRow: CostType) => {
        const newcostRow = {
          ...costRow,
          ...{
            items: costRow.items.filter((item) => {
              if (localState.search === '' || localState.search === undefined) {
                return true;
              }
              return (
                buildProjName(item.project.id, item.project.name).indexOf(localState.search) > -1
              );
            }),
          },
        };
        return newcostRow;
      });
  };

  const state = useCostState();
  const revertCostRow = getShowCost(state.costs);
  const rows = unnest(
    revertCostRow.map((cost) =>
      cost.items.map((p) => ({
        id: cost.id,
        participant: cost.participant.name,
        proj: buildProjName(p.project.id, p.project.name),
        amount: p.amount,
        type: p.type,
        description: p.description || undefined,
        createDate: cost.createDate,
        raw: cost,
      })),
    ),
  ).map((r, index) => ({ key: r.id + index, ...r }));
  const costProjCountList = rows.map((c) => c.raw.items.length);

  const firstIndexByCost = costProjCountList.reduce((s, e) => append(e + last(s)!, s), [0]);

  const visibleIndex = zip(firstIndexByCost, costProjCountList);
  const ref = useRef<FormDialogHandle<CostInput>>(null);

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

  const search = (filterDropdownProps: FilterDropdownProps) => (
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
  );

  const userFilter = revertCostRow
    .map((cost) => {
      return { value: cost.participant.id, text: cost.participant.name };
    })
    .sort((a, b) => {
      return a.value > b.value ? 1 : -1;
    })
    .filter((item, index, arr) => {
      if (index === 0) return true;
      return arr[index - 1].value !== item.value;
    });

  return (
    <PageContainer
      extra={[
        <Button key="create" type="primary" onClick={() => ref.current!.showDialog()}>
          新建
        </Button>,
      ]}
    >
      <Table
        loading={state.loading}
        columns={getColumns(
          ({ raw }) => {
            ref.current!.showDialog({
              id: raw.id,
              participant: raw.participant.id,
              projs: raw.items.map((p) => ({
                id: p.project.id,
                amount: p.amount,
                type: p.type,
                description: p.description,
              })),
            });
          },
          state.deleteCost,
          visibleIndex,
          userFilter,
          search,
        )}
        dataSource={rows}
        rowKey={(record) => record.key}
      />

      <DialogForm submitHandle={(v: CostInput) => state.pushCost(v)} ref={ref} title="费用编辑">
        {ExpenseForm}
      </DialogForm>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Cost />
  </ApolloProvider>
);
