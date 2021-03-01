import React from 'react';
import { Input, Tree } from 'antd';
import type { User } from '@/apollo';
import * as R from 'ramda';

type EmployeeProps = {
  users: User[];
  handleClick: (userId: string) => void;
};

const genTreeData = (users: User[]) => {
  const groups = R.pipe(
    R.map((user: User) => user.groups),
    R.reduce((acc: string[], item: string[]) => R.union(acc, item), []),
  )(users);
  return R.map((group: string) => ({
    key: group,
    title: group,
    children: users
      .filter((user) => user.groups.includes(group))
      .map((user) => ({
        key: user.id,
        title: user.name,
        isLeaf: true,
      })),
    selectable: false,
  }))(groups);
};

const Employee: React.FC<EmployeeProps> = (props) => {
  const { users, handleClick } = props;
  const [search, setSearch] = React.useState<string>('');

  return (
    <div style={{ height: 719, overflow: 'scroll' }}>
      <Input.Search placeholder="检索人员" onChange={(e) => setSearch(e.target.value)} />
      <Tree
        defaultExpandAll
        treeData={genTreeData(R.filter((user: User) => R.includes(search, user.name))(users))}
        onSelect={(selectedKeys, { selected }) =>
          selected ? handleClick(`${selectedKeys[0]}`) : handleClick('')
        }
      />
    </div>
  );
};

export default Employee;
