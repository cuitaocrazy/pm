import { createRef, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { MutationFunctionOptions } from '@apollo/client';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import moment from 'moment';
import type { EmployeeOfDaily, Mutation, MutationPushDailyArgs, Project, Query } from '@/apollo';
import * as R from 'ramda';
import { message } from 'antd';
import type { ProjItemHandle } from './ProjItem';
import { useModel } from 'umi';

const myQuery = gql`
  {
    myDailies {
      employee {
        id
      }
      dailies {
        date
        dailyItems {
          project {
            id
          }
          timeConsuming
          content
        }
      }
    }

    projs {
      id
      name
      participants
      status
    }
  }
`;

const PushDaily = gql`
  mutation PushDaily($date: String!, $projDailies: [DailyInput!]!) {
    pushDaily(date: $date, projDailies: $projDailies)
  }
`;

export function useDailiesStatus(date?: string) {
  const [currentDate, setCurrentDate] = useState(date || moment().format('YYYYMMDD'));
  const [refresh, { loading: queryLoading, data }] = useLazyQuery<Query>(myQuery, {
    fetchPolicy: 'no-cache',
  });
  const [pushDaily, { loading: mutationLoading }] = useMutation<Mutation, MutationPushDailyArgs>(
    PushDaily,
  );
  const [currentDaily, setCurrentDaily] = useState<EmployeeOfDaily>({
    date: currentDate,
    dailyItems: [],
  });

  const [filter, setFilter] = useState('');
  const { initialState } = useModel('@@initialState');
  const dailies = useMemo(() => data?.myDailies?.dailies || [], [data]);
  const projs = useMemo(() => data?.projs || [], [data]);
  const getSheetForDate = useCallback(
    (
      rawDaily: EmployeeOfDaily = {
        date: currentDate,
        dailyItems: [],
      },
    ) => {
      const projIdsForCurrentDaily = rawDaily.dailyItems.map((p) => p.project.id) || [];
      const projGrouping = R.groupBy<Project>((p) => {
        const writed = projIdsForCurrentDaily.includes(p.id);
        const onProj = p.status !== 'endProj';
        const involved = p.participants.includes(initialState!.currentUser!.id!);

        if (writed && involved && onProj) {
          return 'writedAndInvolvedAndOnProj';
        }

        if (writed && involved && !onProj) {
          return 'writedAndInvolvedAndEndProj';
        }

        if (writed && !involved && onProj) {
          return 'writedAndExcludeAndOnProj';
        }

        if (writed && !involved && !onProj) {
          return 'writedAndExcludeAndEndProj';
        }

        if (!writed && involved && onProj) {
          return 'notWritedAndInvolvedAndOnProj';
        }

        if (!writed && involved && !onProj) {
          return 'notWritedAndInvolvedAndEndProj';
        }

        if (!writed && !involved && onProj) {
          return 'notWritedAndExcludeAndOnProj';
        }

        return 'notWritedAndExcludeAndEndProj';
      });

      const projGroup = projGrouping(projs);
      const sortedProjs = R.reduce<Project[], Project[]>(
        R.concat,
        [],
        [
          projGroup.writedAndInvolvedAndOnProj || [],
          projGroup.writedAndExcludeAndOnProj || [],
          projGroup.writedAndInvolvedAndEndProj || [],
          projGroup.writedAndExcludeAndEndProj || [],
          projGroup.notWritedAndInvolvedAndOnProj || [],
          projGroup.notWritedAndExcludeAndOnProj || [],
          projGroup.notWritedAndInvolvedAndEndProj || [],
          projGroup.notWritedAndExcludeAndEndProj || [],
        ],
      );
      const dailyListOfItems = sortedProjs.map((p) => {
        const currentDailyProj = rawDaily.dailyItems.find((dp) => dp.project.id === p.id);
        if (currentDailyProj) {
          return { ...currentDailyProj, project: p };
        }
        return {
          project: p,
          timeConsuming: 0,
          content: '',
        };
      });
      return { date: currentDate, dailyItems: dailyListOfItems };
    },
    [projs, initialState, currentDate],
  );
  const initSheetForCurrentDaily: EmployeeOfDaily = useMemo(
    () => getSheetForDate(dailies.find((d) => d.date === currentDate)),
    [getSheetForDate, currentDate, dailies],
  );
  const completedDailiesDates = dailies?.map((d) => d.date) || [];
  const refs = useRef<React.RefObject<ProjItemHandle>[]>([]);

  const isNew = dailies?.find((d) => d.date === currentDate) === undefined;

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    setCurrentDaily(initSheetForCurrentDaily);
  }, [initSheetForCurrentDaily]);

  useEffect(() => {
    if (refs.current.length < projs.length) {
      const appendRefs = R.range(0, projs.length - refs.current.length).map(() =>
        createRef<ProjItemHandle>(),
      );

      refs.current = [...refs.current, ...appendRefs];
    }
  }, [projs]);

  const oPushDaily = (
    options?: MutationFunctionOptions<Mutation, MutationPushDailyArgs> | undefined,
  ) =>
    pushDaily(options)
      .then(() => refresh())
      .then(() => message.success(`提交成功`));

  const getLastDaily = (lastDate: string) =>
    getSheetForDate(R.findLast((d) => d.date < lastDate, dailies));

  return {
    loading: queryLoading || mutationLoading,
    dailies,
    currentDate,
    filter,
    completedDailiesDates,
    currentDaily,
    isNew,
    refresh,
    setCurrentDate,
    setCurrentDaily,
    setFilter,
    pushDaily: oPushDaily,
    refs: refs.current,
    getOffset: () => refs.current[0].current?.getOffset() || 0,
    getLastDaily,
    userId: initialState?.currentUser?.id,
  };
}
