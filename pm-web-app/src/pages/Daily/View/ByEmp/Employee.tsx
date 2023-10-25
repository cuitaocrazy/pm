import React from 'react';
import { Input, Tree } from 'antd';
import type { User } from '@/apollo';
import * as R from 'ramda';
import moment from 'moment';

type EmployeeProps = {
  users: User[];
  userDailiys: any;
  handleClick: (userId: string) => void;
};

const genTreeData = (users: User[], userDailiys: any) => {
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
        key: user.id + '/' + group,
        title: user.name + dayNumbrt(user, userDailiys),
        isLeaf: true,
      })),
    selectable: false,
  }))(groups);
};
const dayNumbrt = (user: User, userDailiys: any) => {
  if (userDailiys[user.id] && userDailiys[user.id].dailies.length) {
    const dateObj = userDailiys[user.id].dailies[userDailiys[user.id].dailies.length-1]
    const startDate =  moment(dateObj.date).format('YYYYMMDD');
    const endDate = moment().format('YYYYMMDD');
    return`(${moment(endDate).diff(startDate, 'day')}天前)`
  } else {
    return '(无)'
  }
};

const Employee: React.FC<EmployeeProps> = (props) => {
  const { users, userDailiys, handleClick } = props;
  const [search, setSearch] = React.useState<string>('');

  return (
    <div style={{ height: 719, overflow: 'scroll' }}>
      <Input.Search placeholder="检索人员" onChange={(e) => setSearch(e.target.value)} />
      <Tree
        defaultExpandAll
        treeData={genTreeData(R.filter((user: User) => R.includes(search, user.name))(users), userDailiys)}
        onSelect={(selectedKeys, { selected, selectedNodes, node }) => {
          selected ? handleClick(`${selectedKeys[0].toString().split('/')[0]}`) : handleClick('')
        }
        }
      />
    </div>
  );
};

export default Employee;
