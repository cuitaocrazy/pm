import React from 'react';
import { Input, Menu, Select, Row, Col } from 'antd';
import type { Project } from '@/apollo';
import * as R from 'ramda';
import { useBaseState } from '@/pages/utils/hook';
const { Option } = Select;

type ProjectsProps = {
  projs: Project[];
  handleClick: (projId: string,proPartAndTime:object) => void;
};

const Projects: React.FC<ProjectsProps> = (props) => {
  const { buildProjName, projType } = useBaseState()
  const { projs, handleClick } = props;
  const [search, setSearch] = React.useState<string>('');
  // const [proPartAndTime,setProPartAndTime] = React.useState({});
  let proPartAndTime = {}
  return (
    <div style={{ height: 719, overflow: 'scroll' }}>
      <Row>
        <Col span={8}>
          <Select
            style={{ width: '100%' }}
            placeholder="项目类型"
            allowClear
            onChange={(e, obj: any) => {
              setSearch(obj ? obj.children : '');
            }}
          >
            {Object.keys(projType).map((k) => (
              <Option key={k} value={k}>
                {projType[k]}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={16}>
          <Input.Search placeholder="检索项目" onChange={(e) => setSearch(e.target.value)} />
        </Col>
      </Row>
      <Menu onSelect={(e: any) =>{handleClick(e.key,proPartAndTime)}}
      >
        {R.filter((proj: Project) => R.includes(search, buildProjName(proj.id, proj.name)))(
          projs,
        ).map((proj) =>{
          proPartAndTime[proj.id] = {participants:proj.participants,timeConsuming:proj.timeConsuming}
         return <Menu.Item key={proj.id} data-k={'000'}  >{buildProjName(proj.id, proj.name)}</Menu.Item>
        })}
      </Menu>
    </div>
  );
};

export default Projects;
