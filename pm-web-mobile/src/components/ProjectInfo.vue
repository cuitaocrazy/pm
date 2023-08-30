<template>
  <t-popup placement="center" @visible-change="visibleChange">
    <div style="height: 80vh; width: 90vw;">
      <div class="header" v-if="proj">
        <t-tag size="extra-large" variant="light" :theme="tabValue === '1' ? 'primary' : 'default'" @click="tabChange('1')">项目详情</t-tag>
        <t-tag :key="proj.id" size="extra-large" variant="light" :theme="tabValue === '2' ? 'primary' : 'default'" @click="tabChange('2')">
          {{ projectTypeStr(proj) === 'SQ' ? '售前活动' : projectTypeStr(proj) === 'SH' ? '巡检活动' : '项目活动'}}
        </t-tag>
      </div>
      <div class="proj-Info">
        <ul v-if="proj && tabValue === '1'">
          <li>
            <span>项目ID:</span><span style="width: auto;">{{ proj.id }}</span>
          </li>
          <li>
            <span>项目名称:</span><span style="width: auto;">{{ buildProjName(proj.id, proj.name) }}</span>
          </li>
          <li>
            <span>项目负责人:</span><span>{{ subordinates?.find((user:any) => user.id === proj.leader)?.name }}</span>
            <span>市场负责人:</span><span>{{ subordinates?.find((user:any) => user.id === proj.salesLeader)?.name }}</span>
          </li>
          <li>
            <span>参与人员:</span><span style="width: auto">{{ proj.participants.map((item: any) => {
              return subordinates?.find((user: any) => user.id === item)?.name
            }).join(',')}}</span>
          </li>
          <li>
            <span>客户名称:</span><span>{{ customerObj?.name }}</span>
            <span>合同名称:</span><span>{{ agreementName }}</span>
          </li>
          <li v-for="conta in customerObj.contacts" :key="conta.id" style="display: flex;">
            <span>客户联系人:</span><span>{{ conta.name }}</span>
            <span>联系电话:</span>
            <span v-if="isManager">{{ conta.phone }}</span>
            <span v-else>*********</span>
          </li>
          <li>
            <span>项目状态:</span><span>{{ status?.find((stu:any) => stu.id === proj.projStatus)?.name }}</span>
            <span>验收状态:</span><span>{{ status?.find((stu:any) => stu.id === proj.acceStatus)?.name }}</span>
          </li>
          <li>
            <span>合同状态:</span><span>{{ status?.find((stu:any) => stu.id === proj.contStatus)?.name }}</span>
            <span>合同金额:</span><span>{{ proj.contAmount }}</span>
          </li>
          <li>
            <span>启动日期:</span><span>{{ proj.startTime ? moment(proj.startTime).format('YYYY-MM-DD') : '' }}</span>
            <span>关闭日期:</span><span>{{ proj.endTime ? moment(proj.endTime).format('YYYY-MM-DD') : '' }}</span>
          </li>
          <li>
            <span>确认金额:</span><span>{{ proj.recoAmount }}</span>
            <span>税后金额:</span><span>{{ proj.taxAmount }}</span>
          </li>
          <li>
            <span>项目预算:</span><span>{{ proj.projBudget }}</span>
            <span>预算费用:</span><span>{{ proj.budgetFee }}</span>
          </li>
          <li>
            <span>实际费用:</span><span>{{ proj.actualFee }}</span>
            <span>预算成本:</span><span>{{ proj.budgetCost }}</span>
          </li>
          <li>
            <span>实际成本:</span><span>{{ proj.actualCost }}</span>
            <span>预估工作量:</span><span>{{ proj.estimatedWorkload }}</span>
          </li>
          <li v-if="projType === 'SZ'">
            <span>投产日期:</span><span>{{ proj.productDate ? moment(proj.productDate).format('YYYY-MM-DD') : '' }}</span>
            <span>验收日期:</span><span>{{ proj.acceptDate ? moment(proj.acceptDate).format('YYYY-MM-DD') : '' }}</span>
          </li>
          <li  v-if="projType === 'SZ'">
            <span>免费维护期:</span><span>{{ proj.serviceCycle || 0 }} 月</span>
          </li>
          <li v-if="projType === 'SH'">
            <span>免费人天数:</span><span>{{ proj.freePersonDays }}</span>
            <span>已用人天数:</span><span>{{ proj.usedPersonDays }}</span>
          </li>
          <li v-if="projType === 'SH'">
            <span>要求巡检数:</span><span>{{ proj.requiredInspections }}</span>
            <span>实际巡检数:</span><span>{{ proj.actualInspections }}</span>
          </li>
          <li v-if="projType === 'SH'">
            <span>服务周期:</span><span>{{ proj.serviceCycle }} 月</span>
          </li>
          <li>
            <span>项目描述:</span><span style="width: auto">{{ proj.description }}</span>
          </li>
        </ul>
        <ul v-else>
          <div class="steps-vertical-demo-block" v-if="proj?.actives?.length">
            <t-steps layout="vertical" :current="proj?.actives?.length" theme="dot">
              <t-step-item
                v-for="(_, index) in reverseArr(proj?.actives)"
                :key="index"
                :title="moment(_.date).format('YYYY-MM-DD HH:mm:ss')"
                :content="_.content"
              >
                <template v-if="_.fileList?.length" #extra>
                  <t-divider />
                  <div
                    class="link-div"
                    v-for="file in _.fileList"
                    :key="file.uid"
                    theme="primary"
                    :href="file.url"
                    @click="handleOnPreview(file)"
                  >{{ file.name }}</div>
                  <t-divider />
                </template>
              </t-step-item>
            </t-steps>
          </div>
          <div v-else style="text-align: center;">暂无项目活动</div>
        </ul>
      </div>
    </div>
    <!-- <t-popup v-model="viewVisible" placement="center" style="width: 240px; height: 240px">
      <div class="preview-pop">
        <img :src="viewImages[0]" alt="">
      </div>
      <t-icon class="close-btn" name="close-circle" size="32" color="#fff" @click="viewVisible = false" />
    </t-popup> -->
    <t-image-viewer :images="viewImages" :visible="viewVisible" @close="viewVisible = false" />
  </t-popup>
