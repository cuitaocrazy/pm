/*
 * @Author: 13718154103 1161593628@qq.com
 * @Date: 2024-12-03 17:06:17
 * @LastEditors: 13718154103 1161593628@qq.com
 * @LastEditTime: 2024-12-04 19:10:52
 * @FilePath: /pm/pm-web-app/src/pages/Business/Agreement/Edit/PayWayForm.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import React, { useState, useEffect } from 'react';
import {
  PlusOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  TableOutlined,
  FileOutlined,
  FileZipOutlined,
  MinusCircleOutlined,
} from '@ant-design/icons';
import {
  Form,
  Input,
  Upload,
  Select,
  Modal,
  DatePicker,
  message,
  Button,
  Space,
  InputNumber,
} from 'antd';
import type { UploadProps, UploadFile } from 'antd';
import type { AgreementInput, Query } from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import type { FormInstance } from 'antd/lib/form';
import { agreementType, useBaseState } from '@/pages/utils/hook';
import moment from 'moment';

const { RangePicker } = DatePicker;
const dateFormat = 'YYYYMMDD';

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
    }
    payStateManages {
      name
      code
    }
    collectionQuarterManages {
      name
      code
    }
  }
`;

const layout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

export default (form: FormInstance<AgreementInput>, data?: AgreementInput) => {
  // console.log(data, 'data JJJJJJ');
  const { data: resData } = useQuery<Query>(userQuery, {
    fetchPolicy: 'no-cache',
    variables: {
      customersPageSize: 10000000,
    },
  });
  // console.log(resData, 'resData JJJJJ');
  // 初始化时计算款项金额
  useEffect(() => {
    const { contractAmount, milestoneValue } = data;
    if (contractAmount != null && milestoneValue != null) {
      const milestoneAmount = (Number(contractAmount) * Number(milestoneValue)) / 100;
      form.setFieldsValue({ milestoneAmount });
    }
  }, [data, form]);
  const [payState, setPayState] = useState();
  const [expectedQuarter, setExpectedQuarter] = useState();
  let files = data?.paymentFileList ? (data?.paymentFileList as UploadFile[]) : [];
  console.log(files, 'paymentFileList KKLLKKLL');
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
      let fileList = form.getFieldValue('paymentFileList')
        ? form.getFieldValue('paymentFileList')
        : [];
      console.log(fileList, 'fileList LLLLLL');
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
  return (
    <Form {...layout} form={form} initialValues={data}>
      <Form.Item label="id" name="id" hidden>
        <Input disabled />
      </Form.Item>
      <Form.Item label="合同名称" name="name" rules={[{ required: true }]}>
        <Input disabled />
      </Form.Item>
      <Form.Item label="合同金额" name="contractAmount" rules={[{ required: false }]}>
        <Input disabled />
      </Form.Item>
      <Form.Item label="款项类型" name="milestoneName">
        <Input disabled />
      </Form.Item>
      <Form.Item label="款项比例" name="milestoneValue">
        <InputNumber
          disabled
          placeholder="百分比"
          min={0}
          max={100}
          formatter={(value) => `${value}%`}
          parser={(value) => value?.replace('%', '') || ''}
          style={{ width: '100%' }}
        />
      </Form.Item>
      <Form.Item label="款项金额" name="milestoneAmount">
        <Input disabled />
      </Form.Item>
      <Form.Item label="付款状态" name="payState" rules={[{ required: true }]}>
        <Select
          defaultValue="lucy"
          style={{ width: 120 }}
          onChange={(v) => {
            setPayState(v);
          }}
          fieldNames={{ label: 'name', value: 'code' }}
          options={resData?.payStateManages}
        />
      </Form.Item>
      <Form.Item label="预计回款季度" name="expectedQuarter" rules={[{ required: true }]}>
        <Select
          defaultValue="lucy"
          style={{ width: 120 }}
          fieldNames={{ label: 'name', value: 'code' }}
          onChange={(v) => {
            setExpectedQuarter(v);
          }}
          options={resData?.collectionQuarterManages}
        />
      </Form.Item>
      <Form.Item label="实际回款季度" name="actualQuarter" rules={[{ required: true }]}>
        <Select
          defaultValue="lucy"
          style={{ width: 120 }}
          fieldNames={{ label: 'name', value: 'code' }}
          onChange={(v) => {
            setExpectedQuarter(v);
          }}
          options={resData?.collectionQuarterManages}
        />
      </Form.Item>
      <Form.Item
        label="资料上传"
        name="paymentFileList"
        rules={[{ required: true }]}
        getValueFromEvent={normFile}
      >
        <Upload {...props}>
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>上传</div>
          </div>
        </Upload>
      </Form.Item>
      <Form.Item label="备注" name="paymentRemark" rules={[{ required: false }]}>
        <Input.TextArea />
      </Form.Item>
    </Form>
  );
};
