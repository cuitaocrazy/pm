import { useState, useEffect } from 'react';
import { gql, useLazyQuery } from '@apollo/client';
import type { Query, QueryChartsArgs } from '@/apollo';
import moment from 'moment';

const QueryCharts = gql`
  query GetCharts($year: String!) {
    charts(year: $year) {
      costOfMonths {
        key
        value
      }
      expenseOfMonths {
        key
        value
      }
      costOfProjs {
        key
        value
      }
      costOfEmps {
        key
        value
      }
      costOfGroups {
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
    () =>{
      query({
        variables: {
          year: year.toString(),
        },
      })},
    [query, year],
  );

  const charts = queryData?.charts || {
    costOfMonths: [],
    expenseOfMonths: [],
    mdOfMonths: [],
    costOfProjs: [],
    costOfEmps: [],
    costOfGroups: [],
  };

  return {
    loading: queryLoading,
    charts,
    setYear,
    year,
  };
}
