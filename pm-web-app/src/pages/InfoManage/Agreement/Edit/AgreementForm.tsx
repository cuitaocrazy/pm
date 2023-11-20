import React, { useState } from 'react';
import { PlusOutlined, FilePdfOutlined, FileWordOutlined, TableOutlined, FileOutlined, FileZipOutlined } from '@ant-design/icons';
import { Form, Input, Upload, Select, Modal, DatePicker, message } from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import type { AgreementInput, Query } from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import type { FormInstance } from 'antd/lib/form';
import { agreementType, useBaseState } from '@/pages/utils/hook';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYYMMDD';

const userQuery = gql`
  {
    subordinates {
      id
      name
    }
    customers {
      id
      name
    }
    projs {
      id
      name
      customer
    }
  }
`;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export default (form: FormInstance<AgreementInput>, data?: AgreementInput) => {
  const { data: resData } = useQuery<Query>(userQuery, { fetchPolicy: 'no-cache' });
  const { buildProjName } = useBaseState();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [selectType, setSelectType] = useState(data?.type || '');
  const [selectCustomer, setSelectCustomer] = useState(data?.customer || '');


  let files = data?.fileList as UploadFile[];

  const props: UploadProps = {
    listType: "picture-card",
    action: '/api/upload/tmp',
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: true
    },
    defaultFileList: files,
    beforeUpload: (file) => {
      let fileList = form.getFieldValue('fileList')
      if (fileList.filter((item: any) => item.name === file.name).length) {
        message.warning('请不要上传相同名字的文件');
        return Upload.LIST_IGNORE
      }
    },
    iconRender: (file, listType) => {
      const fileType = file.name.split('.').slice(-1)[0]
      if (fileType === 'pdf') {
        return <FilePdfOutlined />
      } else if (['docx', 'doc'].includes(fileType)) {
        return <FileWordOutlined />
      } else if (['xlsx', 'xls'].includes(fileType)) {
        return <TableOutlined />
      } else if (['zip', 'rar'].includes(fileType)) {
        return <FileZipOutlined />
      } else {
        return <FileOutlined />
      }
    },
    onPreview: (file) => {
      const fileType = file.name.split('.').slice(-1)[0]
      if (['png', 'jpeg', 'gif', 'svg', 'jpg'].includes(fileType)) {
        setPreviewImage(file.url || file.response.data || file.thumbUrl);
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
      } else {
        window.open(file.url || file.response.data, "_blank");
      }
    },
    onChange: ({ file, fileList }) => {
      if (file.status !== 'uploading') {
        fileList.forEach(item => {
          const { url, response } = item
          item.url = url ? url : response.data
          item.thumbUrl = ''
          delete item.lastModified
          delete item.percent
          delete item.size
          delete item.type
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

  const projectOptions = () => {
    const reg = /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
    let resProj = resData?.projs || []
    resProj = resProj.filter(proj => {
      if (proj.customer === selectCustomer) {
        const result = reg.exec(proj?.id);
        if (selectType === 'XMHT') {
          return result?.groups?.projType === 'SZ' || result?.groups?.projType === 'YF'
        } else if (selectType === 'DGHT') {
          return result?.groups?.projType === 'SQ'
        } else if (selectType === 'WHHT') {
          return result?.groups?.projType === 'SZ' || result?.groups?.projType === 'SH' || result?.groups?.projType === 'YF'
        } else {
          return true
        }
      } else {
        return false
      }
    })
    return resProj
  }

  const typeChange = (value: string, option: any) => {
    setSelectType(value)
    form.setFieldsValue({ contactProj: [] })
  }

  const customerChange = (value: string, option: any) => {
    setSelectCustomer(value)
    form.setFieldsValue({ contactProj: [] })
  }

  const dateChange = (value: any, dataString: any) => {
    form.setFieldsValue({ startTime: dataString[0],  endTime: dataString[1] })
  }

  return (
    <Form {...layout} form={form} initialValues={data}>
      <Form.Item label="ID" name="id" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="customerName" name="customerName" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="合同名称" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="关联客户" name="customer" rules={[{ required: true }]}>
        <Select onChange={customerChange}>
          {resData?.customers.map((u) => (
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
      <Form.Item label="关联项目" name="contactProj" rules={[{ required: selectType === 'DGHT' ? false : true }]}>
        <Select mode="multiple" disabled={!selectType || !selectCustomer}>
          {projectOptions().map((u) => (
            <Select.Option key={u.id} value={u.id}>
              {buildProjName(u.id, u.name)}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="合同文件上传" name="fileList" rules={[{ required: true }]} getValueFromEvent={normFile}>
        <Upload { ...props } disabled={!selectType || !selectCustomer}>
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
          </div>
        </Upload>
      </Form.Item>
      <Form.Item label="时间" name="time" rules={[{ required: true }]}>
        <RangePicker format={dateFormat} onChange={dateChange} />
      </Form.Item>
      <Form.Item label="startTime" name="startTime" hidden  rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item label="endTime" name="endTime" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="备注" name="remark" rules={[{ required: false }]}>
        <Input.TextArea />
      </Form.Item>
      <Modal width={'50%'} getContainer={document.body} open={previewOpen} title={previewTitle} footer={null} onCancel={() => { setPreviewOpen(false) }}>
        <img alt="example" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </Form>
  );
};
