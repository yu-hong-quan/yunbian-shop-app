<template>
  <view class="register-page">
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
        <text class="app-subtitle">新用户注册</text>
      </view>

      <!-- 注册表单卡片 -->
      <view class="form-card">
        <!-- 手机号输入 -->
        <view class="form-group">
          <uv-input
            v-model="phoneNumber"
            type="number"
            :clearable="true"
            placeholder="请输入手机号"
            :maxlength="11"
            :prefix-icon="'phone'"
            :border="'none'"
            :placeholder-style="{color: '#8E8E93', fontSize: '28rpx'}"
            :inputStyle="{fontSize: '28rpx', height: '80rpx', width: '100%', color: '#1D1D1F'}"
            @input="handlePhoneInput"
          ></uv-input>
          <!-- 手机号校验提示 -->
          <text v-if="!phoneValid && phoneNumber.length > 0" class="error-message">{{phoneErrorTip}}</text>
        </view>

        <!-- 密码输入 -->
        <view class="form-group">
          <uv-input
            v-model="password"
            type="password"
            :clearable="true"
            placeholder="请设置密码"
            :maxlength="20"
            :prefix-icon="'lock'"
            :border="'none'"
            :placeholder-style="{color: '#8E8E93', fontSize: '28rpx'}"
            :inputStyle="{fontSize: '28rpx', height: '80rpx', width: '100%', color: '#1D1D1F'}"
            @input="handlePasswordInput"
          ></uv-input>
          <!-- 密码校验提示 -->
          <text v-if="!passwordValid && password.length > 0" class="error-message">{{passwordErrorTip}}</text>
        </view>

        <!-- 确认密码输入 -->
        <view class="form-group">
          <uv-input
            v-model="confirmPassword"
            type="password"
            :clearable="true"
            placeholder="请确认密码"
            :maxlength="20"
            :prefix-icon="'lock'"
            :border="'none'"
            :placeholder-style="{color: '#8E8E93', fontSize: '28rpx'}"
            :inputStyle="{fontSize: '28rpx', height: '80rpx', width: '100%', color: '#1D1D1F'}"
            @input="handleConfirmPasswordInput"
          ></uv-input>
          <!-- 确认密码校验提示 -->
          <text v-if="confirmPassword.length > 0 && password !== confirmPassword" class="error-message">两次密码输入不一致</text>
        </view>

        <!-- 注册按钮 -->
        <uv-button
          class="primary-btn"
          :text="'注册'"
          :type="'primary'"
          :shape="'circle'"
          :plain="false"
          :disabled="!canRegister"
          :customStyle="{
            width: '100%',
            height: '90rpx',
            borderRadius: '50rpx',
            backgroundColor: '#007AFF',
            fontSize: '32rpx',
            margin: '0 auto',
            boxShadow: '0 8rpx 20rpx rgba(0, 122, 255, 0.25)',
            color:'#fff'
          }"
          @click="handleRegister"
        ></uv-button>

        <!-- 返回登录链接 -->
        <view class="login-link">
          <text class="link-text">已有账号？</text>
          <text class="link-btn" @click="navigateToLogin">立即登录</text>
        </view>
      </view>

      <!-- 条款说明 -->
      <view class="terms-section">
        <text class="terms-text">注册即表示同意</text>
        <text class="terms-link">用户协议</text>
        <text class="terms-text">和</text>
        <text class="terms-link">隐私政策</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// 表单数据
const phoneNumber = ref('');
const password = ref('');
const confirmPassword = ref('');

// 验证状态
const phoneValid = ref(false);
const passwordValid = ref(false);
const confirmPasswordValid = ref(false);

// 错误提示
const phoneErrorTip = ref('');
const passwordErrorTip = ref('');

// 计算属性：是否可以注册
const canRegister = computed(() => {
  return phoneValid.value && passwordValid.value && 
         confirmPasswordValid.value && password.value === confirmPassword.value
});

// 手机号输入处理
const handlePhoneInput = (val) => {
  phoneNumber.value = val;
  const isPhoneValid = /^1[3-9]\d{9}$/.test(val);
  phoneValid.value = isPhoneValid;

  if (val.length > 0 && !isPhoneValid) {
    if (val.length < 11) {
      phoneErrorTip.value = '手机号长度不足11位';
    } else {
      phoneErrorTip.value = '请输入有效的手机号';
    }
  } else {
    phoneErrorTip.value = '';
  }
};

// 密码输入处理
const handlePasswordInput = (val) => {
  password.value = val;
  const isPasswordValid = val.length >= 6 && val.length <= 20;
  passwordValid.value = isPasswordValid;

  if (val.length > 0 && !isPasswordValid) {
    passwordErrorTip.value = '密码长度必须为6-20位';
  } else {
    passwordErrorTip.value = '';
  }

  // 检查确认密码
  handleConfirmPasswordInput(confirmPassword.value);
};

// 确认密码输入处理
const handleConfirmPasswordInput = (val) => {
  confirmPassword.value = val;
  confirmPasswordValid.value = val.length > 0;
};

// 处理注册
const handleRegister = () => {
  // 验证手机号和密码
  if (!phoneValid.value) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'none'
    });
    return;
  }

  if (!passwordValid.value) {
    uni.showToast({
      title: '密码长度必须为6-20位',
      icon: 'none'
    });
    return;
  }

  if (password.value !== confirmPassword.value) {
    uni.showToast({
      title: '两次密码输入不一致',
      icon: 'none'
    });
    return;
  }

  // 跳转到验证码输入页
  uni.navigateTo({
    url: `/pages/login/code-input?phoneNumber=${phoneNumber.value}&loginType=register&password=${password.value}`
  });
};

// 跳转到登录页
const navigateToLogin = () => {
  uni.navigateBack(-1)
};

// 生命周期
onMounted(() => {
  // 页面加载时的初始化逻辑
});
</script>

<style lang="scss" scoped>
@import "@/uni.scss";

:deep(.uv-input){
  padding: 0 20rpx !important;
}

.register-page {
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
  color: #8E8E93;
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

// 表单组
.form-group {
  width: 100%;
  margin-bottom: $spacing-lg;
  position: relative;
}

.code-input-wrapper {
  display: flex;
  align-items: center;
  background-color: $background-color;
  border-radius: 50rpx;
  padding: 0 $spacing-lg;
  height: 90rpx;
  position: relative;
}

.send-code-btn {
  position: absolute;
  right: $spacing-lg;
  top: 50%;
  transform: translateY(-50%);
  font-size: 26rpx;
  color: #8E8E93;
  padding: 10rpx;
  transition: all 0.3s;
}

.send-code-btn.active {
  color: #007AFF;
}

.send-code-btn:active {
  opacity: 0.8;
}

.uv-input {
  background-color: $background-color;
  border-radius: 50rpx;
  padding: 0 $spacing-lg;
  height: 90rpx;
}

// 验证码按钮
.code-btn {
  position: absolute;
  right: 15rpx;
  top: 15rpx;
  width: 140rpx;
  height: 60rpx;
  font-size: 26rpx;
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
  height: 90rpx;
  background: linear-gradient(90deg, #007AFF, #0066CC);
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: 500;
  color: white;
  box-shadow: 0 8rpx 20rpx rgba(0, 122, 255, 0.25);
  margin-bottom: $spacing-lg;
}

// 登录链接
.login-link {
  margin-top: 20rpx;
  text-align: center;
  width: 100%;
  font-size: 28rpx;
}

.link-text {
  color: #8E8E93;
  margin-right: 10rpx;
}

.link-btn {
  color: #007AFF;
  text-decoration: none;
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
}
</style>