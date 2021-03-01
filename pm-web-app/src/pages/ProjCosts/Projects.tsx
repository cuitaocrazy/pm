import React from 'react';
import { Input, Menu } from 'antd';
import type { Project } from '@/apollo';
import * as R from 'ramda';

type ProjectsProps = {
  projs: Project[];
  handleClick: (projId: string) => void;
};

const Projects: React.FC<ProjectsProps> = (props) => {
  const { projs, handleClick } = props;
  const [search, setSearch] = React.useState<string>('');

  return (
    <div>
      <Input.Search placeholder="检索项目" onChange={(e) => setSearch(e.target.value)} />
      <Menu onSelect={(e: any) => handleClick(e.key)}>
        {R.filter((proj: Project) => R.includes(search, proj.name))(projs).map((proj) => (
          <Menu.Item key={proj.id}>{proj.name}</Menu.Item>
        ))}
      </Menu>
    </div>
  );
};

export default Projects;
