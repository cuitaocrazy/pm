import { createRef, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import type { MutationFunctionOptions } from '@apollo/client';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import moment from 'moment';
import type { Daily, Mutation, MutationPushDailyArgs, Project, Query } from '@/apollo';
import * as R from 'ramda';
import { message } from 'antd';
import type { ProjItemHandle } from './ProjItem';
import { useModel } from 'umi';

const myQuery = gql`
  {
    myDailies {
      id
      dailies {
        date
        projs {
          project {
            id
            name
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
  const [currentDaily, setCurrentDaily] = useState<Daily>({ date: currentDate, projs: [] });
  const [filter, setFilter] = useState('');
  const { initialState } = useModel('@@initialState');
  const dailies = useMemo(() => data?.myDailies?.dailies || [], [data]);
  const projs = useMemo(() => data?.projs || [], [data]);
  const completedDailiesDates = dailies?.map((d) => d.date) || [];
  const refs = useRef<React.RefObject<ProjItemHandle>[]>([]);

  const isNew = dailies?.find((d) => d.date === currentDate) === undefined;

  useEffect(() => {
    refresh();
  }, [refresh]);

  const buildCurrentDaily = useCallback(
    (c: Daily | undefined) => {
      const involvedGrouping = R.groupBy<Project>((p) =>
        p.participants.includes(initialState!.currentUser!.id!) ? 'involved' : 'exclude',
      );
      const writedGrouping = R.groupBy<Project>((p) =>
        c?.projs.map((dp) => dp.project.id).includes(p.id) ? 'writed' : 'notWrite',
      );
      const writedGroup = writedGrouping(projs);
      const writedAndInvolvedGroup = involvedGrouping(writedGroup.writed || []);
      const notWriteAndInvolvedGroup = involvedGrouping(writedGroup.notWrite || []);

      const sortedProjs = R.reduce<Project[], Project[]>(
        R.concat,
        [],
        [
          writedAndInvolvedGroup.involved || [],
          writedAndInvolvedGroup.exclude || [],
          notWriteAndInvolvedGroup.involved || [],
          notWriteAndInvolvedGroup.exclude || [],
        ],
      );
      const dailyListOfItems = sortedProjs.map(
        (p) =>
          c?.projs.find((dp) => dp.project.id === p.id) || {
            project: p,
            timeConsuming: 0,
            content: '',
          },
      );
      setCurrentDaily({ date: currentDate, projs: dailyListOfItems });

      // if (c) {
      //   const writeDailyProjs = c.projs.map((p) => p.project);
      //   const allProjs = projs;
      //   const notWriteDailyProjs = R.differenceWith(
      //     (p1, p2) => p1.id === p2.id,
      //     allProjs,
      //     writeDailyProjs,
      //   );
      //   const newProjs = notWriteDailyProjs.map((proj) => ({
      //     project: proj,
      //     timeConsuming: 0,
      //     content: '',
      //   }));
      //   setCurrentDaily(R.over(R.lensProp('projs'), (p: ProjDaily[]) => [...p, ...newProjs], c));
      // } else
      //   setCurrentDaily({
      //     date: currentDate,
      //     projs: projs?.map((p) => ({ project: p, timeConsuming: 0, content: '' })) || [],
      //   });
    },
    [currentDate, projs, initialState],
  );

  useEffect(() => {
    if (data !== undefined) {
      const c = dailies?.find((d) => d.date === currentDate);
      buildCurrentDaily(c);
    }
  }, [data, currentDate, dailies, buildCurrentDaily]);

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

  const getLastDaily = (lastDate: string) => R.findLast((d) => d.date < lastDate, dailies);

  return {
    loading: queryLoading || mutationLoading,
    currentDate,
    filter,
    completedDailiesDates,
    currentDaily,
    isNew,
    refresh,
    setCurrentDate,
    setCurrentDaily: buildCurrentDaily,
    setFilter,
    pushDaily: oPushDaily,
    refs: refs.current,
    getOffset: () => refs.current[0].current?.getOffset() || 0,
    getLastDaily,
  };
}
