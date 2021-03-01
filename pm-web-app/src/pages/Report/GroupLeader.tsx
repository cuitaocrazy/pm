import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';

const GroupLeader = () => {
  return <>组长</>;
};

export default () => (
  <ApolloProvider client={client}>
    <GroupLeader />
  </ApolloProvider>
);
