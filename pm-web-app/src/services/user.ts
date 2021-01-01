import { request } from 'umi';
import { gql } from '@apollo/client';
import { client } from '@/apollo';

export async function query() {
  return request<API.CurrentUser[]>('/api/users');
}

export async function queryCurrent() {
  return request<API.CurrentUser>('/api/currentUser');
}

export async function queryNotices(): Promise<any> {
  return request<{ data: API.NoticeIconData[] }>('/api/notices');
}

export async function getCurrentUser() {
  return client
    .query({
      query: gql`
        {
          me {
            id
            name
            access
            group
          }
        }
      `,
    })
    .then((r) => r.data.me);
}
