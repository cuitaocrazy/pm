import { Input, Form, Select } from 'antd';
import type { FC } from 'react';
import React, { useState, useEffect } from 'react';
import { useBaseState } from '@/pages/utils/hook';
import moment from 'moment';
import type { IsExistProjIdArgs, IsExistProjIdQuery } from '@/apollo';
import { gql, useLazyQuery } from '@apollo/client';

const { Option } = Select;

type OnChangeHandler = {
  (e: any): void;
};
type ProjIdComponentProps = {
  value?: string;
  onChange?: OnChangeHandler;
  disabled?: boolean;
  onIsExistProjIdDataChange: (data: Boolean) => void; // 新增回调函数类型
};

const styles = {
  select: {
    minWidth: 100,
  },
};

const reg = /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;

function getIdInfo(id?: string) {
  const tid = id || '----';
  const result = reg.exec(tid);
  return {
    org: result?.groups?.org || '',
    zone: result?.groups?.zone || '',
    projType: result?.groups?.projType || '',
    simpleName: result?.groups?.simpleName || '',
    dateCode: result?.groups?.dateCode || moment().format('YYYY'),
  };
}

const queryIsExistProjID = gql`
  query GetIsExistProjID($id: String!) {
    isExistProjID(id: $id)
  }
`;

const ProjIdComponent: FC<ProjIdComponentProps> = ({
  value,
  onChange,
  disabled,
  onIsExistProjIdDataChange,
}) => {
  const { status, orgCode, projType, zoneCode } = useBaseState();
  const [isZh, setIsZh] = useState(false);
  const info = getIdInfo(value); // 获取项目信息对象
  const getId = () =>
    `${info.org}-${info.zone}-${info.projType}-${info.simpleName}-${info.dateCode}`;
  const [fetchIsExistProjID, { data: IsExistProjIdData }] = useLazyQuery<
    IsExistProjIdQuery,
    IsExistProjIdArgs
  >(queryIsExistProjID, {
    fetchPolicy: 'no-cache',
    variables: {
      id: getId(),
    },
  });
  useEffect(() => {
    // 在 IsExistProjIdData 发生变化时调用回调函数
    if (onIsExistProjIdDataChange && IsExistProjIdData !== undefined) {
      onIsExistProjIdDataChange(IsExistProjIdData.isExistProjID);
    }
  }, [IsExistProjIdData, onIsExistProjIdDataChange]);

  const change = () => onChange && onChange(getId());
  const changeOrg = (org: string) => {
    info.org = org;
    change();
  };
  const changeZone = (zone: string) => {
    info.zone = zone;
    change();
  };
  const changeProjType = (type: string) => {
    info.projType = type;
    change();
  };
  const handleOnKeyDown = (e: any) => {
    if (e.key === 'Enter') {
      // 用户按下回车键
      setIsZh(false);
    } else if (e.shiftKey && e.key === 'Shift') {
      // 用户按下Shift键
      setIsZh(false);
    }
  };
  const changeSimpleName = (simpleName: string) => {
    if (isZh) return;
    const result = /^\w*$/.exec(simpleName);
    if (result) {
      info.simpleName = simpleName.toUpperCase();
      change();
    }
  };
  const changeDateCode = (dateCode: string) => {
    const result = /^\d{0,4}$/.exec(dateCode);
    if (result) {
      info.dateCode = dateCode;
      change();
    }
  };
  return (
    <Input.Group compact>
      <Form.Item noStyle>
        <Select
          key="org"
          placeholder="选择行业"
          onChange={(e) => changeOrg(e.toString())}
          value={info.org || undefined}
          disabled={disabled}
          style={styles.select}
        >
          {Object.keys(orgCode).map((k) => (
            <Option key={k} value={k}>
              {orgCode[k]}
            </Option>
          ))}
        </Select>
        <Select
          key="zone"
          placeholder="选择区域"
          showSearch
          filterOption={(input, option) => {
            const nameStr: any = option?.value || '';
            if (input && nameStr) {
              return nameStr.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            }
            return true;
          }}
          onChange={(e) => changeZone(e.toString())}
          value={info.zone || undefined}
          disabled={disabled}
          style={styles.select}
        >
          {Object.keys(zoneCode).map((k) => (
            <Option key={k} value={k}>
              {zoneCode[k]}
            </Option>
          ))}
        </Select>
        <Select
          key="projType"
          placeholder="选择类型"
          onChange={(e) => changeProjType(e.toString())}
          value={info.projType || undefined}
          disabled={disabled}
          style={styles.select}
        >
          {Object.keys(projType).map((k) => (
            <Option key={k} value={k}>
              {projType[k]}
            </Option>
          ))}
        </Select>
        <Input
          style={{ width: '250px' }}
          key="simpleName"
          placeholder="项目缩写:只允许填写拼音或数字"
          onCompositionStart={(e) => setIsZh(true)}
          // onBlur={(e) => setIsZh(false)}
          onKeyDown={(e) => handleOnKeyDown(e)}
          onChange={(e) => changeSimpleName(e.target.value)}
          onBlur={() => fetchIsExistProjID()}
          value={info.simpleName}
          disabled={disabled}
        />
        <Input
          style={{ width: '100px' }}
          key="dateCode"
          placeholder="年度编号"
          onChange={(e) => changeDateCode(e.target.value)}
          maxLength={4}
          value={info.dateCode}
          disabled={disabled}
        />
        <span hidden={disabled} className="status-remark">
          {info.projType ? status.find((p) => p.code === info.projType)?.remark : ''}
        </span>

        <Input style={{marginTop:'12px'}} key="preview" disabled addonBefore={'预览'} value={getId()} />
      </Form.Item>
    </Input.Group>
  );
};
export default ProjIdComponent;
