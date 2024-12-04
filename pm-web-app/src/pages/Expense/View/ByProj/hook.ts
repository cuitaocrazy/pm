/*
 * @Author: 13718154103 1161593628@qq.com
 * @Date: 2024-11-21 09:20:39
 * @LastEditors: 13718154103 1161593628@qq.com
 * @LastEditTime: 2024-12-03 09:20:30
 * @FilePath: /pm/pm-web-app/src/pages/Expense/View/ByProj/hook.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useEffect } from 'react';
import * as R from 'ramda';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryProjCostsArgs } from '@/apollo';

const QueryProjs = gql`
  query ($pageSize: Int) {
    iLeadProjs_(pageSize: $pageSize) {
      result {
        id
        name
      }
    }
  }
`;

export function useProjsState() {
  const [queryUsers, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(QueryProjs, {
    fetchPolicy: 'no-cache',
    variables: {
      pageSize: 10000000,
    },
  });

  useEffect(() => {
    queryUsers();
  }, [queryUsers]);
  const projs = queryData?.iLeadProjs_.result || [];

  return {
    loading: queryLoading,
    projs,
  };
}

const QueryCosts = gql`
  query ($projId: String!) {
    projCosts(projId: $projId) {
      project {
        id
        name
      }
      items {
        employee {
          id
          name
        }
        amount
        createDate
        type
        description
      }
    }
  }
`;

export function useCostsState() {
  const [projId, setProjId] = useState<string>();

  const [query, { loading: queryLoading, data: queryData }] = useLazyQuery<
    Query,
    QueryProjCostsArgs
  >(QueryCosts, {
    fetchPolicy: 'no-cache',
  });

  const projCosts = R.isNil(queryData)
    ? {
        project: {
          id: projId,
          name: projId,
        },
        items: [],
      }
    : queryData.projCosts;

  const queryCosts = (id: string) => {
    setProjId(id);
    query({
      variables: {
        projId: id,
      },
    });
  };

  return {
    loading: queryLoading,
    queryCosts,
    projId,
    projCosts,
  };
}
