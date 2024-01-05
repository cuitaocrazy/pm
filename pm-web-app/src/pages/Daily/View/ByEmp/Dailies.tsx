import React, { useRef, } from 'react';
import { Timeline, Card, ButtonProps } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import * as R from 'ramda';
import type { EmployeeOfDaily, EmployeeOfDailyItem,ActiveInput } from '@/apollo';
import { isWorkday } from '@/utils/utils';
import { useBaseState } from '@/pages/utils/hook';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import ProjDetail from './ProjDetail';
import type { ProjectInput } from '@/apollo';
import { gql,  } from '@apollo/client';
import { client } from '@/apollo';
import { useProjStatus } from './hook';

type DailiesProps = {
  date: Moment;
  dailies: EmployeeOfDaily[];
  workCalendar: string[];
};
export type Test = {
  id: number;
};
const queryGql = gql`
  query($id: String!){
    findOneProjectById (id: $id) {
      id
        pId
        name
        contName
        customer
        leader
        salesLeader
        projStatus
        contStatus
        acceStatus
        contAmount
        recoAmount
        projBudget
        budgetFee
        budgetCost
        humanFee
        projectFee
        actualCost
        taxAmount
        description
        createDate
        updateTime
        participants
        status
        isArchive
        startTime
        endTime
        estimatedWorkload
        serviceCycle
        productDate
        acceptDate
        freePersonDays
        usedPersonDays
        requiredInspections
        actualInspections
        timeConsuming
        confirmYear
        doYear
        projectClass
        group
        actives {
          name
          recorder
          date
          content
          fileList {
            uid
            name
            url
            status
            thumbUrl
          }
        }
    }
  }
`;
const DailiesPage: React.FC<DailiesProps> = (props) => {
  const { date, dailies, workCalendar } = props;
  const { buildProjName } = useBaseState();
  const detailRef = useRef<FormDialogHandle<ProjectInput>>(null);
  const {  projectAgreements } = useProjStatus();
  const showProDetail = (content: any) => {
    
    client
    .query({
      query: queryGql,
      variables:{id:content.project.id}
    })
    .then((r:any) => {
      const { actives, ...pro } = r.data.findOneProjectById;
      const agree = projectAgreements.filter(item => item.id === r.data.findOneProjectById.id)
      detailRef.current?.showDialog({ 
        ...pro,
        contName: agree.length ? agree[0].agreementId : '', 
        // actives: (actives as ActiveInput[])?.map(item => {
        //   // @ts-ignore
        //   (item as Args).date = moment(item.date)
        //   return item
        // }),
        actives: (actives as ActiveInput[])?.map(item => ({
          ...item,
          date: moment(item.date),
        })),
        // @ts-ignore
        startTime: pro.startTime && moment(pro.startTime),
        // @ts-ignore
        endTime: pro.endTime && moment(pro.endTime),
        // @ts-ignore
        productDate: pro.productDate && moment(pro.productDate),
        // @ts-ignore
        acceptDate: pro.acceptDate && moment(pro.acceptDate),
      });

    });
    
  
  };
  const onCancelButtonProps: ButtonProps = {
    style: { display: 'none' }, // 设置样式让按钮消失
  };
  const getItem = (date: string, projs: EmployeeOfDailyItem[], workCalendar: string[]) => {
    const time = R.reduce((a, b: EmployeeOfDailyItem) => a + b.timeConsuming, 0)(projs);
    if (time && time > 0) {
      return time > 10 ? (
        <Timeline.Item key={date} color="purple">
          <h3>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
          {projs.map((proj) => (
            <Card size="small" bordered={false} key={proj.project.id}>
              <Card.Meta
                title={`${buildProjName(proj.project.id, proj.project.name)}(${
                  proj.timeConsuming
                }h)1`}
                description={<div style={{ whiteSpace: 'pre-wrap' }}>{proj.content}</div>}
              />
            </Card>
          ))}
        </Timeline.Item>
      ) : (
        <Timeline.Item key={date} color="green">
          <h3>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
          {projs.map((proj) => (
            <Card size="small" bordered={false} key={proj.project.id}>
              <Card.Meta
                title={
                  <span
                    onClick={() => showProDetail(proj)}
                    style={{ color: '#1890ff', cursor: 'pointer' }}
                  >{`${buildProjName(proj.project.id, proj.project.name)}(${
                    proj.timeConsuming
                  }h)2`}</span>
                }
                description={<div style={{ whiteSpace: 'pre-wrap' }}>{proj.content}</div>}
              />
            </Card>
          ))}
        </Timeline.Item>
      );
    }
    if (moment(date, 'YYYYMMDD').isSameOrBefore(moment(), 'd') && isWorkday(date, workCalendar))
      return (
        <Timeline.Item key={date} color="red">
          <h3>{moment(date, 'YYYYMMDD').format('YYYY年MM月DD日')}</h3>
        </Timeline.Item>
      );
    return null;
  };

  return R.isEmpty(dailies) ? null : (
    <>
      <Timeline style={{ height: 719, overflow: 'scroll' }}>
        <br />
        {R.range(0, 7)
          .map((i) => moment(date).add(i, 'd').format('YYYYMMDD'))
          .filter((d) => moment(d, 'YYYYMMDD').isSameOrBefore(moment(), 'd'))
          .map((d) =>
            getItem(d, R.find(R.propEq('date', d), dailies)?.dailyItems || [], workCalendar),
          )}
      </Timeline>
      <DialogForm
        cancelButtonProps={onCancelButtonProps}
        ref={detailRef}
        title="项目详情"
        width={1000}
      >
        {ProjDetail}
      </DialogForm>
    </>
  );
};

export default DailiesPage;
