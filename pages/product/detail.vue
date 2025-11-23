<template>
  <view class="product-detail">
    <!-- 导航栏 -->
    <uv-navbar title="商品详情" :left-show="true" :border="true" @left-click="navigateBack"></uv-navbar>
    <!-- 商品图片轮播 -->
    <view class="product-swiper-container">
      <uv-swiper v-if="product.images.length > 0" :list="product.images" indicator :loading="pageLoading" :autoplay="true" :interval="4000"
        :duration="500" class="product-swiper">
        <!-- <view v-for="(img, index) in product.images" :key="index">
          <uv-image :src="`${baseUrl}${img}`" mode="aspectFill" class="swiper-image" :default-src="'/static/logo.png'"
            @error="handleImageError(index)" :width="'100%'" :height="'100%'"></uv-image>
        </view> -->
      </uv-swiper>
      <view v-else class="no-image-placeholder">
        <uv-icon name="image" size="100rpx" color="#ccc"></uv-icon>
        <text class="no-image-text">暂无商品图片</text>
      </view>
    </view>

    <!-- 商品信息 -->
    <view class="product-info">
      <text class="product-title">{{ product.title ? product.title : '-' }}</text>
      <view class="product-price">
        <text class="current-price">¥{{ product.price.toFixed(2) }}</text>
        <text class="original-price" v-if="product.originalPrice">¥{{ product.originalPrice.toFixed(2) }}</text>
        <uv-badge v-if="product.discount" class="discount-badge">{{ product.discount }}</uv-badge>
      </view>
      <view class="product-meta">
        <text class="sales">已售 {{ product.sales }}件</text>
        <text class="rating">★{{ product.rating }} ({{ product.reviewCount }}评价)</text>
      </view>
    </view>

    <!-- 商品详情标签页 -->
    <uv-tabs :list="tabs" :active-id="activeTabId" @change="handleTabChange" class="detail-tabs"
      v-if="!pageLoading"></uv-tabs>

    <view v-show="activeTabId === 0" class="tab-content">
      <view class="detail-content">
        <text class="section-title">商品详情</text>
        <text class="description">{{ product.description }}</text>
        <view class="specifications" v-if="product.specifications.length">
          <text class="section-title">规格参数</text>
          <view class="spec-item" v-for="(spec, index) in product.specifications" :key="index">
            <text class="spec-name">{{ spec.name }}:</text>
            <text class="spec-value">{{ spec.value }}</text>
          </view>
        </view>
      </view>
    </view>
    <view v-show="activeTabId === 1" class="tab-content">
      <view class="comments-content">
        <text class="section-title">用户评价</text>
        <view v-if="product.comments.length" class="comment-list">
          <view class="comment-item" v-for="(comment, index) in product.comments" :key="index">
            <text class="comment-user">{{ comment.user }}</text>
            <text class="comment-rating">★{{ comment.rating }}</text>
            <text class="comment-content">{{ comment.content }}</text>
            <text class="comment-time">{{ comment.time }}</text>
          </view>
        </view>
        <uv-empty v-else text="暂无评价"></uv-empty>
      </view>
    </view>
  </view>
  <!-- 移除重复的加载组件 -->
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getProductDetail } from '../../common/api/product.js'

const baseUrl = ref(import.meta.env.VITE_BASE_URL)
// 页面数据
const pageLoading = ref(true)
const product = ref({ id: 0, title: '', price: 0, originalPrice: 0, discount: '', images: [], description: '', sales: 0, rating: 0, reviewCount: 0, specifications: [], comments: [] })

// 标签页数据
const tabs = [
  { id: 0, name: '商品详情' },
  { id: 1, name: '用户评价' }
]
const activeTabId = ref(0)

// 生命周期函数 - 页面加载时
onLoad((options) => {
  const productId = parseInt(options.id)
  fetchProductDetail(productId)
})

