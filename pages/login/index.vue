<template>
  <view class="login-page">
    <!-- 背景装饰 -->
    <view class="bg-decoration top-left"></view>
    <view class="bg-decoration bottom-right"></view>

    <!-- 主容器 -->
    <view class="main-container">
      <!-- 应用Logo -->
      <view class="logo-section">
        <view class="logo-wrapper">
          <image src="/static/logo.png" mode="aspectFit" class="logo-img"></image>
        </view>
        <text class="app-title">云边小铺</text>
        <text class="app-subtitle">连接美好生活</text>
      </view>

      <!-- 登录表单卡片 -->
      <view class="form-card">
        <!-- 登录方式切换 -->
        <view class="login-type-switch">
          <view :class="{ active: loginType === 'password' }" @click="switchLoginType('password')">
            <text>密码登录</text>
          </view>
          <view :class="{ active: loginType === 'code' }" @click="switchLoginType('code')">
            <text>验证码登录</text>
          </view>
        </view>

        <!-- 手机号输入 -->
        <view class="form-group">
          <uv-input v-model="phoneNumber" type="number" placeholder="请输入手机号" :maxlength="11" :prefix-icon="'phone'"
            :border="'none'" :clearable="true" :placeholder-style="{ color: '#8E8E93', fontSize: '28rpx' }"
            :inputStyle="{ fontSize: '28rpx', height: '80rpx', width: '100%', color: '#1D1D1F' }"
            @input="handlePhoneInput"></uv-input>
          <!-- 手机号校验提示 -->
          <text v-if="!phoneValid && phoneNumber.length > 0" class="error-message">{{ phoneErrorTip }}</text>
        </view>

        <!-- 密码输入框 - 仅在密码登录模式下显示 -->
        <view v-if="loginType === 'password'" class="form-group">
          <uv-input v-model="password" type="password" placeholder="请输入密码" :maxlength="20" :prefix-icon="'lock'"
            :border="'none'" :clearable="true" :placeholder-style="{ color: '#8E8E93', fontSize: '28rpx' }"
            :inputStyle="{ fontSize: '28rpx', height: '80rpx', width: '100%', color: '#1D1D1F' }"
            @input="handlePasswordInput"></uv-input>
          <!-- 密码校验提示 -->
          <text v-if="!passwordValid && password.length > 0" class="error-message">{{ passwordErrorTip }}</text>
        </view>

        <!-- 登录按钮 -->
        <uv-button class="primary-btn" :text="loginType === 'password' ? '登录' : '获取验证码'" :type="'primary'"
          :shape="'circle'" :plain="false" :disabled="!canSubmit" :customStyle="{
            width: '100%',
            height: '90rpx',
            borderRadius: '50rpx',
            backgroundColor: '#007AFF',
            fontSize: '32rpx',
            margin: '0 auto',
            boxShadow: '0 8rpx 20rpx rgba(0, 122, 255, 0.25)',
            color: '#fff'
          }" @click="handleSubmit"></uv-button>

        <!-- 注册入口 -->
        <view class="register-link">
          <text class="link-text" @click="navigateToRegister">立即注册</text>
        </view>

        <!-- 分隔线 -->
        <view class="divider">
          <view class="divider-line"></view>
          <text class="divider-text">其他登录方式</text>
          <view class="divider-line"></view>
        </view>

        <!-- 微信快捷登录 -->
        <!-- open-type="getUserInfo"
          @getuserinfo="handleWechatLogin" -->
        <uv-button class="wechat-btn" :icon="'weixin-fill'" :text="'微信快捷登录'" :type="'info'" :shape="'circle'"
          :plain="true" :customStyle="{
            width: '60%',
            height: '90rpx',
            borderRadius: '50rpx',
            borderColor: '#07C160',
            color: '#07C160',
            fontSize: '32rpx',
            borderWidth: '2rpx',
            margin: '0 auto'
          }" @click="wechatLogin"></uv-button>
      </view>

      <!-- 条款说明 -->
      <view class="terms-section">
        <text class="terms-text">登录即表示同意</text>
        <text class="terms-link">用户协议</text>
        <text class="terms-text">和</text>
        <text class="terms-link">隐私政策</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { loginWithPassword, sendCode } from '@/common/api/auth.js';

