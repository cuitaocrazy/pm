import React, { useState, Fragment } from 'react';
import { Tabs, Tag, Row, Col, Upload, Descriptions, Timeline } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import { map, filter, find } from 'ramda'
import type { ProjectInput, Query } from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import { useBaseState } from '@/pages/utils/hook';
import type { FormInstance } from 'antd/lib/form';
import { getStatusDisplayName } from './utils';
import moment from 'moment';

const userQuery = gql`
{
    customers {
      result {
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
      page
      total
    }
    tags
    agreements {
      result {
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
      page
      total
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

export default (form: FormInstance<ProjectInput>, data?: ProjectInput) => {
  const { data: resData } = useQuery<Query>(userQuery, { fetchPolicy: 'no-cache' });
  const { status, industries, regions, buildProjName } = useBaseState();
  const reg = /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
  const result = reg.exec(data?.id || '');
  const [projType] = useState(result?.groups?.projType || '');

  // 客户信息
  const customer = find((sub:any) => sub.id === data?.customer, resData?.customers.result || [])

  // 合同信息
  console.log(data)
  console.log(resData)
  const agreement = find(proA => proA.id === find(a => a.id ===data?.id, resData?.projectAgreements|| [])?.agreementId, resData?.agreements.result || [])
  console.log(agreement)

  const props: UploadProps = {
    listType: "picture",
    defaultFileList: [],
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: false,
      showDownloadIcon: true
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
      <Tabs.TabPane tab="项目信息" key="1">
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
                销售负责人: {customer ? find(indu => customer.salesman.includes(indu.id), resData?.subordinates || [])?.name : ''}
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
          <Descriptions.Item label="项目经理:">{ 
            find(sub => sub.id === data?.leader, resData?.subordinates || [])?.name
          }</Descriptions.Item>
          <Descriptions.Item label="市场经理:">{ 
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
          <Descriptions.Item label="费用预算:">{ data?.budgetFee }</Descriptions.Item>
          {/* <Descriptions.Item label="实际费用:">{ data?.actualFee }</Descriptions.Item> */}
          <Descriptions.Item label="项目费用:">{ data?.projectFee }</Descriptions.Item>
          <Descriptions.Item label="人力费用:">{ data?.humanFee }</Descriptions.Item>
          <Descriptions.Item label="成本预算:">{ data?.budgetCost }</Descriptions.Item>
          <Descriptions.Item label="采购成本:">{ data?.actualCost }</Descriptions.Item>
          <Descriptions.Item label="预估工作量:">{ data?.estimatedWorkload }</Descriptions.Item>
          { projType === 'SZ' ?
            <Fragment>
              <Descriptions.Item> </Descriptions.Item>
              <Descriptions.Item label="投产日期:">{ data?.productDate ? moment(data?.productDate).format('YYYY-MM-DD') : '' }</Descriptions.Item>
              <Descriptions.Item label="验收日期:">{ data?.acceptDate ? moment(data?.acceptDate).format('YYYY-MM-DD') : '' }</Descriptions.Item>
              <Descriptions.Item label="免费维护期:">{ data?.serviceCycle }</Descriptions.Item>
            </Fragment> : ''
          }
          { projType === 'SH' ?
            <Fragment>
              {/* <Descriptions.Item> </Descriptions.Item> */}
              <Descriptions.Item label="免费人天数:">{ data?.freePersonDays }</Descriptions.Item>
              <Descriptions.Item label="已用人天数:">{ data?.usedPersonDays }</Descriptions.Item>
              <Descriptions.Item label="要求巡检次数:">{ data?.requiredInspections }</Descriptions.Item>
              <Descriptions.Item label="实际巡检次数:">{ data?.actualInspections }</Descriptions.Item>
              <Descriptions.Item label="服务周期:">{ data?.serviceCycle }</Descriptions.Item>
            </Fragment> : ''
          }
          {/* <Descriptions.Item> </Descriptions.Item> */}
          <Descriptions.Item label="项目描述:" span={3}>{ data?.description }</Descriptions.Item>
        </Descriptions>
      </Tabs.TabPane>
      <Tabs.TabPane tab={projType === 'SQ' ? '销售活动信息' : '售后活动信息'} key="2">
        <Row>
          <Col span={10}>
            <div style={{ height: '50px' }}></div>
            <Timeline className='proj-detail-timeline' mode="left">
              {renderActiveNode(data?.actives).map((act, i) => (
                <Timeline.Item key={i} label={moment(act.date).format('YYYY-MM-DD HH:mm:ss')}>
                  <div>
                    活动名称: { act.name }
                  </div>
                  <div>
                    活动记录人: { act.recorder ? find(indu => indu.id === act.recorder, resData?.subordinates || [])?.name : '' }
                  </div>
                  <div>
                    活动内容: {act.content}
                  </div>
                  <div hidden={!act.fileList?.length}>
                    活动材料:
                    <Upload { ...props } fileList={act?.fileList as UploadFile[]}></Upload>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Col>
          <Col span={14}></Col>
        </Row>
      </Tabs.TabPane>
    </Tabs>
  );
};
