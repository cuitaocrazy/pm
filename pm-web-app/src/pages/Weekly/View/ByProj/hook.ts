/*
 * @Author: 13718154103 1161593628@qq.com
 * @Date: 2024-11-21 09:20:39
 * @LastEditors: 13718154103 1161593628@qq.com
 * @LastEditTime: 2024-12-03 09:15:45
 * @FilePath: /pm/pm-web-app/src/pages/Weekly/View/ByProj/hook.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryProjDailyArgs } from '@/apollo';
import { Moment } from 'moment';

const QueryProjs = gql`
  query ($pageSize: Int) {
    iLeadProjs_(pageSize: $pageSize) {
      result {
        id
        name
        participants
        timeConsuming
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

const QueryDaily = gql`
  query GetDaily($projId: String!, $startDate: String, $endDate: String) {
    projDaily(projId: $projId, startDate: $startDate, endDate: $endDate) {
      project {
        id
      }
      dailies {
        date
        dailyItems {
          employee {
            id
            name
          }
          timeConsuming
          content
        }
      }
    }
  }
`;

export function useDailyState() {
  const [projId, setProjId] = useState<string>();

  const [query, { loading: queryLoading, data: queryData }] = useLazyQuery<
    Query,
    QueryProjDailyArgs
  >(QueryDaily, {
    fetchPolicy: 'no-cache',
  });

  const daily = queryData?.projDaily || {
    project: null,
    dailies: [],
  };

  const queryDaily = (id: string = '', time: Moment) => {
    setProjId(id);
    query({
      variables: {
        projId: id,
        startDate: time.format('YYYYMMDD'),
        endDate: time.endOf('week').format('YYYYMMDD'),
      },
    });
  };

  return {
    loading: queryLoading,
    queryDaily,
    projId,
    daily,
  };
}
