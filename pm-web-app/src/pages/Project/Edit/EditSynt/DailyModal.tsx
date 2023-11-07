import React, { useState } from 'react';
import { Card, Statistic, Tag, Row, Col} from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { Project, Query, QueryProjDailyArgs } from '@/apollo';
import { gql, useQuery } from '@apollo/client';
import type { FormInstance } from 'antd/lib/form';
import moment from 'moment';


const QueryDaily = gql`
  query GetDaily($projId: String!) {
    allProjDaily(projId: $projId) {
      project {
        id
      }
      dailies {
        date
        dailyItems {
          employee {
            id
            name
          }
          timeConsuming
          content
        }
      }
    }
  }
`;


export default (form: FormInstance<Project>, data?: Project) => {
  const { data: queryData } = useQuery<Query, QueryProjDailyArgs >(QueryDaily, { fetchPolicy: 'no-cache', variables: {
    projId: data?.id || '',
  } });

  let dailies:any = [];
  let projAllTime = 0
  const developer = new Map();
 
  if (queryData && queryData.allProjDaily.dailies.length) {
    dailies = queryData.allProjDaily.dailies
    queryData.allProjDaily.dailies.forEach(item => {
      item.dailyItems.forEach(chItem => {
        projAllTime = projAllTime + chItem.timeConsuming
        developer.set(chItem.employee.id, chItem.employee.name)
      })
    })
  }
  
  return (
    <div>
      <Row>
        <Col xs={2} sm={2}></Col>
        <Col xs={10} sm={10}>
          <Card>
            <Statistic title="项目总参与人" value={developer.size} suffix="人" />
          </Card>
        </Col>
        <Col xs={10} sm={10}>
          <Card>
            <Statistic title="项目总工时" value={projAllTime} suffix="h" />
          </Card>
        </Col>
        <Col xs={2} sm={2}></Col>
      </Row>
      <div style={{ overflowX: 'auto', display: 'flex', margin: '10px 20px' }}>
        {
          dailies.map((d: any) => <div>
            <Card key={d.date} title={<Tag color="blue">{moment(d.date).format('YYYY年MM月DD日')}</Tag>} style={{ width: '15vw' }}>
              {
                d.dailyItems.map((i: any) => <Card key={i.employee.name}>
                  <p style={{ fontWeight: 'bold' }}>{i.employee.name}({i.timeConsuming}h)</p>
                  <p>{i.content}</p>
                </Card>)
              } 
            </Card>
        </div>)
        }
      </div>
    </div>
  );
};
