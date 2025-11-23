<template>
  <view
    class="qz-nav-bar"
    :style="{ height: navBarHeight + 'px', background: bgColor }"
  >
    <!-- 透明色 -->
    <uv-navbar :title="title" bg-color="rgba(0,0,0,0)">
      <template v-slot:left>
        <view class="uv-nav-slot" v-if="isShowBack || isShowHome">
          <uv-icon
            name="arrow-left"
            size="19"
            color="#333"
            @click="goBack"
            v-if="isShowBack"
          ></uv-icon>
          <uv-line
            direction="column"
            :hairline="false"
            length="16"
            margin="0 8px"
            color="#ccc"
            v-if="isShowBack && isShowHome"
          ></uv-line>
          <uv-icon
            name="home"
            size="20"
            color="#333"
            @click="goHome"
            v-if="isShowHome"
          ></uv-icon>
        </view>
      </template>
      <template v-slot:center>
        <view class="center-box">
          <text class="name">{{ porop.title }}</text>
          <view class="desc-box" v-if="isShowTitleDescBox">
            <text class="status">已接诊</text>
            <text class="type">图文问诊</text>
          </view>
        </view>
      </template>
    </uv-navbar>
  </view>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { useUserStore, useIndexStore } from '@/store/index'
import { storeToRefs } from 'pinia'
const { navBarHeight } = storeToRefs(useIndexStore())

const porop = defineProps({
  title: {
    // 导航栏标题
    type: String,
    default: '导航栏',
  },
  bgColor: {
    // 导航栏背景色
    type: String,
    default: 'linear-gradient(to bottom, #ffe6cc, #f7f7f7)', // 默认透明色
  },
  isShowBack: {
    // 是否显示返回按钮
    type: Boolean,
    default: true, // 默认显示
  },
  isShowHome: {
    // 是否显示首页按钮
    type: Boolean,
    default: true, // 默认显示
  },
  isShowTitleDescBox: {
    // 是否显示副标题内容
    type: Boolean,
    default: false, // 默认不显示
  },
})
const navBar = ref(null) // 导航栏的引用

/**
 * 返回上一页
 * */
const goBack = () => {
  uni.navigateBack() // 返回上一页
}
/**
 * 跳转到在线问诊首页
 * */
const goHome = () => {
  if (!porop.isShowBack && porop.isShowHome) {
    // 跳回小程序首页
    uni.showToast({
      title: '暂未开放',
      icon: 'none',
      duration: 2000,
    })
  } else {
    uni.reLaunch({ url: '/pages/consultation/index' }) // 跳转到首页
  }
}

onMounted(() => {
  const query = uni.createSelectorQuery().in(navBar.value) // 创建选择器查询对象
  query
    .select('.qz-nav-bar')
    .boundingClientRect((rect) => {
      // 查询导航栏的高度
      console.log(rect.height) // 输出导航栏的高度
    })
    .exec()
})
</script>
<style lang="less" scoped>
.qz-nav-bar {
  display: flex;
  position: fixed; // 固定定位;
  top: 0; // 顶部对齐;
  left: 0; // 左侧对齐;
  width: 100%; // 宽度为100%;
  height: auto; // 高度为100%;
  background: linear-gradient(to bottom, #ffe6cc, #f7f7f7);
  z-index: 9999; // 确保导航栏在其他元素之上;
}
.uv-nav-slot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 100rpx;
  padding: 6rpx 14rpx;
  .backHome {
    font-size: 28rpx;
    margin-left: 10rpx;
    color: #333;
  }
}
.center-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .name {
    font-weight: 600;
    color: #333333;
  }
  .desc-box {
    display: flex;
    align-items: center;
    .status {
      color: #388dfc;
      margin-right: 16rpx;
      font-size: 24rpx;
    }
    .type {
      color: #999999;
      font-size: 24rpx;
    }
  }
}
</style>
