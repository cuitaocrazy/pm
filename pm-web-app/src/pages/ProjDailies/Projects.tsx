import React from 'react';
import { Input, Tree } from 'antd';
import type { Project } from '@/apollo';
import * as R from 'ramda';

type ProjectsProps = {
  projs: Project[];
  handleClick: (projId: string) => void;
};

const genTreeData = R.map((proj: Project) => ({
  key: proj.id,
  title: proj.name,
  isLeaf: true,
}));

const Projects: React.FC<ProjectsProps> = (props) => {
  const { projs, handleClick } = props;
  const [search, setSearch] = React.useState<string>('');

  return (
    <div style={{ height: 719, overflow: 'scroll' }}>
      <Input.Search placeholder="检索项目" onChange={(e) => setSearch(e.target.value)} />
      <br />
      <br />
      <Tree
        defaultExpandAll
        treeData={genTreeData(R.filter((proj: Project) => R.includes(search, proj.name))(projs))}
        onSelect={(selectedKeys, { selected }) =>
          selected ? handleClick(`${selectedKeys[0]}`) : handleClick('')
        }
      />
    </div>
  );
};

export default Projects;
