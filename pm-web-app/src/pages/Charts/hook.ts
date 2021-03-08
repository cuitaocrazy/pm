import { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryChartsArgs } from '@/apollo';
import moment from 'moment';

const QueryCharts = gql`
  query GetCharts($year: String!) {
    charts(year: $year) {
      monthAmounts {
        key
        value
      }
      monthCosts {
        key
        value
      }
      projCosts {
        key
        value
      }
      empCosts {
        key
        value
      }
      groupCosts {
        key
        value
      }
    }
  }
`;

export function useChartsState() {
  const [year, setYear] = useState<number>(moment().year());

  const [query, { loading: queryLoading, data: queryData }] = useLazyQuery<Query, QueryChartsArgs>(
    QueryCharts,
    {
      fetchPolicy: 'no-cache',
    },
  );

  useEffect(
    () =>
      query({
        variables: {
          year: year.toString(),
        },
      }),
    [query, year],
  );

  const charts = queryData?.charts || {
    monthAmounts: [],
    monthCosts: [],
    monthMds: [],
    projCosts: [],
    empCosts: [],
    groupCosts: [],
  };

  return {
    loading: queryLoading,
    charts,
    setYear,
    year,
  };
}
