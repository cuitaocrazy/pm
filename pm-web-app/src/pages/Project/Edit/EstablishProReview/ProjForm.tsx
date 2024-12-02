import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Divider,
  Row,
  Col,
  DatePicker,
  Upload,
  Cascader,
} from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type {
  ProjectInput,
  Customer,
  Query,
  TreeStatu,
  QueryGroupsUsersArgs,
  QueryProjDailyArgs,
  CustomersQuery,
  QueryCustomersArgs,
} from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import { useModel } from 'umi';
import { useBaseState } from '@/pages/utils/hook';
import type { FormInstance } from 'antd/lib/form';
import ProjIdComponent from './ProjIdComponent';
import { projStatus } from './utils';
import { forEach } from 'ramda';
import moment from 'moment';

const userQuery = gql`
  query ($groups: [String!]) {
    groupsUsers(groups: $groups) {
      id
      name
    }
    agreements {
      result {
        id
        name
      }
    }
    projectClasses {
      id
      name
    }
    groups
    realSubordinates {
      id
      name
    }
    projs {
      id
    }
  }
`;

const QueryDaily = gql`
  query GetDaily($projId: String!) {
    allProjDaily(projId: $projId) {
      project {
        id
      }
      dailies {
        date
        dailyItems {
          employee {
            id
            name
          }
          timeConsuming
          content
        }
      }
    }
  }
`;

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 16 },
};

