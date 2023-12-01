import React, { useState, Fragment } from 'react';
import { map, filter, find } from 'ramda'
import { Form, Input, Tabs, Tag, Button, Divider, Row, Col, DatePicker, Upload, Descriptions, Select } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { ProjectInput, Query } from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import { useModel } from 'umi';
import { useBaseState } from '@/pages/utils/hook';
import type { FormInstance } from 'antd/lib/form';
import { getStatusDisplayName } from './utils';
import moment from 'moment';

const userQuery = gql`
{
    customers {
      id
      name
      industryCode
      regionCode
      salesman
      contacts {
        name
        phone
        tags
      }
      remark
      enable
      isDel
      createDate
    }
    tags
    agreements {
      id
      name
      type
      remark
      fileList {
        uid
        name
        status
        url
      }
      startTime
      endTime
      isDel
      createDate
    }
    projectAgreements {
      id
      agreementId
    }
    subordinates {
      id
      name
    }
  }
`;

const layout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 16 },
};

export default (form: FormInstance<ProjectInput>, data?: ProjectInput) => {
  const { data: resData } = useQuery<Query>(userQuery, { fetchPolicy: 'no-cache' });
  const { status, industries, regions, buildProjName } = useBaseState();
  const { initialState } = useModel('@@initialState');
  const reg = /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
  const result = reg.exec(data?.id || '');
  const [projType] = useState(result?.groups?.projType || '');

  // 客户信息
  const customer = find(sub => sub.id === data?.customer, resData?.customers || [])
  // 合同信息
  const agreement = find(proA => proA.id === find(a => a.id ===data?.id, resData?.projectAgreements|| [])?.agreementId, resData?.agreements || [])

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

  const activeValidator = async (_: any) => {
    const actives = form.getFieldValue(_.field);
    let type = projType === 'SQ' ? '销售' : projType === 'SH' ? '巡检' : '项目'
    if (!actives || !actives.length) {
      return Promise.reject(Error(`至少需要添加一个${type}活动`));
    } else {
      return true;
    }
  };

  const renderActiveNode = (fields: any) => {
    let tempFields = []
    for (let i = fields.length - 1; i >= 0; i--) {
      fields['index'] = i
      tempFields.push(fields[i])
    }
    return tempFields;
  }
  
  return (
    <Tabs defaultActiveKey="1" type="card">
      <Tabs.TabPane tab={projType === 'SQ' ? '销售活动信息' : '巡检活动信息'} key="1">
        <Form 
          {...layout} 
          form={form} 
          initialValues={data || { leader: initialState?.currentUser?.id }} 
          disabled={data?.status === 'endProj'}
        >
          <Form.Item label="ID" name="id" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="ID" name="leader" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="ID" name="salesLeader" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="ID" name="name" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="ID" name="customer" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="ID" name="projStatus" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="ID" name="contStatus" hidden>
            <Input />
          </Form.Item>
          <Form.Item label="ID" name="acceStatus" hidden>
            <Input />
          </Form.Item>
          <Row>
            <Col span={24}>
              <Form.List name='actives' rules={[{ validator: activeValidator }]}>
                {(fields, { add, remove }, { errors }) => (
                  <>
                    <Form.Item>
                      <Button type="dashed" onClick={() => add({recorder: initialState?.currentUser?.id }, fields.length)} icon={<PlusOutlined />}>
                        添加{projType === 'SQ' ? '销售' : projType === 'SH' ? '巡检' : '项目'}活动
                      </Button>
                      <Form.ErrorList errors={errors} />
                    </Form.Item>
                    <div style={{ maxHeight: '48vh', overflowY: 'auto' }}>
                    {renderActiveNode(fields).map((field, i) => (
                      <div key={field.key} style={{ textAlign: 'left' }}>
                        <Divider>
                          <Form.Item
                            labelCol={{ span: 1, offset: 0 }}
                            key="name"
                            label=" "
                            colon={false}
                            name={[field.name, 'name']}
                            rules={[{ required: true }]}
                          >
                            <Input
                              disabled={(field.name < (data?.actives?.length || 0))}
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
                                value: value ? moment(value) : undefined
                              })}
                            >
                              <DatePicker
                                disabled={(field.name < (data?.actives?.length || 0))}
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
                              // initialValue={initialState?.currentUser?.id}
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
                              labelCol={{ span: 3, offset: 0 }}
                              key="content"
                              label="活动内容"
                              name={[field.name, 'content']}
                              rules={[{ required: true }]}
                            >
                              <Input.TextArea
                                disabled={(field.name < (data?.actives?.length || 0))}
                                rows={4}
                                placeholder="需包含：地点--人物---事件"
                              />
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
                                { ...props }
                                disabled={(field.name < (data?.actives?.length || 0))}
                                defaultFileList={
                                  form.getFieldValue('actives') ? 
                                  form.getFieldValue('actives')[field.name]?.fileList as UploadFile[] : []
                                }
                              >
                                <div>
                                  <Button icon={<UploadOutlined />}>上传</Button>
                                </div>
                              </Upload>
                            </Form.Item>
                          </Col>
                        </Row>
                        <div style={{ textAlign: 'center' }}>
                          <MinusCircleOutlined
                            hidden={(field.name < (data?.actives?.length || 0))}
                            className="dynamic-delete-button"
                            onClick={() => remove(field.name)}
                          />
                        </div>
                      </div>
                    ))}
                    </div>
                  </>
                )}
              </Form.List>
            </Col>
          </Row>
        </Form>
      </Tabs.TabPane>
      <Tabs.TabPane tab="项目信息" key="2">
        <Descriptions
          className="proj-detail"
          labelStyle={{width: '130px'}}
          // layout="vertical"
          layout="horizontal"
          bordered
          size="small"
          column={{ xs: 1, sm: 2 }}
        >
          <Descriptions.Item label="项目名称:">{ buildProjName(data?.id || '', data?.name || '') }</Descriptions.Item>
          <Descriptions.Item label="项目ID:">{ data?.id }</Descriptions.Item>
          <Descriptions.Item label="客户信息:" span={3}>
            <Row>
              <Col xs={24} sm={6}>
                客户名称: { customer?.name }
              </Col>
              <Col xs={24} sm={6}>
                所属行业: { customer ? find(indu => indu.code === customer?.industryCode, industries || [])?.name : '' }
              </Col>
              <Col xs={24} sm={6}>
                所属区域: { customer ? find(indu => indu.code === customer?.regionCode, regions || [])?.name : '' }
              </Col>
              <Col xs={24} sm={6}>
                销售负责人: { customer ? find(indu => indu.id === customer?.salesman, resData?.subordinates || [])?.name : '' }
              </Col>
            </Row>
            {customer?.contacts.map((u) => (
              <Row key={u.name + u?.phone}>
                <Col xs={24} sm={6}>
                  联系人姓名: { u?.name }
                </Col>
                <Col xs={24} sm={6}>
                  联系人电话: { u?.phone }
                </Col>
                <Col xs={24} sm={12}>
                  联系人标签: { u?.tags.map(tag => (<Tag key={tag} color="blue">{tag}</Tag>)) }
                </Col>
              </Row>
            ))}
          </Descriptions.Item>
          <Descriptions.Item label="合同信息:" span={3}>
            <Row hidden={!agreement}>
              <Col xs={24} sm={6}>
                合同名称: { agreement?.name }
              </Col>
              <Col xs={24} sm={18}>
                合同时间: { agreement?.startTime + '------' +  agreement?.endTime}
              </Col>
            </Row>
            <br />
            <div hidden={!agreement}>
              <Upload { ...props } fileList={agreement?.fileList as UploadFile[]}></Upload>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="项目负责人:">{ 
            find(sub => sub.id === data?.leader, resData?.subordinates || [])?.name
          }</Descriptions.Item>
          <Descriptions.Item label="市场负责人:">{ 
            find(sub => sub.id === data?.salesLeader, resData?.subordinates || [])?.name
          }</Descriptions.Item>
          <Descriptions.Item label="参与人员:" span={3}>{ 
            map(lead => filter(sub => sub.id === lead, resData?.subordinates || [])[0]?.name, data?.participants || []).join(' ')
          }</Descriptions.Item>

          <Descriptions.Item label="阶段状态:">{ 
            getStatusDisplayName(data?.status || '')
          }</Descriptions.Item>
          <Descriptions.Item label="项目状态:">{ 
            find(statu => statu.id === data?.projStatus, status)?.name
          }</Descriptions.Item>

          <Descriptions.Item label="验收状态:">{ 
            find(statu => statu.id === data?.acceStatus, status)?.name
          }</Descriptions.Item>
          <Descriptions.Item label="合同状态:">{ 
            find(statu => statu.id === data?.contStatus, status)?.name
          }</Descriptions.Item>
        
          <Descriptions.Item label="启动日期:">{ 
            data?.startTime ? moment(data?.startTime).format('YYYY-MM-DD') : ''
          }</Descriptions.Item>
          <Descriptions.Item label="关闭日期:">{ 
            data?.endTime ? moment(data?.endTime).format('YYYY-MM-DD') : ''
          }</Descriptions.Item>
          
          <Descriptions.Item label="合同金额:">{ data?.contAmount }</Descriptions.Item>
          <Descriptions.Item label="确认金额:">{ data?.recoAmount }</Descriptions.Item>
          <Descriptions.Item label="税后金额:">{ data?.taxAmount }</Descriptions.Item>
          <Descriptions.Item label="项目预算:">{ data?.projBudget }</Descriptions.Item>
          <Descriptions.Item label="预算费用:">{ data?.budgetFee }</Descriptions.Item>
          <Descriptions.Item label="实际费用:">{ data?.actualFee }</Descriptions.Item>
          <Descriptions.Item label="预算成本:">{ data?.budgetCost }</Descriptions.Item>
          <Descriptions.Item label="采购成本:">{ data?.actualCost }</Descriptions.Item>
          <Descriptions.Item label="预估工作量:">{ data?.estimatedWorkload }</Descriptions.Item>
          { projType === 'SZ' ?
            <Fragment>
              <Descriptions.Item> </Descriptions.Item>
              <Descriptions.Item label="投产日期:">{ data?.productDate ? moment(data?.startTime).format('YYYY-MM-DD') : '' }</Descriptions.Item>
              <Descriptions.Item label="验收日期:">{ data?.acceptDate ? moment(data?.startTime).format('YYYY-MM-DD') : '' }</Descriptions.Item>
              <Descriptions.Item label="免费维护期:">{ data?.serviceCycle }</Descriptions.Item>
            </Fragment> : ''
          }
          { projType === 'SH' ?
            <Fragment>
              <Descriptions.Item> </Descriptions.Item>
              <Descriptions.Item label="免费人天数:">{ data?.freePersonDays }</Descriptions.Item>
              <Descriptions.Item label="已用人天数:">{ data?.usedPersonDays }</Descriptions.Item>
              <Descriptions.Item label="要求巡检次数:">{ data?.requiredInspections }</Descriptions.Item>
              <Descriptions.Item label="实际巡检次数:">{ data?.actualInspections }</Descriptions.Item>
              <Descriptions.Item label="服务周期:">{ data?.serviceCycle }</Descriptions.Item>
            </Fragment> : ''
          }
          <Descriptions.Item> </Descriptions.Item>
          <Descriptions.Item label="项目描述:" span={3}>{ data?.description }</Descriptions.Item>
        </Descriptions>
      </Tabs.TabPane>
    </Tabs>
  );
};
