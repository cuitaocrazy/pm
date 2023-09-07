<template>
  <t-navbar :fixed="false" @left-click="visible = true">
    <template #left>
      <t-image class="logo" :src="logo" />
      <t-icon name="calendar" size="24px" />
      {{ moment(selectDate).format('YYYY-MM-DD') }}
    </template>
    <template #right>
      <t-icon name="save" size="24px" @click="handleOnSave" />
    </template>
  </t-navbar>
  <div class="content">
    <t-loading v-if="loading" theme="dots" size="40px" />
    <div v-else>
      <t-collapse class="collapse" v-for="proj in dailyProjects" :key="proj.key" :defaultExpandAll="false">
        <t-collapse-panel value="0">
          <template #header>
            {{ buildProjName(proj.id, proj.name) }}
            <t-tag v-if="proj.status === 'endProj'" variant="light" theme="warning">已结项</t-tag>
            <t-tag v-else-if="proj.participants.includes(store.state.currentUser.me.id)" variant="light" theme="success">涉及</t-tag>
            <t-tag v-else-if="!proj.participants.includes(store.state.currentUser.me.id)" variant="light">未涉及</t-tag>
          </template>
          <template #headerRightContent>
            <t-tag v-if="proj.dailyItem.timeConsuming" variant="light" theme="primary">{{ proj.dailyItem.timeConsuming / 10 + 'h' }}</t-tag>
          </template>
          <div>
            <t-slider :value="proj.dailyItem?.timeConsuming" :marks="marks" @change="(value: any) => sliderChange(value, proj)"/>
            <t-textarea class="textarea" :value="proj.dailyItem?.content" placeholder="请输入工作内容" autosize bordered @change="(value: any) => textChange(value, proj)" />
          </div>
        </t-collapse-panel>
      </t-collapse>
    </div>
  </div>
  <t-calendar
    class="calendar-sty"
    v-model:visible="visible"
    :defaultValue="selectDate"
    :value="selectDate"
    :format="format"
    :min-date="minDate"
    :max-date="maxDate"
    @confirm="handleConfirm"
  />
</template>

<script setup lang="ts">
 // @ts-ignore 引入Message组件
import { Message } from 'tdesign-mobile-vue';
import type { EmployeeOfDaily } from '@/apollo';
import { ref, nextTick, watch } from 'vue';
import { buildProjName } from '@/utils';
import moment from 'moment';
import logo from '@/assets/logo.jpg';
import { useStore } from 'vuex';

const store = useStore()
type TDateType = 'selected' | 'disabled' | 'start' | 'centre' | 'end' | '';
interface TDate {
  date: Date;
  day: string;
  type: TDateType;
  className?: string;
  prefix?: string;
  suffix?: string;
}
import { useProjectState } from './hook';
const { loading, dailies, selectDate, dailyProjects, saveDailies } = useProjectState();
const visible = ref(false);
const tempDate = new Date();
const minDate = new Date(tempDate.setMonth(tempDate.getMonth() - 3));
const maxDate = new Date();
const marks = ref({
  0: '0h',
  10: '1h',
  20: '2h',
  30: '3h',
  40: '4h',
  50: '5h',
  60: '6h',
  70: '7h',
  80: '8h',
  90: '9h',
  100: '10h',
});

watch([visible], ([visible]) => {
  if (visible) {
    nextTick(()=>{
      const calendarDoc = document.getElementsByClassName('t-calendar__months')
      calendarDoc[0].scrollTo({top: calendarDoc[0].scrollHeight })
    })
  }
})

const sliderChange = (value: any, proj: any) => {
  proj.dailyItem.timeConsuming = Math.round(value / 10) * 10
}

const textChange = (value: any, proj: any) => {
  proj.dailyItem.content = value
}

const handleConfirm = (val: Date) => {
  if (val != selectDate.value) {
    selectDate.value = val;
    loading.value = true
  }
};

const format = (day: TDate) => {
  const { date } = day;
  const dateStr = moment(date).format('YYYYMMDD');
  (dailies.value || []).forEach((da: EmployeeOfDaily) => {
    if (da.date === dateStr) {
      day.prefix = '已填写';
      day.suffix =
        da.dailyItems.reduce((pre, cur) => pre + cur.timeConsuming, 0) + 'h';
    } else {
      day.className = 'is-holiday';
    }
  });
  return day;
};

const handleOnSave = () => {
  saveDailies().then(res => {
    showMessage('success', '保存成功')
  }).catch(error => {
    showMessage('warning', error)
  })
}

const showMessage = (theme: string, content = '这是一条普通通知信息', duration = 3000) => {
  if (Message[theme]) {
    Message[theme]({
      context: document.querySelector('.content'),
      offset: [10, 16],
      content,
      duration,
      icon: true,
      zIndex: 20000,
    });
  }
};


</script>

<style scoped lang="scss">
.logo {
  width: 10vw;
  height: 10vw;
  margin-right: 10px;
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
  .collapse {
    margin: 0 auto;
    width: 95vw;
    border-radius: 15px;
    overflow: hidden;
    margin-top: 10px;
    .t-collapse-panel {
      ::v-deep .t-cell {
        padding: 5px 16px;
        text-align: left;
        .t-cell__title {
          font-size: 14px;
        }
      }
    }
    .t-collapse-panel--active {
      height: auto !important;
    }
  }
}
.textarea {
  padding-top: 12px;
  padding-bottom: 12px;
  margin-top: 1vh;
}

</style>