// 获取商品详情数据
const fetchProductDetail = (productId) => {
  uni.showLoading({
    title: '拼命加载中...'
  })
  pageLoading.value = true

  getProductDetail(productId)
    .then(res => {
      if (res.success && res.code === 200) {
        // 格式化商品数据
        const data = res.data;
        product.value = {
          id: data.id,
          title: data.name,
          price: parseFloat(data.price),
          originalPrice: 0, // 接口未返回原价，设置为0
          discount: '', // 接口未返回折扣信息
          images: data.imageUrl ? [baseUrl.value + data.imageUrl] : [],
          description: data.description || '',
          sales: 0, // 接口未返回销量
          rating: 0, // 接口未返回评分
          reviewCount: 0, // 接口未返回评价数
          specifications: [], // 接口未返回规格参数
          comments: [], // 接口未返回评价
          category: data.category || {}
        }
        console.log(product.value)
      } else {
        uni.showToast({
          title: res.message || '获取商品详情失败',
          icon: 'none'
        })
      }
      pageLoading.value = false
      uni.hideLoading()
    })
    .catch(err => {
      console.error('获取商品详情失败:', err)
      uni.showToast({
        title: '网络错误，获取商品详情失败',
        icon: 'none'
      })
      pageLoading.value = false
      uni.hideLoading()
    })
}

// 处理图片加载错误
const handleImageError = (index) => {
  // 使用本地默认图片替换加载失败的图片
  product.value.images[index] = new URL('../../static/logo.png', import.meta.url).href
}

// 返回上一页
const navigateBack = () => {
  uni.navigateBack()
}

// 标签切换处理
const handleTabChange = (item) => {
  console.log(item)
  activeTabId.value = item.id
}
</script>

<style scoped lang="scss">
.product-detail {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.product-swiper-container {
  height: 500rpx;
  width: 100%;
  background-color: #f5f5f5;
  margin-top: 90rpx;
  overflow: hidden;
  background-color: #f5f5f5;
}

::v-deep .product-swiper {
  height: 100% !important;
  width: 100%;
  border-radius: 0 !important;
}

::v-deep .uv-swiper__wrapper {
  height: 100% !important;
  width: 100%;
}

::v-deep .swiper-image {
  height: 500rpx;
}
::v-deep .uv-swiper__wrapper__item__wrapper__image {
  border-radius: 0 !important;
}

.no-image-placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.no-image-text {
  margin-top: 20rpx;
  font-size: 28rpx;
  color: #999;
}

.swiper-image-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.swiper-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

::v-deep .uv-swiper__item {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
::v-deep .uv-swiper__wrapper__item__wrapper__image{
  height: 500rpx !important;
  border-radius: 0 !important;
}

.product-info {
  padding: 24rpx;
  background-color: #fff;
}

.product-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  line-height: 50rpx;
  margin-bottom: 16rpx;
}

.product-price {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}

.current-price {
  font-size: 40rpx;
  color: #ff4d4f;
  font-weight: bold;
  margin-right: 16rpx;
}

.original-price {
  font-size: 28rpx;
  color: #999;
  text-decoration: line-through;
  margin-right: 16rpx;
}

.discount-badge {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  font-size: 24rpx;
  color: #666;
  padding-bottom: 16rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.detail-tabs {
  flex: 1;
  margin-top: 16rpx;
  background-color: #fff;
}

.tab-content {
  padding: 24rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin: 32rpx 0 16rpx;
  display: block;
}

.description {
  font-size: 28rpx;
  color: #666;
  line-height: 44rpx;
  white-space: pre-line;
}

.specifications {
  margin-top: 32rpx;
}

.spec-item {
  display: flex;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.spec-name {
  flex: 0 0 200rpx;
  font-size: 28rpx;
  color: #999;
}

.spec-value {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.comments-content {
  padding: 24rpx;
}

.comment-list {
  margin-top: 16rpx;
}

.comment-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.comment-user {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
  display: block;
}

.comment-rating {
  font-size: 24rpx;
  color: #ffb400;
  margin-bottom: 16rpx;
  display: block;
}

.comment-content {
  font-size: 28rpx;
  color: #666;
  line-height: 44rpx;
  margin-bottom: 8rpx;
}

.comment-time {
  font-size: 24rpx;
  color: #999;
}
</style>