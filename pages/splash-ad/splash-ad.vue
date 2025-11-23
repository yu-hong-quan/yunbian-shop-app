<template>
  <view class="splash-container" :class="{ 'closing': isClosing }">
    <!-- 广告图片 -->
    <image class="ad-image" :src="adImageUrl" mode="aspectFill"></image>
    
    <!-- 倒计时按钮 -->
    <view class="countdown-btn" @click.stop="closeSplash">
      {{ countdown }}s 跳过
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      countdown: 3, // 默认倒计时3秒
      adImageUrl: 'https://oss.qiaozhi-group.com/548a8be4ab418471634a98650603a04161aa926a8135d27dc47e08c68c386f0c.png', // 广告图片路径
      countdownTimer: null,
      isClosing: false // 控制关闭动画状态
    };
  },

  onLoad() {
      // 设置倒计时
      this.startCountdown();
  },
  methods: {
    startCountdown() {
      this.countdown = 3;
      this.countdownTimer = setInterval(() => {
        this.$set(this, 'countdown', this.countdown - 1);
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer);
          this.closeSplash();
        }
      }, 1000);
    },
    closeSplash() {
      clearInterval(this.countdownTimer);
      // 触发关闭动画
      this.isClosing = true;
      // 等待动画完成后再跳转
      setTimeout(() => {
        this.navigateToHome();
      }, 300); // 与动画过渡时间保持一致
    },
    navigateToHome() {
      // 检查登录状态
      const token = uni.getStorageSync('token');
      // 根据登录状态决定跳转页面
      const targetUrl = token ? '/pages/product/index' : '/pages/login/index';
      uni.reLaunch({
        url: targetUrl
      });
    }
  },
  onUnload() {
      clearInterval(this.countdownTimer);
    }
};
</script>

<style lang="scss" scoped>
.splash-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: 9999;
  transition: all 0.3s ease-out; // 添加过渡效果
}

/* 关闭动画样式 */
.splash-container.closing {
  opacity: 0;
  transform: scale(0.95);
}

.ad-image {
  width: 100%;
  height: 100%;
}

.countdown-btn {
  position: absolute;
  top: 30rpx;
  right: 30rpx;
  background-color: rgba(0, 0, 0, 0.3);
  color: #ffffff;
  padding: 8rpx 16rpx;
  border-radius: 30rpx;
  font-size: 28rpx;
  backdrop-filter: blur(4rpx);
  cursor: pointer;
}
</style>