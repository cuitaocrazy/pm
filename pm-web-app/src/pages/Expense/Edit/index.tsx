import type { Expense as CostType, CostInput } from '@/apollo';
import { client } from '@/apollo';
import { PageContainer } from '@ant-design/pro-layout';
import { ApolloProvider } from '@apollo/client';
import { Space, Table } from 'antd';
import moment from 'moment';
import React, { useRef } from 'react';
import { useCostState } from './hook';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import Expense from './ExpenseForm';
import { Button } from 'antd';
import { append, last, unnest, zip } from 'ramda';
import { buildProjName } from '@/pages/utils';

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
      render: makeGroupRender,
    },
    {
      title: '项目',
      dataIndex: 'proj',
      key: 'proj',
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
  const state = useCostState();
  const rows = unnest(
    state.costs.map((cost) =>
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
  const costProjCountList = state.costs.map((c) => c.items.length);
  const firstIndexByCost = costProjCountList.reduce((s, e) => append(e + last(s)!, s), [0]);
  const visibleIndex = zip(firstIndexByCost, costProjCountList);
  const ref = useRef<FormDialogHandle<CostInput>>(null);
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
        )}
        dataSource={rows}
        rowKey={(record) => record.key}
      />

      <DialogForm submitHandle={(v: CostInput) => state.pushCost(v)} ref={ref} title="费用编辑">
        {Expense}
      </DialogForm>
    </PageContainer>
  );
};

export default () => (
  <ApolloProvider client={client}>
    <Cost />
  </ApolloProvider>
);
