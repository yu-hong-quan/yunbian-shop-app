<template>
  <view class="code-input-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration top-right"></view>
    <view class="bg-decoration bottom-left"></view>

    <!-- 主容器 -->
    <view class="main-container">
      <!-- 返回按钮 -->
      <view class="back-button" @click="navigateBack">
        <uv-icon name="arrow-left" size="32rpx" color="$text-color"></uv-icon>
      </view>

      <!-- 标题区域 -->
      <view class="title-section">
        <text class="page-title">{{ loginType === 'register' ? '验证码注册' : '验证码登录' }}</text>
        <text class="phone-display">我们已发送验证码至 +86 {{ phoneNumber }}</text>
      </view>

      <!-- 验证码输入卡片 -->
      <view class="code-card">
        <!-- 验证码输入区域 -->
        <view class="code-input-area">
          <uv-code-input v-model="code" :length="6" :border="'none'"
            :input-style="{ fontSize: '36rpx', height: '100rpx', color: $text - color, letterSpacing: '15rpx', textAlign: 'center', fontWeight: '500' }"
            :placeholder-style="{ color: $light - text, fontSize: '36rpx', letterSpacing: '15rpx' }"
            @input="handleCodeComplete"></uv-code-input>
        </view>

        <!-- 倒计时/重新发送 -->
        <view class="resend-section">
          <text class="resend-text" @click="handleResendCode" :class="{ active: countdownEnd }">
            {{ countdownEnd ? '重新发送' : '重新发送(' + countdown + 's)' }}
          </text>
        </view>

        <!-- 登录按钮 -->
        <!-- <uv-button
          class="primary-btn"
          :text="'登录'"
          :type="'primary'"
          :shape="'circle'"
          :plain="false"
          :disabled="!canLogin"
          :customStyle="{
            width: '100%',
            height: '90rpx',
            borderRadius: $radius-medium,
            backgroundColor: $primary-color,
            fontSize: '32rpx',
            margin: '0 auto',
            boxShadow: '0 8rpx 20rpx rgba(0, 122, 255, 0.25)'
          }"
          @click="handleLogin"
        ></uv-button> -->
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { loginWithCode, sendCode, register } from '@/common/api/auth.js';
import { onLoad } from '@dcloudio/uni-app';

const router = useRouter();
const route = useRoute();

// 验证码数据
const code = ref('');
const countdown = ref(0);
const countdownEnd = ref(true);

// 获取路由参数
const { phoneNumber, loginType, password } = route.query;

onMounted(() => {
  // 页面加载时开始倒计时
  startCountdown();
});

// 开始倒计时
let countdownTimer = null;

const startCountdown = () => {
  // 清除可能存在的旧定时器
  if (countdownTimer) {
    clearTimeout(countdownTimer);
  }

  countdown.value = 60;
  countdownEnd.value = false;
  const startTime = Date.now();

  const updateCountdown = () => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = 60 - elapsed;

    if (remaining <= 0) {
      countdown.value = 0;
      countdownEnd.value = true;
      countdownTimer = null;
      return;
    }

    countdown.value = remaining;
    countdownTimer = setTimeout(updateCountdown, 100);
  };

  updateCountdown();
};

const handleResendCode = () => {
  uni.showLoading({
    title: '发送验证码...'
  });
  if (countdownEnd.value) {
    // 发送验证码
    sendCode(phoneNumber)
      .then(res => {
        if (res.code === 200 && res.success) {
          uni.showToast({
            title: '验证码发送成功',
            icon: 'success'
          });
          // 重置倒计时
          startCountdown();
        } else {
          uni.showToast({
            title: res.message || '验证码发送失败',
            icon: 'none'
          });
        }
      })
      .catch(err => {
        console.error('发送验证码失败:', err);
        uni.showToast({
          title: err.message || '服务异常，请稍后再试',
          icon: 'none'
        });
      });
  }
};

// 页面显示时触发
onLoad(() => {
  // 如果是从注册页面跳转过来，自动发送验证码
  if ((loginType === 'register' || loginType === 'code') && countdownEnd.value) {
    handleResendCode();
  }
});

// 验证码输入完成
const handleCodeComplete = (value) => {
  code.value = value;
  console.log(code.value);
  // 自动触发验证
  if (code.value.length === 6) {
    handleVerification();
  }
};