// 表单数据
const phoneNumber = ref('');
const phoneValid = ref(false);
const password = ref('');
const passwordValid = ref(false);
const passwordErrorTip = ref('');
const phoneErrorTip = ref('');

// 登录类型: 'password' 或 'code'
const loginType = ref('password');

// 是否可以提交表单
const canSubmit = computed(() => {
  if (loginType.value === 'password') {
    return phoneNumber.value && password.value && /^1[3-9]\d{9}$/.test(phoneNumber.value) && password.value.length >= 6;
  } else {
    return phoneNumber.value && /^1[3-9]\d{9}$/.test(phoneNumber.value);
  }
});

// 切换登录类型
const switchLoginType = (type) => {
  loginType.value = type;
  // 重置表单验证状态
  passwordErrorTip.value = '';
  phoneErrorTip.value = '';
};

// 监听密码输入，验证格式
const handlePasswordInput = (val) => {
  password.value = val;
  // 密码验证 (至少6位字符)
  const isPasswordValid = val.length >= 6;
  passwordValid.value = isPasswordValid;
  // canGetCode.value = passwordValid.value && phoneValid.value;

  if (val.length > 0 && !isPasswordValid) {
    passwordErrorTip.value = '密码至少6位字符';
  } else {
    passwordErrorTip.value = '';
  }
};

// 监听手机号输入，验证格式
const handlePhoneInput = (val) => {
  phoneNumber.value = val;
  // 手机号验证（11位数字，以1开头）
  const isPhoneValid = /^1[3-9]\d{9}$/.test(val);
  phoneValid.value = isPhoneValid;
  // canGetCode.value = passwordValid.value && phoneValid.value;

  // 设置错误提示
  if (val.length > 0 && !isPhoneValid) {
    if (val.length < 11) {
      phoneErrorTip.value = '手机号长度不足11位';
    } else if (!/^1[3-9]\d{9}$/.test(val)) {
      phoneErrorTip.value = '请输入有效的手机号';
    }
  } else {
    phoneErrorTip.value = '';
  }
};

// 处理表单提交
const handleSubmit = () => {
  if (!phoneNumber.value || !/^1[3-9]\d{9}$/.test(phoneNumber.value)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    });
    return;
  }

  if (loginType.value === 'password') {
    // 密码登录
    if (!password.value || password.value.length < 6) {
      uni.showToast({
        title: '请输入至少6位密码',
        icon: 'none'
      });
      return;
    }

    uni.showLoading({
      title: '登录中...'
    });

    loginWithPassword(phoneNumber.value, password.value)
      .then(res => {
        uni.hideLoading();
        console.log(res)
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
        uni.showToast({
          title: err.message || '服务异常，请稍后再试',
          icon: 'none'
        });
      });
  } else {
    // 验证码登录 - 发送验证码
    uni.navigateTo({
      url: `/pages/login/code-input?phoneNumber=${phoneNumber.value}&loginType=code`
    });
  }
};

// 跳转到注册页面
const navigateToRegister = () => {
  uni.navigateTo({
    url: `/pages/login/register`
  })
};

// 微信快捷登录 - 跳转到验证码输入页
const handleWechatLogin = () => {
  uni.navigateTo({
    url: `/pages/login/code-input?loginType=wechat`
  })
};
const wechatLogin = () => {
  uni.showToast({
    icon: 'none',
    title: '功能开发中，敬请期待'
  })
}
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

:deep(.uv-input) {
  padding: 0 20rpx !important;
}

.login-page {
  min-height: 100vh;
  background-color: $background-color;
  position: relative;
  overflow: hidden;
  padding: 0 $spacing-md;
}

// 背景装饰元素
.bg-decoration {
  position: absolute;
  width: 400rpx;
  height: 400rpx;
  border-radius: 50%;
  opacity: 0.2;
  z-index: 0;
}

.top-left {
  top: -150rpx;
  left: -150rpx;
  background: linear-gradient(135deg, #007AFF, #07C160);
}

.bottom-right {
  bottom: -150rpx;
  right: -150rpx;
  background: linear-gradient(135deg, #07C160, #007AFF);
}

.main-container {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 120rpx;
}

// Logo区域
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: $spacing-xl;
}

.logo-wrapper {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background-color: $card-bg;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.1);
  margin-bottom: $spacing-sm;
}

