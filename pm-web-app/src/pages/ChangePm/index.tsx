import React, { useRef,useState } from 'react';
import { PageContainer } from '@ant-design/pro-layout';
import ChangePmForm from './ChangePmForm'
import { ApolloProvider } from '@apollo/client';
import { client } from '@/apollo';
import { Button,Table,message } from 'antd';
import { ChangePmInput } from '@/apollo';
import type { FormDialogHandle } from '@/components/DialogForm';
import DialogForm from '@/components/DialogForm';
import { useChangePmState } from './hook';



const ChangePm: React.FC<{}> =  () => {
    const ref = useRef<FormDialogHandle<ChangePmInput>>(null);
   const state = useChangePmState();
   const [isRemovePart,setReomvePart] = useState<boolean>(true);
   const [selectProject,setSelectProject] = useState<string[]>([]);


   const onFinish = (value: ChangePmInput)=>{
     return state.pushChangePm({...value,...{projIds:selectProject}})
   }
   const users = state?.users || [];
   const projs = state?.projs || [];


   const columns = [
     {
       title: 'id',
       dataIndex: 'id',
       colSpan:0,
       render:()=>{
           return  {
           children: null,
           props: {colSpan:0},
         };
       }
     },
     {
       title: '项目名称',
       dataIndex: 'name',
     },
     {
       title: '当前项目经理',
       dataIndex: 'leader',
       render:(leader:string)=>{
           return users.filter(user=>user.id===leader)[0].name
       }
     },
     
   ];

   const rowSelection = {
     onChange: (selectedRowKeys: any[]) => {
       setSelectProject(selectedRowKeys);
     },
   };
 return (

   <PageContainer
   extra={[
     <Button key="modify" type="primary" onClick={() => 
          {
            if(selectProject.length===0){
              message.success("修改项目经理需要选择项目");
            }
            else{
              ref.current!.showDialog()}
            }
          
          }>  
         修改
       </Button>
   ]}
 >


     
   <Table 
   dataSource={projs} 
   columns={columns} 
   rowKey="id"
   rowSelection={rowSelection}

   /> 
   <DialogForm submitHandle={onFinish}  ref={ref} title="选择新的项目经理" >
    {ChangePmForm(users,isRemovePart,setReomvePart)}
   </DialogForm>
</PageContainer>
   

 );
};




export default () => (
  <ApolloProvider client={client}>
    <ChangePm />
  </ApolloProvider>
);