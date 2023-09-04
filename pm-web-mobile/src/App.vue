<template>
  <div>
    <router-view />
    <t-tab-bar v-model="value" theme="tag" :split="false">
      <t-tab-bar-item v-for="item in list" :key="item.value" :value="item.value">
        {{ item.label }}
        <template #icon>
          <t-icon :name="item.icon" />
        </template>
      </t-tab-bar-item>
    </t-tab-bar>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useInitState } from './hook';
useInitState();

const router = useRouter();
const route = useRoute();
const value = ref('dailies');
const list = ref([
  { value: 'dailies', label: '日报', icon: 'calendar' },
  { value: 'project', label: '项目', icon: 'app' },
  { value: 'active', label: '活动', icon: 'chat' },
  { value: 'mine', label: '我的', icon: 'user' },
]);

watch(
  () => route.name,
  (newValue) => {
    // console.log('当前路由为：', newValue);
    value.value = route.name ? (route.name as string) : 'dailies';
  }
);

watch(
  () => value.value,
  (newValue) => {
    router.push(newValue);
  }
);

</script>

<style lang="scss">
html,
body,
#app {
  height: 100%;
  padding: 0;
  margin: 0;
  background-color: #f4f4f4;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  font-size: 16px;
}
ul li {
    list-style: none;
}
nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
.is-holiday:not(.t-calendar__dates-item--selected) {
  // color: #e34d59;
  .t-calendar__dates-item-prefix {
    color: green;
  }
  .t-calendar__dates-item-suffix {
    color: green;
  }
}
</style>
