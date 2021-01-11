import React from 'react';
import { Input, Tree } from 'antd';
import { User } from '@/apollo';
import * as R from 'ramda';

interface EmployeeProps {
  users: User[];
  handleClick: (userId: string) => void;
}

const Employee: React.FC<EmployeeProps> = (props) => {

  const { users, handleClick } = props;
  const [search, setSearch] = React.useState<string>("");

  const treeData = users
    .filter(user => R.includes(search, user.name))
    .map(user => user.groups)
    .reduce((a: string[], b: string[]) => [...a, ...b], [])
    .reduce((a: string[], b: string) => a.includes(b) ? a : [...a, b], [])
    .map(group => ({
      key: group,
      title: group,
      children: users
        .filter(user => user.groups.includes(group))
        .map(user => ({
          key: user.id,
          title: user.name,
          isLeaf: true,
        })),
      selectable: false,
    }))

  return (
    <div style={{ height: 719, overflow: "scroll" }}>
      <Input.Search
        placeholder="检索人员"
        onChange={(e) => setSearch(e.target.value)}
      />
      <Tree defaultExpandAll
        treeData={treeData}
        onSelect={(selectedKeys, { selected }) => selected ? handleClick(selectedKeys[0] + '') : handleClick('')} />
    </div>
  )
}

export default Employee;
