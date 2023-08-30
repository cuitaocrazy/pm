import type { Query } from '@/apollo';
import { useStore } from 'vuex'
import { useQuery } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const queryGqlMe = gql`{
  me {
    id
    name
    access
    groups
  }
}`

const queryGql = gql`
  {
    status {
      id
      pId
      name
      code
      enable
      remark
      sort
      isDel
      createDate
    }
    industries {
      id
      name
      code
      enable
      remark
      sort
      isDel
      createDate
    }
    regions {
      id
      name
      code
      enable
      remark
      sort
      isDel
      createDate
    }
  }
`;
export function useInitState() {
  const meQuery = useQuery<Query>(queryGqlMe);
  const state = useQuery<Query>(queryGql);
  const store = useStore()
  
  meQuery.onResult((queryResult) => {
    if (queryResult.data) {
      store.commit('setCurrentUser', queryResult.data)
    }
  });
  state.onResult((queryResult) => {
    if (queryResult.data) {
      store.commit('setInintState', queryResult.data)
    }
  });
  return {};
}
