import { gql } from '@apollo/client';
import { client } from '@/apollo';

export async function getCurrentBasics() {
  return client
    .query({
      query: gql`
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
          groups
        }
      `,
      fetchPolicy: 'no-cache'
    })
    .then((r) => r.data);
}
