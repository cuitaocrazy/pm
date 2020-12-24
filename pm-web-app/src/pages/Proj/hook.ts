import type { Mutation, MutationPushProjectArgs, Project, Query } from '@/apollo';
import { gql, useLazyQuery, useMutation } from '@apollo/client';
import { useEffect, useState } from 'react';

const projsQuery = gql`
  {
    iLeaderProjs {
      id
      name
      budget
      createDate
      stage
      participants
      contacts {
        name
        duties
        phone
      }
    }
  }
`;

const pushProj = gql`
  mutation($proj: ProjectInput!) {
    pushProject(proj: $proj)
  }
`;

export function useProjStatus() {
  const [refresh, { loading, data }] = useLazyQuery<Query>(projsQuery, {
    fetchPolicy: 'no-cache',
  });
  const [currentProj, setCurrentProj] = useState<Project | undefined>(undefined);
  const [visible, setVisible] = useState<boolean>(false);
  const [pushProject] = useMutation<Mutation, MutationPushProjectArgs>(pushProj);

  const projs = data?.iLeaderProjs || [];

  useEffect(() => {
    refresh();
  }, []);

  const showModal = (proj?: Project) => {
    setCurrentProj(proj);
    setVisible(true);
  };

  const closeModal = () => {
    setVisible(false);
  };

  const submitProj = (proj: Promise<Project>) => {
    proj
      .then((p) => {
        const { leader, createDate, ...projArgs } = p;
        return pushProject({
          variables: {
            proj: projArgs,
          },
        });
      })
      .then(() => {
        setVisible(false);
        refresh();
      });
  };

  return {
    loading,
    refresh,
    projs,
    currentProj,
    visible,
    showModal,
    closeModal,
    submitProj,
  };
}
