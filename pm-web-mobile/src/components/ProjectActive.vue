<template>
  <t-popup placement="center"  @visible-change="visibleChange">
    <div style="height: 80vh; width: 90vw;">
      <div class="header">
        <div>{{ projectTypeStr(proj) === 'SQ' ? '添加售前活动' : projectTypeStr(proj) === 'SH' ? '添加巡检活动' : '添加项目活动'}}</div>
      </div>
      <div class="proj-Info">
        <t-form
          ref="form"
          :data="formData"
          :rules="rules"
          reset-type="empty"
          show-error-message
          label-align="left"
          @reset="onReset"
          @submit="onSubmit"
        >
          <t-form-item arrow label="录入人" name="recorder" style="height: 1px; padding: 0; overflow: hidden;">
            <t-input
              v-model="formData.recorder"
              borderless
              align="left"
              placeholder="请输入录入人"
              readonly
            ></t-input>
          </t-form-item>
          <t-form-item arrow label="活动日期" name="date" requiredMark>
            <t-input
              v-model="formData.date"
              borderless
              align="left"
              placeholder="请输入日期"
              @click="visible = true"
            ></t-input>
            <t-popup v-model="visible" placement="bottom">
              <t-date-time-picker
                :value="formData.date"
                mode="minute"
                title="选择日期"
                format="YYYY-MM-DD HH:mm:ss"
                @change="onChange"
                @pick="onPick"
                @confirm="onConfirm"
                @cancel="onCancel"
              />
            </t-popup>
          </t-form-item>
          <t-form-item label="活动内容" name="content" requiredMark>
            <t-textarea
              v-model="formData.content"
              class="textarea"
              indicator
              autosize
              :maxlength="50"
              placeholder="需包含：时间--地点--人物---事件"
            ></t-textarea>
          </t-form-item>
          <t-form-item label="上传材料" name="fileList">
            <t-upload
              v-model="formData.fileList"
              multiple
              :max="8"
              :action="action"
              :on-fail="onFail"
              :on-progress="onProgress"
              :on-change="onChangeUpload"
              :on-preview="onPreview"
              :on-success="onSuccess"
              :on-remove="onRemove"
              :on-select-change="onSelectChange"
            >
            </t-upload>
          </t-form-item>
          <div class="button-group">
            <t-button theme="primary" type="submit" size="large">提交</t-button>
          </div>
        </t-form>
      </div>
    </div>
    <!-- <t-image-viewer :images="viewImages" :visible="viewVisible" @close="viewVisible = false" /> -->
  </t-popup>
</template>

<script lang="ts" setup>
import {
  UploadChangeContext,
  UploadFile,
  UploadRemoveContext,
  SuccessContext,
  ProgressContext,
} from '../../node_modules/tdesign-mobile-vue/lib/upload/type';
import { ref, watch, reactive, onMounted } from 'vue';
import { useStore } from 'vuex';
import { projectTypeStr } from '@/utils';
import moment from 'moment';
const store = useStore()

const props = defineProps({
    proj: Object,
})
let proj = {}

watch([props], ([props]) => {
  // console.log(props)
  proj = JSON.parse(JSON.stringify(props.proj || '{}')) || {}
})


// fileList
const files = ref([]);
const action = '/api/upload/tmp';
const onFail = ({ file, e }: { file: UploadFile; e: ProgressEvent }) => {
  // console.log('---onFail', file, e);
  return null;
};
const onProgress = ({ file, percent, type, e }: ProgressContext) => {
  // console.log('---onProgress:', file, percent, type, e);
};
const onChangeUpload = (files: Array<UploadFile>, { e, response, trigger, index, file }: UploadChangeContext) => {
  // console.log('====onChange', files, e, response, trigger, index, file);
};
const onPreview = ({ file, e }: { file: UploadFile; e: MouseEvent }) => {
  // console.log('====onPreview', file, e);
};
const onSuccess = ({ file, fileList, response }: SuccessContext) => {
  // console.log('====onSuccess', file, fileList, response);
  formData.fileList = fileList.map((item, index) => {
    item.uid = 'wx-upload-'+ item.lastModified + '-' + index
    item.originFileObj = item.raw
    item.url = item.response.data
    return item
  })
};
const onRemove = ({ index, file, e }: UploadRemoveContext) => {
  // console.log('====onRemove', index, file, e);

};
const onSelectChange = (files: Array<UploadFile>) => {
  // console.log('====onSelectChange', files);
};

const formData = reactive({
  recorder: '',
  date: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  content: '',
  fileList: files,
});
const form = ref(null);
// date
const visible = ref(false);
const onChange = (value: string) => {
  // console.log('change: ', value);
};
const onPick = (value: string) => {
  // console.log('pick: ', value);
};
const onCancel = () => {
  visible.value = false;
};
const onConfirm = (value: string) => {
  visible.value = false;
  formData.date = value
};

// form
const onReset = () => {
  // console.log('===onReset');
};

const emits = defineEmits(['submit'])
const onSubmit = (e: any) => {
  // console.log('===onSubmit', e);
  if (!e.validateResult.content) {
    emits('submit', formData)
  }
};
const rules = {
  date: [{ validator: (val: any) => val !== '', message: '不能为空' }],
  content: [{ validator: (val: any) => val !== '', message: '不能为空' }],
};

const visibleChange = () => {
  formData.recorder = store.state.currentUser.me.id
  formData.date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
  formData.content = '';
  formData.fileList = []
}

onMounted(() => {
  // @ts-ignore 初始化
  form.value.setValidateMessage(rules);
});

</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.header {
  display: flex;
  align-items: center;
  height: 4vh;
  padding: 1.5vh 0;
  text-align: center;
  justify-content: space-around;
  border-bottom: 1px solid #f4f4f4;
  text-align: center;
}
.proj-Info {
  text-align: left;
  font-size: 14px;
  height: 70vh;
  overflow-y: auto;
  overflow-x: hidden;
  flex-wrap: wrap;
  ::v-deep .t-form__item {
    .t-form__label {
      width: 25vw !important;
    }
  }

  .t-upload {
    display: flex;
    flex-wrap: wrap;
  }
  .button-group {
    text-align: center;
    margin-top: 20px;
    button {
      width: 80vw;
    }
  }
}


</style>
