import React, { createRef, useContext, useEffect, useState } from 'react';
import { Button, DatePicker, Input, message } from 'antd';
import { PageContainer, RouteContext } from '@ant-design/pro-layout';
import * as R from 'ramda';
import moment from 'moment';
import Btn from '../../components/Btn';
import {
  getSelfProjs,
  getSelfLastReport,
  updateSelfReport,
  getSelfReportBy,
  ReportData,
  getDayListOfSelfReportBy,
  Project,
  ReportContent,
} from '../../services/proj_server';
import ProjItem, { ProjItemHandle } from './ProjItem';
import ProjPie from './ProjPie';
import { ProjectReportData, run } from './def';
import StripPercentage from './StripPercentage';

const dateFormat = 'YYYYMMDD';

const newProj = (data: Project) => ({
  id: data.id,
  name: data.name,
  hours: 0,
  contentOfWork: '',
  ref: createRef<ProjItemHandle>(),
});

const convert = (data: ReportContent) => ({
  id: data.projId,
  name: data.projName,
  hours: data.timeConsuming,
  contentOfWork: data.contentOfWork,
  ref: createRef<ProjItemHandle>(),
});

const makeData: (d: ReportData | undefined) => Promise<ProjectReportData[]> = R.ifElse(
  R.equals(undefined),
  () => getSelfProjs().then(R.map(newProj)),
  R.pipe(R.prop('projs'), R.map(convert), (v) => Promise.resolve(v)),
);

function useInit(d: string) {
  const [date, setDate] = useState<string>(d);
  const [data, setData] = useState<ProjectReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('');
  const [canGetOffset, setCanGetOffset] = useState(false);
  const [offset, setOffset] = useState(0);
  const context = useContext(RouteContext);
  const [days, setDays] = useState<string[]>([]);
  const [isNew, setIsNew] = useState<boolean>(true);

  // 加载写过的日报日期
  useEffect(() => {
    getDayListOfSelfReportBy(moment().subtract(2, 'months').format('YYYYMM')).then(setDays);
  }, []);

  // 加载当前日期日报
  useEffect(() => {
    setLoading(true);
    getSelfReportBy(date)
      .then(run(() => setIsNew(d === undefined)))
      .then(makeData)
      .then(setData)
      .then(() => setLoading(false));
  }, [date]);

  // 计算组件渲染完毕的第一个组件的偏移量
  useEffect(() => {
    if (canGetOffset) {
      setOffset((data[0].ref.current?.getOffset() || 0) - (context.headerHeight || 0));
    }
  }, [canGetOffset]);

  // 触发计算偏移量
  useEffect(() => {
    if (data.length > 0) {
      setCanGetOffset(true);
    }
  }, [data]);

  return {
    loading,
    data,
    setData,
    filter,
    setFilter,
    offset,
    setDate,
    days,
    date,
    setDays,
    isNew,
  };
}

function ReportOfDay(props: { date: string | undefined }) {
  const {
    loading,
    data,
    setData,
    filter,
    setFilter,
    offset,
    setDate,
    date,
    days,
    setDays,
    isNew,
  } = useInit(props.date || moment().format(dateFormat));
  const onHoursChange = (id: string) => (h: number) =>
    ((i: number) => setData(R.update(i, { ...data[i], hours: h }, data)))(
      data.findIndex((v) => v.id === id),
    );
  const onContentOfWorkChange = (id: string) => (c: string) =>
    ((i: number) => setData(R.update(i, { ...data[i], contentOfWork: c })))(
      data.findIndex((v) => v.id === id),
    );

  const list = () =>
    data.map((d) => (
      <ProjItem
        key={d.id}
        data={d}
        onHoursChange={onHoursChange(d.id)}
        onContentOfWorkChange={onContentOfWorkChange(d.id)}
        ref={d.ref}
        visible={filter === '' || d.name.indexOf(filter) !== -1}
      />
    ));

  const handleLastReportOfDay = () => {
    getSelfLastReport(date).then((reports) => {
      const newData = data.map((d) => {
        const projectReport = reports.projs.find((p) => p.projId === d.id);
        if (projectReport !== undefined) {
          return {
            ...d,
            hours: projectReport.timeConsuming,
            contentOfWork: projectReport.contentOfWork,
          };
        }
        return { ...d };
      });

      setData(newData);
    });
  };

  const handleSubmit = () => {
    const reportData = {
      date,
      projs: data.map((d) => ({
        projId: d.id,
        projName: d.name,
        timeConsuming: d.hours,
        contentOfWork: d.contentOfWork,
      })),
    };
    return updateSelfReport(reportData).then(() => {
      setDays([...days, date]);
      message.success(`提交成功`);
    });
  };

  return (
    <PageContainer
      loading={loading}
      extra={[
        <DatePicker
          key="date"
          value={moment(date, dateFormat)}
          onChange={(d) => d && setDate(d.format(dateFormat))}
          dateRender={(current) => {
            const style: React.CSSProperties = {};
            if (days.includes(current.format(dateFormat))) {
              style.border = '1px solid #1890ff';
              style.borderRadius = '50%';
            }
            return (
              <div className="ant-picker-cell-inner" style={style}>
                {current.date()}
              </div>
            );
          }}
        />,
        <Input
          key="search"
          style={{ width: 200 }}
          addonBefore="检索"
          allowClear
          onChange={(e) => setFilter(e.target.value)}
        />,
      ]}
      content={
        <div style={{ marginLeft: -24, marginRight: -24, marginBottom: -16 }}>
          <StripPercentage
            data={data}
            gotoAnchor={(id) => data.find((d) => d.id === id)?.ref.current?.gotoAnchor(offset)}
          />
        </div>
      }
      footer={[
        <Button key="getLastHandle" onClick={handleLastReportOfDay}>
          加载上次日报
        </Button>,
        <Btn
          key="submit"
          type="primary"
          effect={handleSubmit}
          disabled={!R.any((e) => e.hours !== 0, data)}
        >
          {isNew ? '创建' : '更新'}
        </Btn>,
      ]}
      fixedHeader
    >
      {list()}
      <ProjPie data={data} />
    </PageContainer>
  );
}

export default ReportOfDay;