export default (form: FormInstance<ProjectInput>, data?: ProjectInput) => {
  // const { data: resData1 } = useQuery<Query, QueryRoleUsersArgs>(userQuery1, { fetchPolicy: 'no-cache', variables: {
  // role: 'engineer',
  // } });
  data.contractState = data.contractState == 0 ? '未签署' : data.contractState == 1 ? '已签署' : '';
  //
  const { status, dataForTree, groupType, subordinates, subordinatesOnJob } = useBaseState(); // subordinates是指公司的全部人员
  // 使用正则表达式匹配出公司所有市场组的人员
  const filteredGroups: string[] = groupType
    .map((group) => {
      const match = group.toString().match(/\/市场组/);
      if (match) {
        return `${match.input}`;
      }
      return undefined; // 如果没有匹配，返回 undefined
    })
    .filter((value): value is string => value !== undefined);

  const { loading, data: resData } = useQuery<Query, QueryGroupsUsersArgs>(userQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      groups: filteredGroups,
      pageSizeAgreements: 10000000,
    },
  });
  const { data: queryData } = useQuery<Query, QueryProjDailyArgs>(QueryDaily, {
    fetchPolicy: 'no-cache',
    variables: {
      projId: data?.id || '',
    },
  });
  // const {salesLeader,setSalesLeader}=

  const { initialState } = useModel('@@initialState');
  const [isDerive, setIsDerive] = useState(false);
  const treeStatus = dataForTree(status);

  const reg = /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
  const result = reg.exec(data?.id || '');
  const [projType, setProjType] = useState(result?.groups?.projType || '');
  const [stageStatus, setStageStatus] = useState(data?.status || '');

  const myGroup = initialState?.currentUser?.groups;
  const shouldEnable = myGroup?.map((item) => {
    // 使用正则表达式检查是否包含一个或两个斜杠
    const match = item.match(/^\/[^/]+(\/[^/]+)?$/);
    return match !== null;
  });

  const isConfirmYearDisabled = shouldEnable?.some((enabled) => enabled === true);

  // 获取填写日报人员id，禁止修改
  let employeeIds: string[] = [];
  if (queryData && queryData.allProjDaily.dailies.length) {
    const employeesSet = new Set<string>([]);
    forEach(
      (item) => forEach((chItem) => employeesSet.add(chItem.employee.id), item.dailyItems),
      queryData.allProjDaily.dailies,
    );
    employeeIds = [...employeesSet];
  }

  const props: UploadProps = {
    listType: 'picture',
    action: '/api/upload/tmp',
    defaultFileList: [],
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: true,
    },
    onChange: ({ file, fileList }) => {
      if (file.status !== 'uploading') {
        fileList.forEach((item) => {
          const { url, response } = item;
          item.url = url ? url : response.data;
          item.thumbUrl = '';
          delete item.lastModified;
          delete item.percent;
          delete item.size;
          delete item.type;
          // delete item.originFileObj
          delete item.response;
          delete item.xhr;
          delete item.lastModifiedDate;
        });
      }
    },
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const validator = (rule: any, value: string) => {
    const result = reg.exec(value);
    setProjType(result?.groups?.projType || '');
    if (result === null) {
      return Promise.reject(Error('id格式不正确'));
    }

    if (!result.groups?.org) {
      return Promise.reject(Error('请选择机构'));
    }

    if (!result.groups?.zone) {
      return Promise.reject(Error('请选择区域'));
    }

    if (!result.groups?.projType) {
      return Promise.reject(Error('请选择项目类型'));
    }

    if (!result.groups?.simpleName) {
      return Promise.reject(Error('项目缩写不能为空'));
    }

    if (!/^\d{4}$/.exec(result.groups?.dateCode)) {
      return Promise.reject(Error('日期编码为4位数字'));
    }
    const pId = form.getFieldValue('pId');
    const id = form.getFieldValue('id');
    if (id === pId) {
      return Promise.reject(Error('派生项目ID不能与关联项目ID相同'));
    }
    return (!false || isDerive) && isExistProjIdData //当填完id时，需要从后台走接口看是不是id已存在
      ? Promise.reject(Error('id已存在'))
      : Promise.resolve();
  };
  // 公共的整数验证函数
  const validateInteger = (_: any, value: any) => {
    if (value === undefined || value === null || value === '') {
      return Promise.resolve();
    }
    if (!Number.isInteger(value)) {
      return Promise.reject(new Error('请输入整数'));
    }
    return Promise.resolve();
  };

  const activeValidator = async (_: any) => {
    const actives = form.getFieldValue(_.field);
    let type = projType === 'SQ' ? '销售' : projType === 'SH' ? '售后' : '项目';
    if ((projType === 'SQ' || projType === 'SH') && (!actives || !actives.length)) {
      return Promise.reject(Error(`至少需要添加一个${type}活动`));
    } else {
      return true;
    }
  };

  const getLeveTwoStatus = (type: string, label: string) => {
    const id = form.getFieldValue('id');
    const result = reg.exec(id);
    let options: TreeStatu[] = [];
    treeStatus.forEach((statu) => {
      if (statu.code === result?.groups?.projType && statu.children) {
        statu.children.map((s: TreeStatu) => {
          if (s.code === type) {
            options = s.children || [];
          }
        });
      }
    });
    return (
      <Form.Item label={label} name={type} rules={[{ required: true }]}>
        {options.length ? (
          <Select allowClear>
            {options
              .filter((s) => s.enable)
              .map((s: TreeStatu) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
          </Select>
        ) : (
          <Select loading={loading} />
        )}
      </Form.Item>
    );
  };

  // 当id有变动，重置状态字段
  const onIdChange = (value: string) => {
    // const result = reg.exec(value);
    if (value) {
      form.setFieldsValue({
        id: value,
        projStatus: '',
        contStatus: '',
        acceStatus: '',
        status: undefined,
        startTime: '',
        endTime: '',
        actives: [],
      });
    }
  };

  const onConfirmYearChange = (date: any, dateString: string) => {
    form.setFieldValue('confirmYear', dateString);
  };
  const ondoYearChange = (date: any, dateString: string) => {
    form.setFieldValue('doYear', dateString);
  };

  // 派生一个新项目
  const deriveNewProject = () => {
    setIsDerive(true);
    form.setFieldValue('pId', data?.id);
    form.setFieldValue('contName', '');
    // 生成派生项目id
    let newId = data?.id.replace(/-(\w+)$/, `-${moment().format('YYYY')}`) || '1';
    onIdChange(newId);
  };

  const customerQuery = gql`
    query GetCustomers($region: String!, $industry: String!, $page: Int!, $pageSize: Int!) {
      customers(region: $region, industry: $industry, page: $page, pageSize: $pageSize) {
        result {
          id
          name
          enable
        }
        page
        total
      }
    }
  `;
  const id = form.getFieldValue('id');
  const resultId = reg.exec(id);
  const region = resultId?.groups?.zone;
  const industry = resultId?.groups?.org;

  const queryCustomerVariables: QueryCustomersArgs = {
    region: region || '',
    industry: industry || '',
    page: 1,
    pageSize: 100000,
  };

  const renderActiveNode = (fields: any) => {
    let tempFields = [];
    for (let i = fields.length - 1; i >= 0; i--) {
      fields['index'] = i;
      tempFields.push(fields[i]);
    }
    return tempFields;
  };

  // // 在组件状态中保存上一次选择的市场经理ID
  // const [lastSelectedSalesLeader, setLastSelectedSalesLeader] = useState<string | undefined>(
  //   undefined,
  // );

  // // 在组件状态中保存所有选择过的市场经理ID
  // const [selectedSalesLeaders, setSelectedSalesLeaders] = useState<string[]>([]);

  // const handleSalesLeaderChange = (value: string) => {
  //   const oldSalesLeader = data?.salesLeader;
  //   // 获取当前的参与者们
  //   const currentParticipants = form.getFieldValue('participants') || [];

  //   // 定义一个更新参与者的数组
  //   let updatedParticipants: string[] = [];

  //   // 从当前参与者中移除所有选择过的市场经理
  //   updatedParticipants = currentParticipants.filter(
  //     (participant: string) => !selectedSalesLeaders.includes(participant),
  //   );
  //   updatedParticipants = currentParticipants.filter(
  //     (participant: string) => participant !== oldSalesLeader,
  //   );

  //   // 如果选择新的市场经理，那么添加到更新的参与人员数组中
  //   if (value && !selectedSalesLeaders.includes(value)) {
  //     updatedParticipants.push(value);
  //     // 记录这次选择的市场经理ID
  //     setSelectedSalesLeaders([...selectedSalesLeaders, value]);

  //     // 如果上一次选择的市场经理存在，且不等于当前选择的市场经理，从更新数组中去掉
  //     if (lastSelectedSalesLeader && lastSelectedSalesLeader !== value) {
  //       updatedParticipants = updatedParticipants.filter(
  //         (participant: string) => participant !== lastSelectedSalesLeader,
  //       );
  //     }

  //     // 记录当前选择的市场经理ID
  //     setLastSelectedSalesLeader(value);
  //   }

  //   // 设置更新参与人员到表单中
  //   form.setFieldsValue({
  //     participants: updatedParticipants,
  //   });
  // };

  // 初始化项目经理‘’
  const [leader, setLeader] = useState<string>('');
  // 初始化更新的参与人员[]
  const [updatedParticipants, setUpdatedParticipants] = useState<string[]>([]);

  // 组件渲染完成后，获取项目经理的值
  useEffect(() => {
    // 在 useEffect 中获取 form.getFieldValue('leader') 的值
    const leaderValue = form.getFieldValue('leader');
    console.log(subordinatesOnJob);
    // 更新组件的状态
    setLeader(leaderValue);
  }, []); // 空数组作为第二个参数表示仅在组件挂载时执行一次

  // 组件渲染完成后，获取参与人员的值
  useEffect(() => {
    const participantsValue: string[] = form.getFieldValue('participants');
    const initParticipants: string[] = Array.isArray(participantsValue) ? participantsValue : [];
    const isOnJob = (participant: string, subOnJob: any[]) => {
      //判断participants是否在subordinatesOnJob的id中
      let result = false;
      for (let user of subOnJob) {
        if (participant === user.id) {
          result = true;
        }
      }
      return result;
    };
    form.setFieldsValue({
      participants: initParticipants.filter((participant) =>
        isOnJob(participant, subordinatesOnJob),
      ),
    });
    // 更新参与人员的数组
    setUpdatedParticipants(
      initParticipants
        .filter((participant) => participant !== leader)
        .filter((participant) => isOnJob(participant, subordinatesOnJob)),
    );
  }, [leader, form]);

  // 选择项目经理
  const handleLeaderChange = (value: string) => {
    if (value !== undefined && value !== leader) {
      setLeader(value);
    }
    if (typeof value === 'string') {
      updatedParticipants.push(value);
    }
    // 设置更新参与人员到表单中
    form.setFieldsValue({
      participants: updatedParticipants,
    });
  };

  // 处理customerListData1.customers获取值
  const [customerListData, setCustomerListData] = useState({} as any);
  const { data: customerListData1 } = useQuery<CustomersQuery, QueryCustomersArgs>(customerQuery, {
    fetchPolicy: 'no-cache',
    variables: queryCustomerVariables,
  });
  useEffect(() => {
    setCustomerListData(customerListData1?.customers);
  }, [customerListData1]);

  const [isExistProjIdData, setIsExistProjIdData] = useState<Boolean>();

  // 回调函数，用于在子组件中 IsExistProjIdData 发生变化时更新父组件的状态
  const handleIsExistProjIdDataChange = (data: Boolean) => {
    if (data !== undefined) {
      setIsExistProjIdData(data);
    }
  };

  const groupDatas = (inputArray: any) => {
    let result: any = [];
    inputArray.forEach((item: any) => {
      const path = item.substring(1).split('/');
      let currentLevel = result;
      path.forEach((segment: any, index: number) => {
        const existingSegment = currentLevel.find((el: any) => el.value === segment);

        if (existingSegment) {
          currentLevel = existingSegment.children || [];
        } else {
          const newSegment = {
            value: segment,
            label: segment,
            children: index === path.length - 1 ? [] : [],
          };

          currentLevel.push(newSegment);
          currentLevel = newSegment.children || [];
        }
      });
    });
    return result;
  };
  // 项目部门下拉菜单的数据源
  const [groupsOptions] = useState(groupDatas(groupType));

  return (
    <Form {...layout} form={form} initialValues={data} disabled>
      <Form.Item shouldUpdate noStyle>
        {() => {
          return (
            <Row>
              <Col xs={24} sm={20}>
                <Form.Item
                  labelCol={{ span: 3, offset: 0 }}
                  hidden={!(isDerive || data?.pId)}
                  label="关联项目ID"
                  name="pId"
                >
                  <Input disabled />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 3, offset: 0 }}
                  label="ID"
                  name="id"
                  rules={[{ required: true }, { validator }]}
                >
                  <ProjIdComponent
                    disabled={!!data?.id && !isDerive}
                    onChange={onIdChange} // 处理整个 ID 变化的回调  这个数据里的ID字段存在，且不是派生，isDerive是否派生了，true为点击派生按钮了
                    onIsExistProjIdDataChange={handleIsExistProjIdDataChange} // 将回调函数传递给子组件
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={4}>
                <Button
                  key="create"
                  hidden={!data?.id || isDerive}
                  type="primary"
                  onClick={deriveNewProject}
                  disabled
                >
                  派生一个新项目
                </Button>
              </Col>
            </Row>
          );
        }}
      </Form.Item>
      <Row>
        <Col span={8}>
          <Form.Item label="项目名称" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="客户名称" name="customer" rules={[{ required: true }]}>
            {customerListData?.result && (
              <Select allowClear>
                {customerListData.result.map((u: Customer) => (
                  <Select.Option key={u.id} value={u.id}>
                    {u.name}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="合同名称" name="contName" rules={[{ required: false }]}>
            <Input disabled />
            {/* <Select disabled allowClear>
              {resData?.agreements.result.map((u) => (
                <Select.Option key={u.id} value={u.id}>
                  {u.name}
                </Select.Option>
              ))}
            </Select> */}
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <Form.Item label="项目分类" name="projectClass" rules={[{ required: true }]}>
            <Select allowClear>
              {resData?.projectClasses.map((u) => (
                <Select.Option key={u.id} value={u.id}>
                  {u.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="项目部门" name="group" rules={[{ required: true }]}>
            <Cascader
              // value={}
              allowClear
              changeOnSelect
              className="width122"
              placeholder="请选择"
              options={groupsOptions}
            />
          </Form.Item>
          {/* <Form.Item label="项目部门" name="group" rules={[{ required: true }]}>
            <Select allowClear>
              {resData?.groups.map((u, index) => {
                return (
                  <Select.Option key={index} value={u}>
                    {u.toString().split('/')[2]}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item> */}
        </Col>
        <Col span={8}></Col>
      </Row>
      <Row>
        <Col span={8}>
          <Form.Item label="项目经理" name="leader" rules={[{ required: true }]}>
            <Select
              disabled={!!data?.id && !isDerive}
              allowClear
              showSearch
              filterOption={(input, option) => {
                const nameStr: any = option?.children || '';
                if (input && nameStr) {
                  return nameStr.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }
                return true;
              }}
              onChange={(value) => handleLeaderChange(value)}
            >
              {resData?.realSubordinates.map((u) => (
                <Select.Option key={u.id} value={u.id}>
                  {u.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          {/* <Form.Item label="市场经理" name="salesLeader" rules={[{ required: true }]}>
<Select allowClear showSearch
filterOption={(input, option) => {
const nameStr: any = option?.children || '';
if (input && nameStr) {
return nameStr.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}
return true;
}}>
{resData?.groupsUsers.map((u) => (
<Select.Option key={u.id} value={u.id}>
{u.name}
</Select.Option>
))}
</Select>
</Form.Item> */}
          <Form.Item label="市场经理" name="salesLeader" rules={[{ required: true }]}>
            <Select
              allowClear
              showSearch
              filterOption={(input, option) => {
                const nameStr: any = option?.children || '';
                if (input && nameStr) {
                  return nameStr.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }
                return true;
              }}
            >
              {resData?.groupsUsers.map((u) => (
                <Select.Option key={u.id} value={u.id}>
                  {u.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="参与人员" name="participants">
            <Select
              mode="multiple"
              filterOption={(input, option) => {
                const nameStr: any = option?.children || '';
                if (input && nameStr) {
                  return nameStr.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }
                return true;
              }}
            >
              {subordinatesOnJob.map((u) => (
                <Select.Option key={u.id} value={u.id} disabled={employeeIds.includes(u.id)}>
                  {u.name}
                </Select.Option>
              ))}
              x
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <Form.Item dependencies={['id']} noStyle>
            {() => {
              return getLeveTwoStatus('projStatus', '项目状态');
            }}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item dependencies={['id']} noStyle>
            {() => {
              return getLeveTwoStatus('acceStatus', '验收状态');
            }}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="合同状态" name="contractState">
            {/* {() => {
              return getLeveTwoStatus('contStatus', '合同状态');
            }} */}
            <Input disabled />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <Form.Item label="阶段状态" name="status" rules={[{ required: false }]}>
            <Select loading={loading} onChange={(v) => setStageStatus(v)}>
              {projStatus.map((s) => (
                <Select.Option key={s[0]} value={s[0]}>
                  {s[1]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="启动日期"
            name="startTime"
            rules={[{ required: stageStatus ? true : false }]}
            getValueProps={(value) => ({
              value: value ? moment(value) : undefined,
            })}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="结束日期"
            name="endTime"
            rules={[{ required: stageStatus === 'endProj' ? true : false }]}
            getValueProps={(value) => ({
              value: value ? moment(value) : undefined,
            })}
          >
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <Form.Item label="合同金额" name="contAmount" rules={[{ required: false }]}>
            <InputNumber min={0} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="确认金额" name="recoAmount" rules={[{ required: false }]}>
            <InputNumber min={0} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="税后金额" name="taxAmount" rules={[{ required: false }]}>
            <InputNumber min={0} />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <Form.Item
            label="项目预算"
            name="projBudget"
            rules={[{ required: false }]}
            tooltip={<span className="ant-form-text">客户心理的预算</span>}
          >
            <InputNumber min={0} />
          </Form.Item>
        </Col>

        <Col span={8}>
          <Form.Item
            label="费用预算"
            name="budgetFee"
            rules={[{ required: false }]}
            tooltip={<span className="ant-form-text">自己人员消耗的费用</span>}
          >
            <InputNumber min={0} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="成本预算"
            name="budgetCost"
            rules={[{ required: false }]}
            tooltip={<span className="ant-form-text">采购或者外包的费用</span>}
          >
            <InputNumber min={0} />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={8}>
          <Form.Item
            label="人力费用"
            name="humanFee"
            rules={[{ required: false }]}
            tooltip={<span className="ant-form-text">实际消耗费用</span>}
          >
            <InputNumber min={0} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="项目费用"
            name="projectFee"
            rules={[{ required: false }]}
            tooltip={<span className="ant-form-text">实际消耗费用</span>}
          >
            <InputNumber min={0} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="采购成本"
            name="actualCost"
            rules={[{ required: false }]}
            tooltip={<span className="ant-form-text">实际采购成本</span>}
          >
            <InputNumber min={0} />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="预估工作量"
            name="estimatedWorkload"
            rules={[{ required: false }, { validator: validateInteger }]}
          >
            <InputNumber min={0} />
          </Form.Item>
        </Col>
        {projType === 'SH' ? (
          <>
            <Col span={8}>
              <Form.Item
                label="免费人天数"
                name="freePersonDays"
                rules={[{ required: false }, { validator: validateInteger }]}
              >
                <InputNumber min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="已用人天数"
                name="usedPersonDays"
                rules={[{ required: false }, { validator: validateInteger }]}
              >
                <InputNumber min={0} />
              </Form.Item>
            </Col>
            <Col span={8}></Col>
          </>
        ) : (
          ''
        )}
      </Row>
      {projType === 'SQ' || projType === 'SH' ? (
        ''
      ) : (
        <Row>
          <Col span={8}>
            <Form.Item
              label="投产日期"
              name="productDate"
              rules={[{ required: false }]}
              getValueProps={(value) => ({
                value: value ? moment(value) : undefined,
              })}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="验收日期"
              name="acceptDate"
              rules={[{ required: false }]}
              getValueProps={(value) => ({
                value: value ? moment(value) : undefined,
              })}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="免费维护期"
              name="serviceCycle"
              rules={[{ required: false }]}
              tooltip={<span className="ant-form-text">月</span>}
            >
              <InputNumber min={0} />
            </Form.Item>
          </Col>
        </Row>
      )}
      {projType === 'SH' ? (
        <Row hidden={projType !== 'SH'}>
          <Col span={8}>
            <Form.Item
              label="要求巡检次数"
              name="requiredInspections"
              rules={[{ required: false }, { validator: validateInteger }]}
            >
              <InputNumber min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="实际巡检次数"
              name="actualInspections"
              rules={[{ required: false }, { validator: validateInteger }]}
            >
              <InputNumber min={0} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="服务周期"
              name="serviceCycle"
              rules={[{ required: false }, { validator: validateInteger }]}
              tooltip={<span className="ant-form-text">月</span>}
            >
              <InputNumber min={0} />
            </Form.Item>
          </Col>
        </Row>
      ) : (
        ''
      )}

      <Row>
        <Col span={8}>
          <Form.Item
            label="确认年度"
            name="confirmYear"
            rules={[{ required: false }]}
            getValueProps={(value) => ({
              value: value ? moment(value) : undefined,
            })}
          >
            <DatePicker
              picker="year"
              format="YYYY"
              style={{ width: '100%' }}
              onChange={onConfirmYearChange}
              disabled={!isConfirmYearDisabled}
            />
            {/* <Input /> */}
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="实施年度"
            name="doYear"
            rules={[{ required: false }]}
            getValueProps={(value) => ({
              value: value ? moment(value) : undefined,
            })}
          >
            <DatePicker
              picker="year"
              format="YYYY"
              style={{ width: '100%' }}
              onChange={ondoYearChange}
            />
            {/* <Input /> */}
          </Form.Item>
        </Col>
        <Col span={8}></Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.Item label="项目描述" name="description" labelCol={{ span: 3, offset: 0 }}>
            <Input.TextArea />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.List name="actives" rules={[{ validator: activeValidator }]}>
            {(fields, { add, remove }, { errors }) => (
              <>
                <Form.Item>
                  {data?.status === 'endProj' ? (
                    ''
                  ) : (
                    <Button
                      type="dashed"
                      onClick={() =>
                        add({ recorder: initialState?.currentUser?.id }, fields.length)
                      }
                      icon={<PlusOutlined />}
                    >
                      添加{projType === 'SQ' ? '销售' : projType === 'SH' ? '售后' : '项目'}活动
                    </Button>
                  )}
                  <Form.ErrorList errors={errors} />
                </Form.Item>
                {renderActiveNode(fields).map((field, i) => (
                  <div key={field.key} style={{ textAlign: 'left' }}>
                    <Divider>
                      <Form.Item
                        labelCol={{ span: 1, offset: 0 }}
                        key="name"
                        label=" "
                        colon={false}
                        name={[field.name, 'name']}
                        rules={[{ required: true, message: '请输入活动名称' }]}
                      >
                        <Input
                          placeholder="请输入活动名称"
                          style={{ width: '15vw', textAlign: 'center' }}
                        />
                      </Form.Item>
                    </Divider>
                    <Row>
                      <Col span={12}>
                        <Form.Item
                          labelCol={{ span: 6, offset: 0 }}
                          key="date"
                          label="活动日期"
                          name={[field.name, 'date']}
                          rules={[{ required: true }]}
                          getValueProps={(value) => ({
                            value: value ? moment(value) : undefined,
                          })}
                        >
                          <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          labelCol={{ span: 5, offset: 0 }}
                          key="recorder"
                          label="记录人"
                          name={[field.name, 'recorder']}
                          rules={[{ required: true }]}
                        >
                          <Select disabled>
                            {resData?.realSubordinates.map((u) => (
                              <Select.Option key={u.id} value={u.id}>
                                {u.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Form.Item
                          labelCol={{ span: 3, offset: 0 }}
                          key="content"
                          label="活动内容"
                          name={[field.name, 'content']}
                          rules={[{ required: true }]}
                        >
                          <Input.TextArea rows={4} placeholder="需包含：地点--人物---事件" />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={24}>
                        <Form.Item
                          labelCol={{ span: 3, offset: 0 }}
                          key="fileList"
                          label="活动材料"
                          name={[field.name, 'fileList']}
                          rules={[{ required: false }]}
                          getValueFromEvent={normFile}
                          style={{ textAlign: 'left' }}
                        >
                          <Upload
                            className="upload-list-inline"
                            {...props}
                            defaultFileList={
                              form.getFieldValue('actives')
                                ? (form.getFieldValue('actives')[field.name]
                                    ?.fileList as UploadFile[])
                                : []
                            }
                          >
                            <Button icon={<UploadOutlined />}>上传</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>
                    <div style={{ textAlign: 'center' }}>
                      {data?.status === 'endProj' ? (
                        ''
                      ) : (
                        <MinusCircleOutlined
                          className="dynamic-delete-button"
                          onClick={() => remove(field.name)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </Form.List>
        </Col>
      </Row>
      <Row hidden>
        <Col span={24}>
          <Form.List name="contacts">
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, i) => (
                  <div key={field.key} style={{ textAlign: 'center' }}>
                    <Divider>联系人 {i + 1}</Divider>
                    <Form.Item
                      labelCol={{ span: 3, offset: 0 }}
                      key="name"
                      label="联系人"
                      name={[field.name, 'name']}
                      rules={[{ required: true }]}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 3, offset: 0 }}
                      key="duties"
                      label="职务"
                      name={[field.name, 'duties']}
                    >
                      <Input />
                    </Form.Item>
                    <Form.Item
                      labelCol={{ span: 3, offset: 0 }}
                      key="phone"
                      label="电话"
                      name={[field.name, 'phone']}
                    >
                      <Input />
                    </Form.Item>
                    <MinusCircleOutlined
                      className="dynamic-delete-button"
                      onClick={() => remove(i)}
                    />
                  </div>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                    添加售前活动
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Col>
      </Row>
    </Form>
  );
};
