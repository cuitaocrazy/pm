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
  message,
  Cascader,
} from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type {
  ProjectInput,
  Query,
  TreeStatu,
  QueryGroupsUsersArgs,
  CustomersQuery,
  QueryCustomersArgs,
} from '@/apollo';
import { gql, useQuery, useLazyQuery } from '@apollo/client';
import { useModel } from 'umi';
import { useBaseState } from '@/pages/utils/hook';
import ProjIdComponent from './ProjIdComponent';
import { projStatus } from './utils';
import moment from 'moment';
import { useForm } from 'antd/es/form/Form';
import { useProjStatus } from './hook';

const userQuery = gql`
  query ($groups: [String!]) {
    groupsUsers(groups: $groups) {
      id
      name
      enabled
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
      enabled
    }
    projs {
      id
    }
    yearManages {
      code
      name
      enable
    }
    quarterManages {
      code
      name
      enable
    }
  }
`;

const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

export default () => {
  const [form] = useForm<ProjectInput>();
  const { pushProj } = useProjStatus();
  const [messageApi, contextHolder] = message.useMessage();
  const { status, dataForTree, groupType, subordinatesOnJob } = useBaseState(); // subordinates是指公司的全部人员
  // 使用正则表达式匹配出公司所有市场组的人员
  const salesGroups: string[] = groupType
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
      groups: ['/软件事业部/市场组'],//salesGroups
    },
  });
  // const realSubordinates = resData?.realSubordinates.filter(item => item.enabled);
  // const groupsUsers = resData?.groupsUsers.filter(item => item.enabled);
  const { initialState } = useModel('@@initialState');
  const [isDerive] = useState(false);
  const treeStatus = dataForTree(status);
  const reg = /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
  const result = reg.exec('');
  const [projType, setProjType] = useState(result?.groups?.projType || '');
  const [stageStatus, setStageStatus] = useState('');
  const myGroup = initialState?.currentUser?.groups;
  const shouldEnable = myGroup?.map((item) => {
    // 使用正则表达式检查是否包含一个或两个斜杠
    const match = item.match(/^\/[^/]+(\/[^/]+)?$/);
    return match !== null;
  }); //匹配/abc/def和/abc，不匹配/abc/def/ghi和abc

  const isConfirmYearDisabled = shouldEnable?.some((enabled) => enabled === true); //存在true，返回true，不存在true，返回false

  //上传材料
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
  //上传文件
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

  const id = form.getFieldValue('id');
  const resultId = reg.exec(id);
  const region = resultId?.groups?.zone;
  const industry = resultId?.groups?.org;

  const renderActiveNode = (fields: any) => {
    let tempFields = [];
    for (let i = fields.length - 1; i >= 0; i--) {
      fields['index'] = i;
      tempFields.push(fields[i]);
    }
    return tempFields;
  };

  const queryCustomerVariables: QueryCustomersArgs = {
    region: region || '',
    industry: industry || '',
    page: 1,
    pageSize: 100000,
  };

  const customerQuery = gql`
    query GetCustomers($region: String!, $industry: String!, $page: Int!, $pageSize: Int!) {
      customers(region: $region, industry: $industry, page: $page, pageSize: $pageSize) {
        result {
          id
          name
          enable
          contacts {
            name
            phone
            tags
            recorder
            remark
          }
          officeAddress
          salesman
        }
        page
        total
      }
      subordinates {
        id
        name
        enabled
      }
    }
  `;

  const [fetchCustomersData, { data: customerListData }] = useLazyQuery<
    CustomersQuery,
    QueryCustomersArgs
  >(customerQuery, {
    fetchPolicy: 'no-cache',
    variables: queryCustomerVariables,
  });

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

  const handleSubmit = () => {
    // 获取处理后的group字段值
    const processedGroup =
      form.getFieldValue('group') &&
      (typeof form.getFieldValue('group') === 'string'
        ? form.getFieldValue('group')
        : form.getFieldValue('group').length > 0
        ? form.getFieldValue('group').reduce((accumulator: string, currentValue: string) => {
            return `${accumulator}/${currentValue}`;
          }, '')
        : '');
    // 使用async/await语法确保异步操作的正确执行
    (async () => {
      try {
        // 直接修改form中group字段的值
        form.setFieldsValue({ group: processedGroup });
        // 验证字段
        await form.validateFields();
        // 调用pushProj函数，传递处理后的group字段值
        await pushProj(form.getFieldsValue());
        // 弹出成功消息
        await messageApi.open({
          type: 'success',
          content: '新增成功！',
          duration: 2,
        });
        // 重置字段
        form.resetFields();
      } catch (error) {
        // 处理错误
        console.error(error);
      }
    })();
  };
  const [isExistProjIdData, setIsExistProjIdData] = useState<Boolean>();

  // 回调函数，用于在子组件中 IsExistProjIdData 发生变化时更新父组件的状态
  const handleIsExistProjIdDataChange = (data: Boolean) => {
    if (data !== undefined) {
      setIsExistProjIdData(data);
    }
  };

  // // 在组件状态中保存上一次选择的市场经理ID
  // const [lastSelectedSalesLeader, setLastSelectedSalesLeader] = useState<string | undefined>(
  //   undefined,
  // );

  // // 在组件状态中保存所有选择过的市场经理ID
  // const [selectedSalesLeaders, setSelectedSalesLeaders] = useState<string[]>([]);

  // const handleSalesLeaderChange = (value: string) => {
  //   // const oldSalesLeader = data?.salesLeader;
  //   const oldSalesLeader = form.getFieldValue('salesLeader')
  //   // 获取当前的参与者们
  //   const participantsValue = form.getFieldValue('participants');
  //   const currentParticipants: string[] = typeof participantsValue === 'string' ? [participantsValue] : [];

  //   // const currentParticipants: string[] = form.getFieldValue('participants') || [];

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

    // 更新组件的状态
    setLeader(leaderValue);
  }, [leader, form]); // 数组中的leader作为第二个参数表示不仅在组件挂载时执行、leader的值发生变化也会执行

  // 组件渲染完成后，获取参与人员的值
  useEffect(() => {
    const participantsValue: string[] = form.getFieldValue('participants');
    const initParticipants: string[] = Array.isArray(participantsValue) ? participantsValue : [];

    // 更新参与人员的数组
    setUpdatedParticipants(initParticipants.filter((participant) => participant !== leader));
  }, [leader, form]);

  // 选择项目经理
  const handleLeaderChange = (value: string) => {
    if (value !== undefined && value !== leader) {
      setLeader(value);
    }

    if (typeof value === 'string') {
      updatedParticipants.filter((participant) => participant.includes(value));
      updatedParticipants.push(value);
    }
    // 设置更新参与人员到表单中
    form.setFieldsValue({
      participants: updatedParticipants,
    });
  };

  // 选择参与人员
  const handleParticipantsChange = (value: string[]) => {
    setUpdatedParticipants(value);
  };
  const [officeAddress, setOfficeAddress] = useState();
  const [salesman, setSalesman] = useState();
  const [contacts, setContacts] = useState();

  //客户名称change
  const handleChange = (value, option) => {
    
    setOfficeAddress(option['data-officeAddress']);
    setSalesman(option['data-salesman']);
    setContacts(option['data-contacts']);
  };
  useEffect(() => {
    
    form.setFieldsValue({ address: officeAddress });
  }, [officeAddress]); // value 改变时运行
  //客户联系人change
  const customerContacthandleChange = (value, option) => {
    
    form.setFieldsValue({ contactDetailsCus: option.phone });
  };
  const [formattedOptions, setFormattedOptions] = useState([]);
  useEffect(() => {
    
    //   //销售负责人的options
    if (salesman) {
      let temp = salesman.map((item) => ({
        value: item,
        label: customerListData?.subordinates.find((user) => user.id === item)?.name, // 这里你可以自定义 label
      }));
      setFormattedOptions(temp);
    }
  }, [salesman]); // value 改变时运行
  const [confirmYearOptions, setConfirmYearOptions] = useState(resData?.yearManages);
  const [confirmYear, setConfirmYear] = useState(resData?.confirmYear || '');
  const [confirmQuarter, setConfirmQuarter] = useState(resData?.confirmQuarter || '');
  const [confirmQuarterOptions, setConfirmQuarterOptions] = useState(resData?.quarterManages);
  useEffect(() => {
    if (resData?.yearManages) {
      let yearManages = resData?.yearManages.filter((item) => item.enable == true);
      setConfirmYearOptions(yearManages);
    }
  }, [resData?.yearManages]);
  useEffect(() => {
    if (resData?.quarterManages) {
      let quarterManages = resData?.quarterManages.filter((item) => item.enable == true);
      setConfirmQuarterOptions(quarterManages);
    }
  }, [resData?.quarterManages]);
  return (
    <Form
      style={{ background: '#fff' }}
      {...layout}
      form={form}
      initialValues={{
        leader: initialState?.currentUser?.id,
        participants: initialState?.currentUser?.id,
      }}
    >
      <Form.Item shouldUpdate noStyle>
        {() => {
          return (
            <Row>
              <Col span={14}>
                <Form.Item
                  style={{ marginTop: '40px' }}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  label="项目ID"
                  name="id"
                  rules={[{ required: true }, { validator }]}
                >
                  <ProjIdComponent
                    onChange={onIdChange} // 处理整个 ID 变化的回调
                    onIsExistProjIdDataChange={handleIsExistProjIdDataChange} // 将回调函数传递给子组件
                  />
                </Form.Item>
              </Col>
            </Row>
          );
        }}
      </Form.Item>
      <Row>
        <Col span={7}>
          <Form.Item label="项目名称" name="name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="客户名称" name="customer" rules={[{ required: true }]}>
            <Select onChange={handleChange} allowClear onFocus={() => fetchCustomersData()}>
              {customerListData?.customers.result.filter(item=>item.enable).map((u) => (
                <Select.Option
                  key={u.id}
                  value={u.id}
                  data-salesman={u.salesman}
                  data-officeAddress={u.officeAddress}
                  data-contacts={u.contacts}
                >
                  {u.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="合同名称" name="contName" rules={[{ required: false }]}>
            <Select disabled allowClear>
              {resData?.agreements.result.map((u) => (
                <Select.Option key={u.id} value={u.id}>
                  {u.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={7}>
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
        <Col span={7}>
          <Form.Item label="项目部门" name="group" rules={[{ required: true }]}>
            <Cascader
              defaultValue={[]} // 或者使用 value={[]}
              allowClear
              changeOnSelect
              className="width122"
              placeholder="请选择"
              options={groupsOptions}
            />
          </Form.Item>
        </Col>
        <Col span={7}></Col>
      </Row>
      <Row>
        <Col span={7}>
          <Form.Item label="项目经理" name="leader" rules={[{ required: true }]}>
            {/* disabled={!!data?.id && !isDerive} */}
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
              onChange={(value) => handleLeaderChange(value)}
            >
              {/* 获取本用户及其所属下级 */}
              {resData?.realSubordinates
  .filter((u) => u.enabled).map((u) => (
                //本级和下级
                <Select.Option key={u.id} value={u.id}>
                  {u.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={7}>
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
              // onChange={(value) => handleSalesLeaderChange(value)}
            >
              {resData?.groupsUsers.map((u) => (
                //本级及下级
                u.enabled && <Select.Option key={u.id} value={u.id}>
                  {u.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="参与人员" name="participants" rules={[{ required: true }]}>
            <Select
              mode="multiple"
              filterOption={(input, option) => {
                const nameStr: any = option?.children || '';
                if (input && nameStr) {
                  return nameStr.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                }
                return true;
              }}
              onChange={(value) => {
                // 处理字符串或字符串数组
                const participantsArray = Array.isArray(value) ? value : [value];
                handleParticipantsChange(participantsArray);
              }}
            >
              {subordinatesOnJob.map((u) => (
                //本级及下级
                <Select.Option key={u.id} value={u.id}>
                  {u.name}
                </Select.Option>   
              ))}
              x
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={7}>
          <Form.Item dependencies={['id']} noStyle>
            {() => {
              return getLeveTwoStatus('projStatus', '项目状态');
            }}
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item dependencies={['id']} noStyle>
            {() => {
              return getLeveTwoStatus('acceStatus', '验收状态');
            }}
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="合同状态">
            <Input defaultValue="未签署" disabled />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={7}>
          <Form.Item label="阶段状态" name="status" rules={[{ required: false }]}>
            <Select disabled={false} loading={loading} onChange={(v) => setStageStatus(v)}>
              {projStatus.map((s) => (
                <Select.Option key={s[0]} value={s[0]}>
                  {s[1]}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item
            label="启动日期"
            name="startTime"
            rules={[{ required: stageStatus ? true : false }]}
            getValueProps={(value) => ({
              value: value ? moment(value) : undefined,
            })}
          >
            <DatePicker disabled={false} format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item
            label="结束日期"
            name="endTime"
            rules={[{ required: stageStatus === 'endProj' ? true : false }]}
            getValueProps={(value) => ({
              value: value ? moment(value) : undefined,
            })}
          >
            <DatePicker disabled={false} format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={7}>
          <Form.Item label="合同金额" name="contAmount" rules={[{ required: false }]}>
            <InputNumber min={0} disabled style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="税后金额" name="taxAmount" rules={[{ required: false }]}>
            <InputNumber min={0} disabled style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={7}>
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
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={7}>
          <Form.Item
            label="确认年度"
            name="confirmYear"
            rules={[{ required: false }]}
          >
            <Select
              disabled={!isConfirmYearDisabled}
              allowClear
              className="width120"
              placeholder="请选择"
              onChange={(value, event) => setConfirmYear(value)}
              fieldNames={{ value: 'code', label: 'name' }}
              options={confirmYearOptions}
            />
            {/* <DatePicker
              picker="year"
              format="YYYY"
              style={{ width: '100%' }}
              onChange={onConfirmYearChange}
              disabled={!isConfirmYearDisabled}
            /> */}
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item
            label="确认季度"
            name="confirmQuarter"
            rules={[{ required: false }]}
          >
            <Select
              disabled={!isConfirmYearDisabled}
              allowClear
              className="width120"
              placeholder="请选择"
              onChange={(value, event) => setConfirmQuarter(value)}
              fieldNames={{ value: 'code', label: 'name' }}
              options={confirmQuarterOptions}
            />
            {/* <DatePicker
              picker="month"
              format="MM"
              style={{ width: '100%' }}
              onChange={onConfirmYearChange}
              disabled={!isConfirmYearDisabled}
            /> */}
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="确认金额" name="recoAmount" rules={[{ required: false }]}>
            <InputNumber min={0} disabled={!isConfirmYearDisabled} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={7}>
          <Form.Item
            label="项目预算"
            name="projBudget"
            rules={[{ required: true }]}
            tooltip={<span className="ant-form-text">客户心理的预算</span>}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        <Col span={7}>
          <Form.Item
            label="费用预算"
            name="budgetFee"
            rules={[{ required: false }]}
            tooltip={<span className="ant-form-text">自己人员消耗的费用</span>}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item
            label="成本预算"
            name="budgetCost"
            rules={[{ required: false }]}
            tooltip={<span className="ant-form-text">采购或者外包的费用</span>}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={7}>
          <Form.Item
            label="人力费用"
            name="humanFee"
            rules={[{ required: false }]}
            tooltip={<span className="ant-form-text">实际消耗费用</span>}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item
            label="项目费用"
            name="projectFee"
            rules={[{ required: false }]}
            tooltip={<span className="ant-form-text">实际消耗费用</span>}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item
            label="采购成本"
            name="actualCost"
            rules={[{ required: false }]}
            tooltip={<span className="ant-form-text">实际采购成本</span>}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item
            label="预估工作量"
            name="estimatedWorkload"
            rules={[{ required: true }, { validator: validateInteger }]}
          >
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Col>

        {projType === 'SH' ? (
          <>
            <Col span={7}>
              <Form.Item
                label="免费人天数"
                name="freePersonDays"
                rules={[{ required: false }, { validator: validateInteger }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item
                label="已用人天数"
                name="usedPersonDays"
                rules={[{ required: false }, { validator: validateInteger }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={7}></Col>
          </>
        ) : (
          ''
        )}
      </Row>
      {projType === 'SQ' || projType === 'SH' ? (
        ''
      ) : (
        <Row>
          <Col span={7}>
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
          <Col span={7}>
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
          <Col span={7}>
            <Form.Item
              label="免费维护期"
              name="serviceCycle"
              rules={[{ required: false }]}
              tooltip={<span className="ant-form-text">月</span>}
            >
              <InputNumber min={0} disabled style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      )}
      {projType === 'SH' ? (
        <Row hidden={projType !== 'SH'}>
          <Col span={7}>
            <Form.Item
              label="要求巡检次数"
              name="requiredInspections"
              rules={[{ required: false }, { validator: validateInteger }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item
              label="实际巡检次数"
              name="actualInspections"
              rules={[{ required: false }, { validator: validateInteger }]}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={7}>
            <Form.Item
              label="服务周期"
              name="serviceCycle"
              rules={[{ required: false }, { validator: validateInteger }]}
              tooltip={<span className="ant-form-text">月</span>}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
      ) : (
        ''
      )}

      <Row>
        <Col span={7}>
          <Form.Item label="产品名称" name="productName" rules={[{ required: false }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="著作权名称" name="copyrightName" rules={[{ required: false }]}>
            <Input />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="地址" name="address" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={7}>
          <Form.Item label="客户联系人" name="customerContact" rules={[{ required: true }]}>
            <Select
              onChange={customerContacthandleChange}
              options={contacts}
              fieldNames={{ value: 'name', label: 'name' }}
            />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="销售负责人" name="salesManager" rules={[{ required: true }]}>
            <Select options={formattedOptions} />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="商户联系人" name="merchantContact" rules={[{ required: false }]}>
            <Input />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={7}>
          <Form.Item label="客户联系方式" name="contactDetailsCus" rules={[{ required: true }]}>
            <Input disabled />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="销售联系方式" name="copyrightNameSale" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
        </Col>

        <Col span={7}>
          <Form.Item
            label="商户联系方式"
            name="contactDetailsMerchant"
            rules={[{ required: false }]}
          >
            <Input />
          </Form.Item>
        </Col>
        {/* <Col span={7}></Col> */}
        <Col span={14}>
          <Form.Item
            label="项目描述"
            name="description"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            rules={[{ required: true }]}
          >
            {/** */}
            <Input.TextArea style={{ width: '100%' }} />
          </Form.Item>
        </Col>
        <Col span={14}>
          <Form.Item
            label="项目计划"
            name="projectArrangement"
            rules={[{ required: false }]}
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            rules={[{ required: true }]}
          >
            <Input.TextArea style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        {/* <Col span={14}></Col> */}
        {/* <Col span={7}></Col> */}
      </Row>
      {/* <Row>
        <Col span={24}>
          <Form.List name="actives" rules={[{ validator: activeValidator }]}>
            {(fields, { add, remove }, { errors }) => (
              <>
                <Form.Item>
                  {false ? (
                    ''
                  ) : (
                    <Button
                      style={{ left: '5%' }}
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
                      {false ? (
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
      </Row> */}
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
      <div style={{ paddingBottom: '40px', paddingRight: '20px' }}>
        <Button onClick={() => form.resetFields()} style={{ float: 'right' }}>
          重置
        </Button>
        <Button
          onClick={() => handleSubmit()}
          style={{ marginRight: '20px', float: 'right' }}
          type="primary"
        >
          提交
        </Button>
        <div style={{ clear: 'both' }}></div>
      </div>
      {contextHolder}
    </Form>
  );
};
