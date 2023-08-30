<template>
  <t-navbar :fixed="false"  title="我的">
  </t-navbar>
  <div class="content">
    <t-cell :title="store.state.currentUser.me.name">
      <template #leftIcon>
        <t-avatar shape="circle" :image="avatarUrl" />
      </template>
      <template #description>
        {{ store.state.currentUser.me.groups.join(',') }}
      </template>
    </t-cell>
    <!-- <t-cell style="margin-top: 5px" title="修改密码" arrow hover /> -->
    <t-cell style="margin-top: 5px" title="退出登录" arrow hover @click="logOut" />
  </div>
  
</template>

<script setup lang="ts">
import { useStore } from 'vuex';
const store = useStore()
const avatarUrl = 'https://tdesign.gtimg.com/mobile/demos/avatar_1.png';

const logOut = () => {
  const logoutURL = new URL('/logout-oidc', window.location.href);
  logoutURL.searchParams.set('redirect_uri', window.location.href);
  window.location.href = logoutURL.href;
};
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
  margin-top: 1px;
  .collapse {
    margin: 0 auto;
    width: 95vw;
    border-radius: 15px;
    overflow: hidden;
    margin-top: 10px;
    .t-collapse-panel {
      ::v-deep .t-cell {
        height: 4.5vh;
        text-align: left;
        .t-cell__title {
          font-size: 14px;
        }
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
      span:nth-child(1) {
        display: inline-block;
        width: 20vw;
      }
      span:nth-child(2) {
        display: inline-block;
        width: 32vw;
      }
    }
  }
}
</style>
