import type {
  Mutation,
  MutationDeleteIndustryArgs,
  MutationPushIndustryArgs,
  IndustryInput,
  Query,
} from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useCallback, useEffect } from 'react';
import { message } from 'antd';
const queryGql = gql`
  {
    industries {
      id
      name
      code
      remark
      sort
      enable
      isDel
      createDate
    }
  }
`;

const pushIndustryGql = gql`
  mutation ($industry: IndustryInput!) {
    pushIndustry(industry: $industry)
  }
`;

const deleteIndustryGql = gql`
  mutation ($id: ID!) {
    deleteIndustry(id: $id)
  }
`;

export function useIndustryState() {
  const [refresh, { loading: queryLoading, data: queryData }] = useLazyQuery<Query>(queryGql, {
    fetchPolicy: 'no-cache',
  });
  const [deleteIndustryHandle, { loading: deleteLoading }] = useMutation<
    Mutation,
    MutationDeleteIndustryArgs
  >(deleteIndustryGql);
  const [pushIndustryHandle, { loading: pushLoading }] = useMutation<Mutation, MutationPushIndustryArgs>(
    pushIndustryGql,
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  const industries = queryData?.industries || [];

  const deleteIndustry = useCallback(
    async (id: string) => {
      await deleteIndustryHandle({ variables: { id } });
      refresh();
    },
    [deleteIndustryHandle, refresh],
  );

  const pushIndustry = useCallback(
    async (industry: IndustryInput) => {
      await pushIndustryHandle({
        variables: {
          industry,
        },
      }).then(() => {
        refresh();
      }).catch((error) => {
        message.error(error.message);
      });
    },
    [pushIndustryHandle, refresh],
  );

  return {
    loading: queryLoading || deleteLoading || pushLoading,
    industries,
    refresh,
    deleteIndustry,
    pushIndustry,
  };
}
