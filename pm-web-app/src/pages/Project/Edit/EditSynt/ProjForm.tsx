import React, { useState } from 'react';
import { Form, Input, Select, Button, Divider, Row, Col, DatePicker, Upload } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { ProjectInput, Query, QueryGroupsUsersArgs, QueryProjDailyArgs } from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import { useModel } from 'umi';
import type { FormInstance } from 'antd/lib/form';
import ProjIdComponent from './ProjIdComponent';
import { forEach } from 'ramda';

const userQuery = gql`
  query($groups: [String!]) {
    groupsUsers(groups: $groups) {
      id
      name
    }
    
    subordinates {
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
  const {  data: resData } = useQuery<Query, QueryGroupsUsersArgs>(userQuery, { fetchPolicy: 'no-cache', variables: {
    groups: ['/软件事业部/软件一部/市场组', '/软件事业部/软件二部/市场组', '/软件事业部/创新业务部/市场组'],
  } });
  const { data: queryData } = useQuery<Query, QueryProjDailyArgs >(QueryDaily, { fetchPolicy: 'no-cache', variables: {
    projId: data?.id || '',
  } });
  const { initialState } = useModel('@@initialState');
  const reg = /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
  const result = reg.exec(data?.id || '');
  const [projType, setProjType] = useState(result?.groups?.projType || '');

  // 获取填写日报人员id，禁止修改
  let employeeIds: string[] = [];
  if (queryData && queryData.allProjDaily.dailies.length) {
    const employeesSet = new Set<string>([]);
    forEach(item => forEach(chItem => employeesSet.add(chItem.employee.id), item.dailyItems), queryData.allProjDaily.dailies)
    employeeIds = [...employeesSet]
  }

  const props: UploadProps = {
    listType: "picture",
    action: '/api/upload/tmp',
    defaultFileList: [],
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: true
    },
    onChange: ({ file, fileList }) => {
      // console.log(file, fileList)
      if (file.status !== 'uploading') {
        fileList.forEach(item => {
          const { url, response } = item
          item.url = url ? url : response.data
          item.thumbUrl = ''
          delete item.lastModified
          delete item.percent
          delete item.size
          delete item.type
          // delete item.originFileObj
          delete item.response
          delete item.xhr
          delete item.lastModifiedDate
        })
      }
    }
  };

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const validator = (rule: any, value: string) => {
    const result = reg.exec(value);
    setProjType(result?.groups?.projType || '')
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
    return (!data?.id ) && resData!.projs.find((sp) => sp.id === value)
      ? Promise.reject(Error('id已存在'))
      : Promise.resolve();
  };

  const activeValidator = async (_: any) => {
    const actives = form.getFieldValue(_.field);
    let type = projType === 'SQ' ? '销售' : projType === 'SH' ? '巡检' : '项目'
    if ((projType === 'SQ' || projType === 'SH') && (!actives || !actives.length)) {
      return Promise.reject(Error(`至少需要添加一个${type}活动`));
    } else {
      return true;
    }
  };

  // const getLeveTwoStatus = (type: string, label: string) => {
  //   const id = form.getFieldValue('id');
  //   const result = reg.exec(id);
  //   let options: TreeStatu[] = [];
  //   treeStatus.forEach((statu) => {
  //     if (statu.code === result?.groups?.projType && statu.children) {
  //       statu.children.map((s: TreeStatu) => {
  //         if (s.code === type) {
  //           options = s.children || [];
  //         }
  //       });
  //     }
  //   });
  //   return (
  //     <Form.Item label={label} name={type} rules={[{ required: true }]}>
  //       {options.length ? (
  //         <Select allowClear>
  //           {options.map((s: TreeStatu) => (
  //             <Select.Option key={s.id} value={s.id}>
  //               {s.name}
  //             </Select.Option>
  //           ))}
  //         </Select>
  //       ) : (
  //         <Select loading={loading} />
  //       )}
  //     </Form.Item>
  //   );
  // };

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
      })
    }
  };

  // 派生一个新项目
  // const deriveNewProject = () => {
  //   setIsDerive(true)
  //   form.setFieldValue('pId', data?.id);
  //   // 生成派生项目id
  //   let newId = data?.id.replace(/-(\w+)$/, `-${moment().format('MMDD')}`) || '1'
  //   onIdChange(newId);
  // };

  // 获取客户信息
  // const getCustomers = (type: string, label: string) => {
  //   let customersArr = resData?.customers.filter(item => item.enable) || []
  //   if (customersArr.length > 1) {
  //     const id = form.getFieldValue('id');
  //     const result = reg.exec(id);
  //     customersArr = customersArr.filter(item => {
  //       return (item.industryCode === result?.groups?.org) && (item.regionCode === result?.groups?.zone)
  //     })
  //   }
  //   return (
  //     <Form.Item label={label} name={type} rules={[{ required: true }]}>
  //       {customersArr.length ? (
  //         <Select allowClear>
  //           {customersArr.map((s: Customer) => (
  //             <Select.Option key={s.id} value={s.id}>
  //               {s.name}
  //             </Select.Option>
  //           ))}
  //         </Select>
  //       ) : (
  //         <Select loading={loading} />
  //       )}
  //     </Form.Item>
  //   );
  // }

  const renderActiveNode = (fields: any) => {
    let tempFields = []
    for (let i = fields.length - 1; i >= 0; i--) {
      fields['index'] = i
      tempFields.push(fields[i])
    }
    return tempFields;
  }

  return (
    <Form
      {...layout}
      form={form}
      initialValues={data || { leader: initialState?.currentUser?.id }}
      disabled={data?.status === 'endProj'}
    >
      <Form.Item shouldUpdate noStyle>
        {() => {
          return (
            <Row>
              <Col xs={24} sm={20}>
                <Form.Item labelCol={{ span: 3, offset: 0 }} hidden={!(  data?.pId)} label="关联项目ID" name="pId">
                  <Input disabled />
                </Form.Item>
                <Form.Item
                  labelCol={{ span: 3, offset: 0 }}
                  label="ID"
                  name="id"
                  rules={[{ required: true }, { validator }]}
                >
                  <ProjIdComponent disabled={!!data?.id} onChange={onIdChange} />
                </Form.Item>
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
          <Form.Item label="项目经理" name="leader" rules={[{ required: true }]}>
            <Select disabled={!!data?.id } allowClear>
              {resData?.subordinates.map((u) => (
                <Select.Option key={u.id} value={u.id}>
                  {u.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item label="市场经理" name="salesLeader" rules={[{ required: true }]}>
            <Select allowClear>
              {resData?.groupsUsers.map((u) => (
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
          <Form.Item label="参与人员" name="participants" labelCol={{ span: 3, offset: 0 }}>
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
              {resData?.subordinates.map((u) => (
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
        <Col span={24}>
          <Form.Item label="项目描述" name="description" labelCol={{ span: 3, offset: 0 }}>
            <Input.TextArea />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.List name='actives' rules={[{ validator: activeValidator }]}>
            {(fields, { add, remove }, { errors }) => (
              <>
                <Form.Item>
                  {data?.status === 'endProj' ? '' :
                    <Button type="dashed" onClick={() => add({recorder: initialState?.currentUser?.id }, fields.length)} icon={<PlusOutlined />}>
                      添加{projType === 'SQ' ? '销售' : projType === 'SH' ? '巡检' : '项目'}活动
                    </Button>
                  }
                  <Form.ErrorList errors={errors} />
                </Form.Item>
                {renderActiveNode(fields).map((field, i) => (
                  <div key={field.key} style={{ textAlign: 'left' }}>
                    <Divider>{projType === 'SQ' ? '销售' : projType === 'SH' ? '巡检' : '项目'}活动 {field.name + 1}</Divider>
                    <Row>
                      <Col xs={24} sm={12}>
                        <Row>
                          <Col span={24}>
                            <Form.Item
                              labelCol={{ span: 5, offset: 0 }}
                              key="recorder"
                              label="记录人"
                              name={[field.name, 'recorder']}
                              rules={[{ required: true }]}
                            >
                              <Select disabled >
                                {resData?.subordinates.map((u) => (
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
                              labelCol={{ span: 5, offset: 0 }}
                              key="date"
                              label="活动日期"
                              name={[field.name, 'date']}
                              rules={[{ required: true }]}
                            >
                              <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }}/>
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Form.Item
                              labelCol={{ span: 5, offset: 0 }}
                              key="content"
                              label="活动内容"
                              name={[field.name, 'content']}
                              rules={[{ required: true }]}
                            >
                              <Input.TextArea rows={4} placeholder="需包含：时间--地点--人物---事件" />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Col>
                      <Col xs={24} sm={12}>
                        <Form.Item
                          labelCol={{ span: 5, offset: 0 }}
                          key="fileList"
                          label="活动材料"
                          name={[field.name, 'fileList']}
                          rules={[{ required: false }]}
                          getValueFromEvent={normFile}
                          style={{ textAlign: 'left' }}
                        >
                          <Upload
                            { ...props }
                            defaultFileList={
                              form.getFieldValue('actives') ?
                              form.getFieldValue('actives')[field.name]?.fileList as UploadFile[] : []
                            }
                          >
                            <Button icon={<UploadOutlined />}>上传</Button>
                          </Upload>
                        </Form.Item>
                      </Col>
                    </Row>
                    <div style={{ textAlign: 'center' }}>
                    {data?.status === 'endProj' ? '' :
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        onClick={() => remove(field.name)}
                      />
                    }
                    </div>
                  </div>
                ))}
              </>
            )}
          </Form.List>
        </Col>
      </Row>
    </Form>
  );
};