</template>

<script lang="ts" setup>
import type { Project } from '@/apollo';
import { ref, watch, computed } from 'vue';
import { buildProjName, projectTypeStr } from '@/utils';
import moment from 'moment';
import { useStore } from 'vuex';

const store = useStore()
const props = defineProps({
    proj: Object,
    subordinates: Array,
    status: Array,
    otherData: Object,
})
let proj: Project = undefined
let subordinates: any = []
let status: any = []
let projType = ''

watch([props], ([props]) => {
  // console.log(props)
  proj = JSON.parse(JSON.stringify(props.proj || '{}'));
  subordinates = props.subordinates || []
  status = props.status || []
  const reg = /^(?<org>\w*)-(?<zone>\w*)-(?<projType>\w*)-(?<simpleName>\w*)-(?<dateCode>\d*)$/;
   // @ts-ignore 对象没有id
  projType = reg.exec(proj?.id || '')?.groups?.projType;
})

const tabValue = ref('1')
const tabChange = (item: string) => {
  tabValue.value = item
}

const reverseArr = (arr = []) => {
  let tempArr: any[] = []
  for (let i = arr.length - 1; i >= 0; i--) {
    tempArr.push(arr[i])
  }
  return tempArr;
}

const viewVisible = ref(false)
const viewImages = ref<string[]>([])
const handleOnPreview = (file: any) => {
  console.log(file)
  const fileType = file.name.split('.').slice(-1)[0]
  if (['png', 'jpeg', 'gif', 'svg', 'jpg'].includes(fileType)) {
    viewImages.value = [file.url]
    viewVisible.value = true
  } else {
    window.open(file.url || file.response.data, "_blank");
  }
}

const visibleChange = (visible) => {
  if (!visible) {
    tabValue.value = '1'
  }
}

const agreementName = computed(()=> {
  const projectAgreements = props.otherData.projectAgreements
  const agreements = props.otherData.agreements
  const agreId = projectAgreements.find(item => item.id === proj.id)?.agreementId
  return agreements.find(item => item.id === agreId)?.name || ''
})

const customerObj = computed(()=> {
  const customers = props.otherData.customers
  return customers.find(item => item.id === proj.customer) || {} 
})

const isManager = computed(()=> {
  const mangagerArr = ["realm:group_leader", "realm:project_manager", "realm:supervisor"]
  const access =  store.state.currentUser.me.access
  return access.filter(item => mangagerArr.find(chItem => chItem === item)).length ? true : false
}) 

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  height: 4vh;
  padding: 1.5vh 0;
  text-align: center;
  justify-content: space-evenly;
  border-bottom: 1px solid #f4f4f4;
}
.tab-sty {
  min-width: 100vw
}
.proj-Info {
  text-align: left;
  font-size: 14px;
  padding: 0 10px;
  height: 70vh;
  overflow-y: auto;
  ul {
    padding: 0;
    li {
      height: 3vh;
      line-height: 3vh;
      span {
        vertical-align: top;
      }
      span:nth-child(1) {
        display: inline-block;
        width: 17.5vw;
        font-weight: 400;
        font-size: 12px;
      }
      span:nth-child(2) {
        display: inline-block;
        width: 28vw;
        font-weight: 600;
        font-size: 13px;
      }
      span:nth-child(3) {
        display: inline-block;
        width: 17.5vw;
        font-size: 12px;
      }
      span:nth-child(4) {
        display: inline-block;
        font-weight: 600;
        font-size: 13px;
      }
    }
  }
}
.preview-pop {
  width: 90vw;
  img {
    width: 100%;
  }
}
.steps-vertical-demo-block {
  ::v-deep .t-step-item__extra {
    text-align: left;
  }
  .t-image {
    display: inline-block;
  }
  ::v-deep .t-step-item {
    .t-step-item__description {
      max-width: 70vw;
      word-wrap: break-word;
    }
  }
  .link-div {
    color: #0052d9;
    font-size: 12px;
  }
}
.t-image-viewer {
  ::v-deep  .t-image-viewer__content {
    top: 60%;
    .t-swiper__container {
      height: 80vh !important;
      width: 90vw;
      .t-image-viewer__swiper-item {
        align-items: start;
      }
      .t-image {
        height: 70vh;
        width: 100%;
        text-align: center;
        line-height: 70vh;
      }
      .t-image__img {
        max-width: 100%;
        max-height: 100%;
        width: auto;
        height: auto;
      }
    }
  }
  ::v-deep 
  .t-image__img {
    height: 100%;
  }
}


</style>
