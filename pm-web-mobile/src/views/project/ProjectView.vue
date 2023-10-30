<template>
  <div>
    <t-navbar :fixed="false">
      <template #left>
        <t-image class="logo" :src="logo" />
      </template>
      <template #title>
        <t-tabs default-value="2" :value="tabValue" @change="tabChange" theme="tag">
          <t-tab-panel value="2" label="项目" />
          <t-tab-panel value="1" label="待办" />
        </t-tabs>
      </template>
    </t-navbar>
    <div class="content">
      <div>
        <t-dropdown-menu>
          <t-dropdown-item :options="customOptions" :value="filter.customerId" @change="onChangeCustomer" />
          <!-- <t-dropdown-item :options="orgOptions" :value="filter.org" @change="onChangeOrg" />
          <t-dropdown-item :options="projTypeOptions" :value="filter.projType" @change="onChangeProjType" /> -->
        </t-dropdown-menu>
      </div>
      <t-loading v-if="loading" theme="dots" size="40px" />
      <div v-else>
        <t-cell
          class="proj-cell"
          v-for="(projArr, key) in showProjs"
          :key="projArr[0].key"
          :title="key">
          <template #description>
            <t-collapse class="collapse" v-for="proj in projArr" :key="proj.key" :defaultExpandAll="false">
              <t-collapse-panel value="0">
                <template #header>
                  {{ buildProjName(proj.id, proj.name) }}
                  <t-tag v-if="proj.status === 'onProj'" variant="light" theme="success">启动</t-tag>
                  <t-tag v-else-if="proj.status === 'endProj'" variant="light">关闭</t-tag>
                  <t-tag v-else variant="light" theme="warning">未启动</t-tag>
                </template>
                <template #headerRightContent>
                </template>
                <div class="proj-content">
                  <t-tag v-if="proj.todoTip" variant="light" theme="warning">{{ proj.todoTip }}</t-tag>
                  <ul>
                    <li>
                      <span>项目ID:</span><span style="width: auto">{{ proj.id }}</span>
                    </li>
                    <li>
                      <span>项目负责人:</span><span>{{ subordinates.find((user) => user.id === proj.leader)?.name }}</span>
                      <span>市场负责人:</span><span>{{ subordinates.find((user) => user.id === proj.salesLeader)?.name }}</span>
                    </li>
                    <li>
                      <span>参与人员:</span><span style="width: auto">{{ proj.participants.map(item => {
                        return  subordinates.find((user) => user.id === item)?.name
                      }).join(',')}}</span>
                    </li>
                    <li>
                      <span>项目状态:</span><span>{{ status.find((stu:any) => stu.id === proj.projStatus)?.name }}</span>
                      <span>验收状态:</span><span>{{ status.find((stu:any) => stu.id === proj.acceStatus)?.name }}</span>
                    </li>
                    <li>
                      <span>合同状态:</span><span>{{ status.find((stu:any) => stu.id === proj.contStatus)?.name }}</span>
                      <span>合同金额:</span><span>{{ proj.contAmount }}</span>
                    </li>
                    <li>
                      <span>确认金额:</span><span>{{ proj.recoAmount }}</span>
                      <span>税后金额:</span><span>{{ proj.taxAmount }}</span>
                    </li>
                    <li>
                      <span>启动日期:</span><span>{{ proj.startTime ? moment(proj.startTime).format('YYYY-MM-DD') : '' }}</span>
                      <span>关闭日期:</span><span>{{ proj.endTime ? moment(proj.endTime).format('YYYY-MM-DD') : '' }}</span>
                    </li>
                  </ul>
                  <div class="btn-sty">
                    <t-button size="small" theme="light" @click="handleOnView(proj)">查看详情</t-button>
                  </div>
                </div>
              </t-collapse-panel>
            </t-collapse>
          </template>
        </t-cell>
      </div>
    </div>
    <ProjectInfo
      v-model="projVisible"
      :proj="showProj"
      :subordinates="subordinates"
      :status="status"
      :otherData="otherData"
    >
    </ProjectInfo>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue';
import { buildProjName } from '@/utils';
import logo from '@/assets/logo.jpg';
import moment from 'moment';
import { useProjectState } from './hook';
import ProjectInfo from '@/components/ProjectInfo.vue';

const { loading, filter, showProjs, subordinates, tabValue, otherData, customers } = useProjectState();
const status = JSON.parse(localStorage.getItem('status') || '[]')
const industries = JSON.parse(localStorage.getItem('industries') || '[]')

const projVisible = ref(false)
let showProj = reactive({})

const tabChange = (item: string) => {
  tabValue.value = item
}
const handleOnView = (proj: any) => {
  showProj = proj
  projVisible.value = true
}

// 筛选条件
const customOptions = computed(() => {
  let tempOpt = customers.value.map(c => { return { value: c.id, label: c.name } })
  tempOpt.unshift({value: '', label: '请选择客户' })
  return tempOpt
})

const onChangeCustomer = (e: any) => {
  filter.customerId = e
}
// const orgOptions = industries.map(item => {
//   return {
//     value: item.code,
//     label: item.name,
//   }
// })
// orgOptions.unshift({value: '', label: '默认行业' })
// const projTypeOptions = status.filter(item => item.pId === '0').map(item => {
//   return {
//     value: item.code,
//     label: item.name,
//   }
// })
// projTypeOptions.unshift({value: '', label: '默认类型' })

// const onChangeOrg = (e: any) => {
//   filter.org = e
// }
// const onChangeProjType = (e: any) => {
//   filter.projType = e
// }

</script>

<style scoped lang="scss">
.logo {
  width: 10vw;
  height: 10vw;
}
::v-deep.t-loading {
  .t-loading__dots {
    margin: 0 auto;
  }
}
.date-cell {
  text-align: left;
}
.content {
  height: 80vh;
  overflow: auto;
  padding-bottom: 5vh;
  // background-color: red;
  .proj-cell {
    width: 95vw;
    margin: 5px auto;
    border-radius: 15px;
  }
  .t-dropdown-menu {
    height: 35px;
    .t-dropdown-item {
      top: 100px;
      ::v-deep .t-dropdown-item__popup-host {
        .t-radio--block {
          padding-top: 7px;
          padding-bottom: 7px;
          font-size: 12px;
        }
      }
    }
  }
  .collapse {
    margin: 0 auto;
    width: 85vw;
    border-radius: 15px;
    overflow: hidden;
    margin-top: 10px;
    .t-collapse-panel--active {
      height: auto;
    }
    .t-collapse-panel {
      ::v-deep .t-cell {
        padding: 5px 16px;
        text-align: left;
        .t-cell__title {
          font-size: 14px;
        }
      }
      ::v-deep .t-collapse-panel__content {
        padding: 5px 0;
      }
    }
  }
}
.proj-content {
  text-align: left;
  font-size: 12px;
  ul {
    padding: 0;
    li {
      min-height: 3vh;
      line-height: 3vh;
      span:nth-child(1) {
        display: inline-block;
        width: 20vw;
      }
      span:nth-child(2) {
        display: inline-block;
        width: 28vw;
      }
      span:nth-child(3) {
        display: inline-block;
        width: 19vw;
      }
    }
  }
}
.btn-sty {
  text-align: center;
  button {
    margin: 0 20px;
  }
}
</style>
