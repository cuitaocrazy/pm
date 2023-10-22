import { Input, Form, Select } from 'antd';
import type { FC } from 'react';
import React from 'react';
// import { orgCode, projType, zoneCode } from '../../utils/hook';
import { useBaseState } from '@/pages/utils/hook';
import moment from 'moment';

const { Option } = Select;

type OnChangeHandler = {
  (e: any): void;
};
type ProjIdComponentProps = {
  value?: string;
  onChange?: OnChangeHandler;
  disabled?: boolean;
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
    dateCode: result?.groups?.dateCode || moment().format('MMDD'),
  };
}
const ProjIdComponent: FC<ProjIdComponentProps> = ({ value, onChange, disabled }) => {
  const { status, orgCode, projType, zoneCode } = useBaseState();
  const info = getIdInfo(value);
  const getId = () =>
    `${info.org}-${info.zone}-${info.projType}-${info.simpleName}-${info.dateCode}`;
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
  const changeSimpleName = (simpleName: string) => {
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
        <span hidden={disabled} className="status-remark">{ info.projType ? status.find(p => p.code === info.projType)?.remark : '' }</span>
        <Input
          key="simpleName"
          addonBefore={'项目缩写'}
          onChange={(e) => changeSimpleName(e.target.value)}
          value={info.simpleName}
          disabled={disabled}
        />
        <Input
          key="dateCode"
          addonBefore={'日期编号'}
          onChange={(e) => changeDateCode(e.target.value)}
          maxLength={4}
          value={info.dateCode}
          disabled={disabled}
        />
        <Input key="preview" disabled addonBefore={'预览'} value={getId()} />
      </Form.Item>
    </Input.Group>
  );
};
export default ProjIdComponent;
