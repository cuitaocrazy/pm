import { request } from 'umi';
import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';

export async function query() {
  return request<API.CurrentUser[]>('/api/users');
}

export async function queryCurrent() {
  return request<API.CurrentUser>('/api/currentUser');
}

export async function queryNotices(): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/notices');
}

const cache = new InMemoryCache();
const link = createHttpLink({
  uri: 'http://localhost:8000/api/graphql',
});

const client = new ApolloClient({
  // Provide required constructor fields
  cache,
  link,
});

export async function getCurrentUser() {
  return client
    .query({
      query: gql`
        {
          me {
            name
            access
          }
        }
      `,
    })
    .then((r) => r.data.me);
}
