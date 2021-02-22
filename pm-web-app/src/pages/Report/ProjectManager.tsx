import React from 'react';
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';

const ProjectManager = () => {

  return (
    <>
      项目经理
    </>
  )
}

export default () => (
  <ApolloProvider client={client}>
    <ProjectManager />
  </ApolloProvider>
);
