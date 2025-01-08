import React, { useState } from 'react';
import {
  PlusOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  TableOutlined,
  FileOutlined,
  FileZipOutlined,
} from '@ant-design/icons';
import { Form, Input, Upload, Select, Modal, DatePicker, message, InputNumber,Cascader } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import type { AgreementInput, Query } from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import type { FormInstance } from 'antd/lib/form';
import { agreementType, useBaseState } from '@/pages/utils/hook';
import moment from 'moment';



const userQuery = gql`
  query ($customersPageSize: Int) {
    subordinates {
      id
      name
    }
    customers(pageSize: $customersPageSize) {
      result {
        id
        name
      }
    }
    projs {
      id
      name
      customer
      status
    }
  }
`;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export default (form: FormInstance<AgreementInput>, data?: AgreementInput) => {
  const { data: resData } = useQuery<Query>(userQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      customersPageSize: 10000000,
    },
  });
  const { buildProjName ,groupType} = useBaseState();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [selectType, setSelectType] = useState(data?.type || '');
  const [selectCustomer, setSelectCustomer] = useState(data?.customer || '');
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
  const [groupsOptions] = useState(groupDatas(groupType));
  let files = data?.fileList as UploadFile[];
  const props: UploadProps = {
    listType: 'picture-card',
    action: '/api/upload/tmp',
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: true,
    },
    defaultFileList: files,
    beforeUpload: (file) => {
      let fileList = form.getFieldValue('fileList');
      if (fileList.filter((item: any) => item.name === file.name).length) {
        message.warning('请不要上传相同名字的文件');
        return Upload.LIST_IGNORE;
      }
      return;
    },
    iconRender: (file, listType) => {
      const fileType = file.name.split('.').slice(-1)[0];
      if (fileType === 'pdf') {
        return <FilePdfOutlined />;
      } else if (['docx', 'doc'].includes(fileType)) {
        return <FileWordOutlined />;
      } else if (['xlsx', 'xls'].includes(fileType)) {
        return <TableOutlined />;
      } else if (['zip', 'rar'].includes(fileType)) {
        return <FileZipOutlined />;
      } else {
        return <FileOutlined />;
      }
    },
    onPreview: (file) => {
      const fileType = file.name.split('.').slice(-1)[0];
      if (['png', 'jpeg', 'gif', 'svg', 'jpg'].includes(fileType)) {
        setPreviewImage(file.url || file.response.data || file.thumbUrl);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
      } else {
        window.open(file.url || file.response.data, '_blank');
      }
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

  const projectOptions = () => {
    const reg = /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
    let resProj = resData?.projs || [];
    resProj = resProj.filter((proj) => {
      if (proj.customer === selectCustomer) {
        const result = reg.exec(proj?.id);
        if (selectType === 'XMHT') {
          // return result?.groups?.projType === 'SZ' || result?.groups?.projType === 'YF'
          return result?.groups?.projType !== 'ZH' && result?.groups?.projType !== 'SQ';
        } else if (selectType === 'DGHT') {
          return result?.groups?.projType !== 'ZH' && result?.groups?.projType !== 'SQ';
        } else if (selectType === 'WHHT') {
          return result?.groups?.projType !== 'ZH' && result?.groups?.projType !== 'SQ';
          // return result?.groups?.projType === 'SZ' || result?.groups?.projType === 'SH' || result?.groups?.projType === 'YF'
        } else {
          return true;
        }
      } else {
        return false;
      }
    });
    console.log(resProj,'resProj MMMMMM')
    return resProj;
  };

  const typeChange = (value: string, option: any) => {
    setSelectType(value);
    form.setFieldsValue({ contactProj: [] });
  };

  const customerChange = (value: string, option: any) => {
    setSelectCustomer(value);
    form.setFieldsValue({ contactProj: [] });
  };
  const calculateAfterTaxAmount = (values: any) => {
    const { contractAmount, taxRate } = values;
    if ((contractAmount || contractAmount === 0) && taxRate) {
      // 计算不含税金额
      const afterTaxAmount = parseFloat(contractAmount) / (1 + parseFloat(taxRate) / 100);
      form.setFieldsValue({ afterTaxAmount: afterTaxAmount.toFixed(2) } as any);
    }
  };
  return (
    <Form
      {...layout}
      form={form}
      initialValues={data}
      onValuesChange={(_, values) => {calculateAfterTaxAmount(values)}}
    >
      <Form.Item label="ID" name="id" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="customerName" name="customerName" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="部门" name="group" rules={[{ required: false }]}>
      <Cascader
            allowClear
            changeOnSelect
            className="width122"
            placeholder="请选择"
            options={groupsOptions}
          />
      </Form.Item>
      <Form.Item label="合同名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="关联客户" name="customer" rules={[{ required: true }]}>
        <Select
          showSearch
          onChange={customerChange}
          filterOption={(input, option) => {
            const nameStr: any = option?.children || '';
            if (input && nameStr) {
              return nameStr.indexOf(input) >= 0;
            }
            return false;
          }}
        >
          {resData?.customers.result.map((u) => (
            <Select.Option key={u.id} value={u.id}>
              {u.name}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="合同类型" name="type" rules={[{ required: true }]}>
        <Select onChange={typeChange}>
          {Object.keys(agreementType).map((k) => (
            <Select.Option key={k} value={k}>
              {agreementType[k]}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="关联项目"
        name="contactProj"
        rules={[{ required: false }]}
      >
        <Select mode="multiple" disabled={!selectType || !selectCustomer}>
          {projectOptions().filter(item=>item.status == 'onProj').map((u) => (
            <Select.Option key={u.id} value={u.id}>
              {buildProjName(u.id, u.name)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="合同文件上传"
        name="fileList"
        rules={[{ required: true }]}
        getValueFromEvent={normFile}
      >
        <Upload {...props} disabled={!selectType || !selectCustomer}>
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
          </div>
        </Upload>
      </Form.Item>
      {/* <Form.Item label="时间" name="time" rules={[{ required: true }]}>
        <RangePicker format={dateFormat} onChange={dateChange} />
      </Form.Item> */}
      <Form.Item
        label="合同签订日期"
        name="contractSignDate"
        rules={[{ required: true }]}
        getValueProps={(value) => ({
          value: value ? moment(value) : undefined,
        })}
      >
        <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item
        label="合同周期"
        name="contractPeriod"
        rules={[
          { required: false },
          {
            pattern: /^[0-9]+$/,
            message: '合同周期只能填写数字',
          },
        ]}
      >
        <Input suffix="月" />
      </Form.Item>
      <Form.Item label="合同编号" name="contractNumber" rules={[{ required: false }]}>
        <Input />
      </Form.Item>
      <Form.Item label="合同金额" name="contractAmount" rules={[{ required: true }]}>
        <InputNumber style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="税率" name="taxRate" rules={[{ required: false }]}>
        <Input suffix="%" min={0} max={100} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item label="不含税金额" name="afterTaxAmount" rules={[{ required: true }]}>
        <Input disabled />
      </Form.Item>
      <Form.Item
        label="免维期"
        name="maintenanceFreePeriod"
        rules={[
          { required: true },
          {
            pattern: /^[0-9]+$/,
            message: '合同周期只能填写数字',
          },
        ]}
      >
        {/* <Input placeholder="以月为单位" style={{ width: '96%' }} />月 */}
        <Input suffix="月" />
      </Form.Item>
      {/* <Form.Item label="startTime" name="startTime" hidden rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="endTime" name="endTime" hidden>
        <Input />
      </Form.Item> */}
      <Form.Item label="备注" name="remark" rules={[{ required: false }]}>
        <Input.TextArea />
      </Form.Item>
      <Modal
        width={'50%'}
        getContainer={document.body}
        open={previewOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => {
          setPreviewOpen(false);
        }}
      >
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Form>
  );
};
