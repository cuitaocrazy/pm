import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';

const Supervisor = () => {

  return (
    <>
      主管
    </>
  )
}

export default () => (
  <ApolloProvider client={client}>
    <Supervisor />
  </ApolloProvider>
);
