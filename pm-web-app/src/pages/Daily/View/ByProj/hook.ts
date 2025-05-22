import { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryProjDailyArgs } from '@/apollo';
import moment, { Moment } from 'moment';

const QueryProjs = gql`
  query ($page: Int, $pageSize: Int) {
    iLeadProjs_(page: $page, pageSize: $pageSize) {
      result {
        id
        name
      }
      total
      page
    }
  }
`;

export function useProjsState() {
  const [queryUsers, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(QueryProjs, {
    fetchPolicy: 'no-cache',
    variables: {
      page: 1,
      pageSize: 1000000,
    },
  });

  useEffect(() => {queryUsers()}, [queryUsers]);
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
            enabled
          }
          timeConsuming
          content
        }
      }
    }
  }
`;

export function useDailyState() {
  const [projId, setProjId] = useState('20230101');

  const [query, { loading: queryLoading, data: queryData }] = useLazyQuery<
    Query,
    QueryProjDailyArgs
  >(QueryDaily, {
    fetchPolicy: 'no-cache',
  });

  const daily = queryData?.projDaily || {
    id: '',
    dailies: [],
  };
  //获取当月的上一个月的最后两周的时间到当前月的下一个月的最近两周的时间
  const getDate_ = (curDate: moment.Moment) => {
    const moment = require('moment');

    // 获取当前日期
    const currentDate = moment(curDate);

    // 获取上个月的最后一天
    const lastMonthLastDay = currentDate.clone().subtract(1, 'months').endOf('month');

    // 获取上个月的最后两周的时间范围
    const lastMonthLastTwoWeeks = [
      lastMonthLastDay.clone().subtract(2, 'weeks').startOf('week'),
      lastMonthLastDay.clone().subtract(1, 'weeks').endOf('week'),
    ];

    // 获取下个月的最近两个星期的时间范围
    const nextMonthFirstDay = currentDate.clone().add(1, 'months').startOf('month');
    const nextMonthNextTwoWeeks = [
      nextMonthFirstDay.clone().startOf('week'),
      nextMonthFirstDay.clone().add(1, 'weeks').endOf('week'),
    ];
    return [
      lastMonthLastTwoWeeks[0].format('YYYYMMDD'),
      nextMonthNextTwoWeeks[1].format('YYYYMMDD'),
    ];
  };

  const queryDaily = (id: string, value: Moment) => {

    setProjId(id);
    query({
      variables: {
        projId: id,
        startDate: getDate_(value)[0],
        endDate: getDate_(value)[1],
      },
    });
  };

  return {
    loading: queryLoading,
    queryDaily,
    projId,
    daily,
    setProjId,
  };
}
