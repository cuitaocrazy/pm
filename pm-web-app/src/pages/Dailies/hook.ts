import { createRef, useEffect, useRef, useState } from 'react';
import { gql, MutationFunctionOptions, useLazyQuery, useMutation } from '@apollo/client';
import moment from 'moment';
import { Daily, Mutation, MutationPushDailyArgs, ProjDaily, Query } from '@/apollo';
import * as R from 'ramda';
import { message } from 'antd';
import { ProjItemHandle } from './ProjItem';

const myQuery = gql`
  {
    myDailies {
      id
      dailies {
        date
        projs {
          projId
          timeConsuming
          content
        }
      }
    }

    myProjs {
      id
      name
      isAssignMe
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
  const dailies = data?.myDailies?.dailies || [];
  const projs = data?.myProjs || [];
  const completedDailiesDates = dailies?.map((d) => d.date) || [];
  const refs = useRef<React.RefObject<ProjItemHandle>[]>([]);

  const isNew = dailies?.find((d) => d.date === currentDate) === undefined;

  useEffect(() => {
    refresh();
  }, []);

  const mySetCurrentDaily = (c: Daily | undefined) => {
    if (c) {
      const existProjs = c.projs.map((p) => p.projId);
      const allProjs = projs.filter((p) => p.isAssignMe).map((p) => p.id);
      const notExistProjs = R.difference(allProjs, existProjs);
      const newProjs = notExistProjs.map((id) => ({ projId: id, timeConsuming: 0, content: '' }));
      setCurrentDaily(R.over(R.lensProp('projs'), (p: ProjDaily[]) => [...p, ...newProjs], c));
    } else
      setCurrentDaily({
        date: currentDate,
        projs:
          projs
            ?.filter((p) => p.isAssignMe)
            .map((p) => ({ projId: p.id, timeConsuming: 0, content: '' })) || [],
      });
  };

  useEffect(() => {
    if (data !== undefined) {
      const c = dailies?.find((d) => d.date === currentDate);
      mySetCurrentDaily(c);
    }
  }, [data, currentDate]);

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

  const getProjName = (projId: string) => projs.find((p) => p.id === projId)?.name;
  const getLastDaily = (lastDate: string) => R.findLast((d) => d.date < lastDate, dailies);

  return {
    loading: queryLoading || mutationLoading,
    projs,
    currentDate,
    filter,
    completedDailiesDates,
    currentDaily,
    isNew,
    refresh,
    setCurrentDate,
    setCurrentDaily: mySetCurrentDaily,
    setFilter,
    pushDaily: oPushDaily,
    getProjName,
    refs: refs.current,
    getOffset: () => refs.current[0].current?.getOffset() || 0,
    getLastDaily,
  };
}
