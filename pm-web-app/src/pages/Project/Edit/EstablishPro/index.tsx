import { client } from '@/apollo';
import { ApolloProvider } from '@apollo/client';
import ProjForm from './ProjForm';

const Project: React.FC<any> = () => {
  return (
    <>
      {ProjForm()}
    </>
  )
}
export default () => (
  <ApolloProvider client={client}>
    <Project />
  </ApolloProvider>
);