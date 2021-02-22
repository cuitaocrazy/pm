import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';

const Default = () => {

  return (
    <>
      默认
    </>
  )
}

export default () => (
  <ApolloProvider client={client}>
    <Default />
  </ApolloProvider>
);