// 处理登录
const handleLogin = () => {
  if (!code.value || code.value.length < 6) return;

  uni.showLoading({
    title: '登录中...'
  });

  loginWithCode(phoneNumber, code.value)
    .then(res => {
      uni.hideLoading();
      if (res.code === 200 && res.success) {
        // 保存登录状态和token
        uni.setStorageSync('isLogin', true);
        uni.setStorageSync('token', res.data.token);
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        });
        // 跳转到首页
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/product/index'
          });
        }, 1500);
      } else {
        uni.showToast({
          title: res.message || '登录失败',
          icon: 'none'
        });
      }
    })
    .catch(err => {
      uni.hideLoading();
      console.error('登录失败:', err);
      uni.showToast({
        title: err.message || '服务异常，请稍后再试',
        icon: 'none'
      });
    });
};

// 处理注册
const handleRegistration = () => {
  register(phoneNumber, password, code.value)
    .then(res => {
      if (res.code === 200 && res.success) {
        uni.showToast({
          title: '注册成功',
          icon: 'success'
        });
        // 跳转到登录页面
        setTimeout(() => {
          uni.reLaunch({
            url: '/pages/login/index'
          });
        }, 1500);
      } else {
        uni.showToast({
          title: res.message || '注册失败',
          icon: 'none'
        });
      }
    })
    .catch(err => {
      console.error('注册失败:', err);
      uni.showToast({
        title: err.message || '服务异常，请稍后再试',
        icon: 'none'
      });
      if (err.message === '该手机号已注册，请直接登录') {
          uni.reLaunch({
            url: '/pages/login/index'
          });
        }
    });
};

// 处理验证
const handleVerification = () => {
  if (loginType === 'register') {
    // 登录流程：注册
    handleRegistration();
  } else {
    // 登录流程：执行登录
    handleLogin();
  }
};

// 返回上一页
const navigateBack = () => {
  router.go(-1);
};

// 添加页面卸载时的清理
onUnmounted(() => {
  if (countdownTimer) {
    clearTimeout(countdownTimer);
  }
});
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

.code-input-page {
  min-height: 100vh;
  background-color: $background-color;
  position: relative;
  overflow: hidden;
  padding: 0 $spacing-md;
}

/* 背景装饰元素 */
.bg-decoration {
  position: absolute;
  width: 400rpx;
  height: 400rpx;
  border-radius: 50%;
  opacity: 0.2;
  z-index: 0;
}

.top-right {
  top: -150rpx;
  right: -150rpx;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
}

.bottom-left {
  bottom: -150rpx;
  left: -150rpx;
  background: linear-gradient(135deg, $secondary-color, $primary-color);
}

.main-container {
  position: relative;
  z-index: 1;
  padding-top: 80rpx;
}

/* 返回按钮 */
.back-button {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: $card-bg;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  margin-bottom: $spacing-xl;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }
}

/* 标题区域 */
.title-section {
  display: flex;
  text-align: center;
  flex-direction: column;
  margin-bottom: $spacing-xl;
}

.page-title {
  font-size: 40rpx;
  font-weight: 700;
  color: $text-color;
  margin-bottom: $spacing-xs;
}

.phone-display {
  font-size: 28rpx;
  color: $light-text;
}

/* 验证码卡片 */
.code-card {
  width: 100%;
  max-width: 600rpx;
  background-color: $card-bg;
  border-radius: $radius-large;
  padding: $spacing-xl $spacing-md;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 验证码输入区域 */
.code-input-area {
  margin-bottom: $spacing-lg;
  position: relative;
}

.uv-input {
  background-color: $background-color;
  border-radius: $radius-medium;
  padding: 0 $spacing-md;
  height: 100rpx;
  letter-spacing: 15rpx;
}

/* 重新发送区域 */
.resend-section {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  // margin-bottom: $spacing-xl;
}

.resend-text {
  font-size: 28rpx;
  color: $light-text;
  transition: all 0.3s ease;

  &.active {
    color: $primary-color;
    font-weight: 500;
  }

  &:active {
    opacity: 0.8;
  }
}

/* 主要按钮 */
.primary-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(90deg, $primary-color, #0066CC);
  border-radius: $radius-medium;
  font-size: 32rpx;
  font-weight: 500;
  color: white;
  box-shadow: 0 8rpx 20rpx rgba(0, 122, 255, 0.25);
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.2);
  }

  &:disabled {
    background: #CCCCCC !important;
    box-shadow: none !important;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.code-input-page {
  animation: fadeIn 0.5s ease-out;
}

.code-card {
  animation: fadeIn 0.6s ease-out 0.1s backwards;
}

.primary-btn {
  animation: fadeIn 0.7s ease-out 0.2s backwards;
}
</style>