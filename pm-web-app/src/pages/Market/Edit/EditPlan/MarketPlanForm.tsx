import React, { useState, useEffect } from 'react';
import { Form, Input, Select, Button, DatePicker, Row, Col, message } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { Market, MarketPlanInput, MarketWeekPlan, Query } from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import { useModel } from 'umi';
import type { FormInstance } from 'antd/lib/form';
import moment from 'moment'

const userQuery = gql`
  {
    subordinates {
      id
      name
    }
    marketPlans {
      id
      week
    }
    markets {
      id
      name
      leader
      projects {
        name
        introduct
        scale
        plan
        status
        visitRecord {
          date
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

export default (form: FormInstance<MarketPlanInput>, data?: MarketPlanInput) => {
  const { loading, data: resData } = useQuery<Query>(userQuery, { fetchPolicy: 'no-cache' });
  const { initialState } = useModel('@@initialState');
  const [seletMarkets, setSeletMarkets] = useState<Market[]>([]);
  // 查看时初始化 seletMarkets的值
  useEffect(() => {
    if (data?.id && resData?.markets) {
      let markArr: Market[] | any[]  = []
      data?.weekPlans.forEach((item, index) => {
        let findOb = resData?.markets.find(mar => mar.id == item.marketId)
        markArr[index] = findOb || {}
      })
      setSeletMarkets(markArr)
    }
  }, [resData?.markets]);

  const addWeekPlan = (add: any) => {
    let week = form.getFieldValue('week')
    if (week) {
      add()
    } else {
      message.info('请先选择当前周')
    }
  }

  // 修改机构时更新选中的机构列表并初始化已经选中的项目参数
  const onMarketChange = (value: string, filed: any) => {
    let selectMarket = resData?.markets.find(item => item.id === value)
    let tempSelet = seletMarkets || []
    if (selectMarket) {
      tempSelet[filed.name] = selectMarket
      let tempWeekPlans = form.getFieldValue('weekPlans') || []
      tempWeekPlans[filed.name] = { marketId: value, marketName: selectMarket.name }
      form.setFieldsValue({
        weekPlans: tempWeekPlans
      })
    }
    setSeletMarkets(tempSelet)
  };

  // 修改项目时实时刷新对应的预算 状态和计划字段并更新拜访记录
  const onProjectChange = (value: string, filed: any) => {
    const { name: projectName, scale, status, plan } = seletMarkets[filed.name].projects?.find(item => item.name === value) || {};
    let tempWeekPlans = form.getFieldValue('weekPlans') || []
    tempWeekPlans[filed.name].projectScale = scale
    tempWeekPlans[filed.name].projectStatus = status
    tempWeekPlans[filed.name].projectPlan = plan
    if (projectName) {
      form.setFieldsValue({
        weekPlans: tempWeekPlans
      })
      getWeekWork(filed.name)
    }
  };

  // 获取选中的项目在选中周的拜访记录并拼接
  const getWeekWork = (index: number) => {
    let tempWeekPlans = form.getFieldValue('weekPlans') || []
    let tempWeek = form.getFieldValue('week') || ''
    const { visitRecord } = seletMarkets[index].projects?.find(item => item.name === tempWeekPlans[index].projectName) || {};
    let visit = visitRecord?.filter(item => {
      return moment(tempWeek).weekday(0).format('YYYY-MM-DD') === moment(item.date).weekday(0).format('YYYY-MM-DD')
    }).map(v => v.content).join('\n')
    tempWeekPlans[index].weekWork = visit || ''
    form.setFieldsValue({
      weekPlans: tempWeekPlans
    })
  }

  const onPlanWeekChange = (date: any) => {
    const tempWeekPlans = form.getFieldValue('weekPlans') || []
    tempWeekPlans.forEach((p: MarketWeekPlan, index: number) => getWeekWork(index))
    
  }

  const weekPlansValidator = async (_: any) => {
    const weekPlans = form.getFieldValue('weekPlans');
    if (!weekPlans || weekPlans.length === 0) {
      return Promise.reject(Error(`至少需要添加一条周计划`));
    } else {
      return true;
    }
  };

  return (
    <Form 
      {...layout} 
      form={form} 
      initialValues={data || { leader: initialState?.currentUser?.id }} 
    >
      <Row>
        <Col span={8}>
          <Form.Item hidden label="ID" name="id">
            <Input />
          </Form.Item>
          <Form.Item
            label="当前周"
            name="week"
            rules={[{ required: true }]}
            getValueProps={(value) => ({
              value: value ? moment(value) : undefined
            })}
          >
            <DatePicker
              allowClear={false}
              inputReadOnly
              picker="week"
              onChange={onPlanWeekChange}
            />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="周开始时间"
            name="week"
            getValueProps={(value) => ({
              value: value ? moment(value).weekday(0) : undefined
            })}
          >
             <DatePicker disabled picker="date" />
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            label="周结束时间"
            name="week"
            getValueProps={(value) => ({
              value: value ? moment(value).weekday(6) : undefined
            })}
          >
            <DatePicker disabled picker="date" />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Form.List name="weekPlans" rules={[{ validator: weekPlansValidator }]}>
            {(fields, { add, remove }, { errors }) => (
              <>
                <Form.Item>
                  <Button type="dashed" onClick={() => addWeekPlan(add)} icon={<PlusOutlined />}>
                    添加周计划
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
                {fields.reverse().map((field, i) => (
                  <div key={field.key}>
                    <Row>
                      <Col span={8}>
                        <Form.Item
                          key="marketId"
                          label="机构名称"
                          name={[field.name, 'marketId']}
                          rules={[{ required: true }]}
                        >
                          <Select onChange={v => onMarketChange(v, field)} placeholder="选择机构">
                            {resData?.markets?.map((u) => (
                              <Select.Option key={u.id} value={u.id}>
                                {u.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          hidden
                          key="marketName"
                          label="机构名称"
                          name={[field.name, 'marketName']}
                          rules={[{ required: true }]}
                        >
                          <Input />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          noStyle
                          shouldUpdate
                        >
                          {() => (
                            <Form.Item
                              key="projectName"
                              label="项目名称"
                              name={[field.name, 'projectName']}
                              rules={[{ required: true }]}
                              shouldUpdate
                            >
                              <Select onChange={v => onProjectChange(v, field)}>
                                {(seletMarkets[field.name]?.projects || []).map((u) => (
                                    <Select.Option key={u.name} value={u.name}>
                                      {u.name}
                                    </Select.Option>
                                  )
                                )}
                              </Select>
                            </Form.Item>
                          )}
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          key="projectStatus"
                          label="项目状态"
                          name={[field.name, 'projectStatus']}
                          rules={[{ required: true }]}
                        >
                          <Select disabled>
                              <Select.Option key={'track'} value={'track'}>跟踪</Select.Option>
                              <Select.Option key={'stop'} value={'stop'}>终止</Select.Option>
                              <Select.Option key={'transfer'} value={'transfer'}>转销售</Select.Option>
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={8}>
                        <Form.Item
                          key="projectScale"
                          label="项目预算"
                          name={[field.name, 'projectScale']}
                        >
                          <Input disabled/>
                        </Form.Item>
                      </Col>
                      <Col span={16}>
                        <Form.Item
                          key="projectPlan"
                          label="项目计划"
                          name={[field.name, 'projectPlan']}
                          labelCol={{ span: 3, offset: 3 }}
                        >
                          <Input.TextArea disabled/>
                        </Form.Item>
                      </Col>
                    </Row>
                    <Row>
                      <Col span={12}>
                        <Form.Item
                          key="weekWork"
                          label="本周工作"
                          name={[field.name, 'weekWork']}
                          labelCol={{ span: 6, offset: 0 }}
                        >
                          <Input.TextArea autoSize={{ minRows: 5 }}/>
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          key="nextWeekPlan"
                          label="下周计划"
                          name={[field.name, 'nextWeekPlan']}
                          labelCol={{ span: 6, offset: 0 }}
                        >
                          <Input.TextArea autoSize={{ minRows: 5 }}/>
                        </Form.Item>
                      </Col>
                    </Row>
                    <div style={{ textAlign: 'center' }} >
                      <MinusCircleOutlined
                        className="dynamic-delete-button"
                        style={{ textAlign: 'center' }} 
                        onClick={() => remove(field.name)}
                      />
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