.logo-img {
  width: 100rpx;
  height: 100rpx;
}

.app-title {
  font-size: 48rpx;
  font-weight: 700;
  color: #1D1D1F;
  margin-bottom: $spacing-xs;
}

.app-subtitle {
  font-size: 28rpx;
  color: '#8E8E93';
}

// 表单卡片
.form-card {
  width: 100%;
  max-width: 500rpx;
  background-color: $card-bg;
  border-radius: $radius-large;
  padding: $spacing-xl $spacing-md;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.05);
  margin-bottom: $spacing-xl;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

// 登录方式切换
.login-type-switch {
  display: flex;
  width: 60%;
  margin: 0 auto $spacing-md auto;
  border-radius: 20rpx;
  background-color: $background-color;
  overflow: hidden;
}

.login-type-switch>view {
  flex: 1;
  text-align: center;
  padding:10rpx 0;
  font-size: 26rpx;
  color: #8E8E93;
  transition: all 0.3s ease;
}

.login-type-switch>view.active {
  background-color: #007AFF;
  color: white;
  font-weight: 500;
}

.login-type-switch>view text {
  display: block;
  width: 100%;
  height: 100%;
}

// 表单组
.form-group {
  width: 100%;
  margin-bottom: $spacing-lg;
  position: relative;
}

.uv-input {
  background-color: $background-color;
  border-radius: 50rpx;
  padding: 0 $spacing-lg;
  height: 90rpx;
}

// 错误消息
.error-message {
  color: #ff3b30;
  font-size: 26rpx;
  margin-top: $spacing-xs;
  margin-left: $spacing-xs;
  height: 30rpx;
  line-height: 30rpx;
}

// 主要按钮
.primary-btn {
  width: 100%;
  margin-bottom: 20rpx;

  height: 90rpx;
  background: linear-gradient(90deg, #007AFF, #0066CC);
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: 500;
  color: white;
  box-shadow: 0 8rpx 20rpx rgba(0, 122, 255, 0.25);
  margin-bottom: $spacing-lg;
  transition: all 0.3s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 4rpx 12rpx rgba(7, 193, 96, 0.2);
    background-color: #07C160 !important;
    color: white !important;
  }
}

// 分隔线
.divider {
  display: flex;
  align-items: center;
  width: 100%;
  margin-bottom: $spacing-lg;
}

.divider-line {
  flex: 1;
  height: 1rpx;
  background-color: $border-color;
}

.divider-text {
  padding: 0 $spacing-sm;
  font-size: 26rpx;
  color: #8E8E93;
}

// 微信按钮
.register-link {
  margin-top: 0rpx;
  margin-bottom: 30rpx;
  text-align: right;
  width: 100%;
}

.link-text {
  color: #007AFF;
  font-size: 28rpx;
  text-decoration: none;

  &:active {
    text-decoration: underline;
  }
}

.wechat-btn {
  width: 100%;
  height: 70rpx;
  border-radius: 50rpx;
  border: none;
  color: #07C160;
  font-size: 32rpx;
  transition: all 0.3s ease;
  background: #07C160;

  ::v-deep .uv-button {
    width: 100% !important;
  }

  .uv-icon {
    color: #07C160 !important;
  }

  &:active {
    background-color: #07C160;
    color: white;
  }
}

// 条款部分
.terms-section {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  font-size: 24rpx;
  color: #8E8E93;
}

.terms-link {
  color: #007AFF;
  margin: 0 8rpx;
  text-decoration: none;

  &:active {
    text-decoration: underline;
  }
}

// 响应式调整
@media (max-width: 375rpx) {
  .form-card {
    padding: $spacing-md $spacing-sm;
  }

  .app-title {
    font-size: 42rpx;
  }
}

// 动画效果
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

.login-page {
  animation: fadeIn 0.5s ease-out;
}

.form-card {
  animation: fadeIn 0.6s ease-out 0.1s backwards;
}

.primary-btn,
.wechat-btn {
  animation: fadeIn 0.7s ease-out 0.2s backwards;
}

.terms-section {
  animation: fadeIn 0.8s ease-out 0.3s backwards;
}
</style>