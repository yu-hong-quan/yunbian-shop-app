<template>
  <view class="product-list-page">
    <!-- 可拖动的添加商品按钮 -->
    <view
      class="float-add-button"
      :style="{ display: buttonVisible ? 'flex' : 'none', left: buttonLeft + 'px', top: buttonTop + 'px' }"
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @click="navigateToAddProduct"
    >
      <uv-icon name="plus" size="32" color="#fff"></uv-icon>
    </view>
    <!-- 导航栏 -->
    <uv-navbar title="商品列表" :left-icon="false" :border="true"></uv-navbar>

    <!-- 搜索框 -->
    <view class="search-container">
      <view class="search-wrapper">
        <uv-input v-model="searchText" placeholder="请输入商品名称搜索" :clearable="true" :search-icon="false"
          @search="handleSearch" class="search-input"></uv-input>
        <uv-button class="search-button" @click="handleSearch" type="primary" size="small">搜索</uv-button>
      </view>
    </view>

    <!-- 垂直选项卡组件 -->
    <uv-vtabs :chain="false" :list="categories" :active-id="activeCategoryId" :hdHeight="90" tabKey="name"
      @change="handleTabChange" animated>
      <uv-vtabs-item>
        <scroll-view class="tab-content" scroll-y @scroll="handleScroll" @scrolltolower="loadMore"
          :scroll-top="scrollTop" style="height: calc(100vh - 200rpx);">
          <view v-if="products.length > 0" class="product-grid">
            <view v-for="product in products" :key="product.id" class="product-item"
              @click="navigateToDetail(product.id)">
              <view class="product-image">
                <uv-image :src="`${baseUrl}${product.imageUrl}`" mode="aspectFill" width="100%" height="100%"></uv-image>
                <!-- <view class="product-badge" v-if="product.discount">{{
                  product.discount
                  }}</view> -->
              </view>
              <view class="product-info">
                <text class="product-title">{{ product.name }}</text>
                <text class="product-desc">{{ product.description }}</text>
                <view class="product-meta">
                  <text class="product-price">{{
                    '¥' + product.price
                    }}</text>
                  <!-- <text class="product-rating">★{{ product.rating }}</text> -->
                </view>
                <!-- <text class="product-sales">已售 {{ product.sales }}件</text> -->
              </view>
            </view>
          </view>
          <!-- 空状态 -->
          <uv-empty v-if="products.length === 0" text="暂无商品数据"></uv-empty>
          <!-- 加载更多 -->
          <view v-if="hasMore && loading" class="load-more" @click="loadMore">
            <uv-loading-icon size="24" type="circle"></uv-loading-icon>
            <text class="load-more-text">加载更多</text>
          </view>
          <view v-if="!hasMore && products.length > 0" class="no-more">
            <text>没有更多数据了</text>
          </view>
        </scroll-view>
      </uv-vtabs-item>
    </uv-vtabs>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getCategories, getProducts } from '@/common/api/product.js'

// 分类数据
const categories = ref([
  { id: 0, name: '全部商品' }
])

// 响应式数据
const baseUrl = ref(import.meta.env.VITE_BASE_URL)
const activeCategoryId = ref(0) 
const searchText = ref('')
const products = ref([])
const loading = ref(false)
const pageNum = ref(1)
const pageSize = ref(10)
const hasMore = ref(true)
const pageLoading = ref(true)
const scrollTop = ref(0)

const height = computed(() => {
  return uni.getSystemInfoSync().windowHeight - uni.upx2px(210)
})

// 获取分类数据
const fetchCategories = async () => {
  try {
    const res = await getCategories()
    if (res.success) {
      // 在分类数据前添加'全部商品'
      categories.value = [
        { id: 0, name: '全部商品' },
        ...res.data
      ]
    } else {
      uni.showToast({
        title: '获取分类失败',
        icon: 'none'
      })
    }
  } catch (error) {
    console.error('获取分类失败:', error)
    uni.showToast({
      title: '网络异常，请重试',
      icon: 'none'
    })
  }
}

// 获取商品数据
const fetchProducts = async () => {
  scrollTop.value = 0;
  if (loading.value || !hasMore.value) return

  loading.value = true
  try {
    // 准备请求参数
    const params = {
      page: pageNum.value,
      limit: pageSize.value,
      search: searchText.value,
      categoryId: activeCategoryId.value === 0 ? '' : activeCategoryId.value
    }

    // 调用商品列表接口
    const res = await getProducts(params)

    if (res.code === 200 && res.success) {
      const newProducts = res.data.list || []

      // 始终追加数据，不清除现有内容
      products.value.push(...newProducts)

      // 控制分页
      if (newProducts.length < pageSize.value) {
        hasMore.value = false
      } else {
        pageNum.value++
      }
    } else {
      uni.showToast({
        title: res.message || '获取商品失败',
        icon: 'none'
      })
    }
    pageLoading.value = false
  } catch (error) {
    console.error('获取商品数据失败:', error)
    uni.showToast({
      title: '网络异常，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
    uni.hideLoading()
  }
}

// 处理搜索
const handleSearch = () => {
  uni.showLoading({
    title: '拼命加载中...',
    mask:true
  })
  pageNum.value = 1
  hasMore.value = true
  scrollTop.value = 0
  products.value = []
  fetchProducts()
}

// 处理分类切换
const handleTabChange = (id) => {
  uni.showLoading({
    title: '拼命加载中...',
    mask:true
  })
  pageLoading.value = true
  activeCategoryId.value = id
  pageNum.value = 1
  hasMore.value = true
  products.value = []
  scrollTop.value = 0
  fetchProducts()
}

// 处理滚动事件，实现距离底部一定距离触发加载
const handleScroll = (e) => {
  if (loading.value || !hasMore.value) return

  const { scrollTop, scrollHeight, clientHeight } = e.detail
  const distanceToBottom = scrollHeight - scrollTop - clientHeight

  // 距离底部200px时触发加载
  if (distanceToBottom < 200) {
    loadMore()
  }
}

// 导航到商品详情页
const navigateToDetail = (productId) => {
  uni.navigateTo({
    url: `/pages/product/detail?id=${productId}`
  })
}

// 导航到添加商品页
const navigateToAddProduct = () => {
  uni.navigateTo({
    url: '/pages/product/add'
  })
}

// 拖动按钮相关逻辑
const buttonLeft = ref(0)
const buttonTop = ref(0)
const startX = ref(0)
const startY = ref(0)
const windowWidth = ref(0)
const windowHeight = ref(0)
const buttonWidth = ref(90) // 按钮宽度rpx
const buttonHeight = ref(90) // 按钮高度rpx
const buttonVisible = ref(false)

// 初始化按钮位置
const initButtonPosition = () => {
  const systemInfo = uni.getSystemInfoSync()
  windowWidth.value = systemInfo.windowWidth
  windowHeight.value = systemInfo.windowHeight
  // 初始位置右下角
  buttonLeft.value = windowWidth.value - uni.upx2px(buttonWidth.value) - 10
  buttonTop.value = windowHeight.value - uni.upx2px(buttonHeight.value) - 100
  buttonVisible.value = true
}

// 触摸开始
const onTouchStart = (e) => {
  startX.value = e.touches[0].clientX
  startY.value = e.touches[0].clientY
}

// 触摸移动
  const onTouchMove = (e) => {
    const moveX = e.touches[0].clientX - startX.value
    const moveY = e.touches[0].clientY - startY.value
    
    let newLeft = buttonLeft.value + moveX
    let newTop = buttonTop.value + moveY
    
    // 边界限制 - 确保按钮不会超出屏幕
    // 水平限制 - 只允许在屏幕左右两侧（各占屏幕宽度的40%）
    const centerThreshold = windowWidth.value * 0.4;
    const buttonWidthPx = uni.upx2px(buttonWidth.value);
    const buttonHeightPx = uni.upx2px(buttonHeight.value);
    
    // 左右边界限制
    newLeft = Math.max(10, Math.min(newLeft, windowWidth.value - buttonWidthPx - 20))
    // 上下边界限制 - 不能拖到最底部（留100px边距）
    newTop = Math.max(0, Math.min(newTop, windowHeight.value - buttonHeightPx - 100))
    
    buttonLeft.value = newLeft
    buttonTop.value = newTop
    
    startX.value = e.touches[0].clientX
    startY.value = e.touches[0].clientY
  }

// 触摸结束，实现吸附效果
  const onTouchEnd = () => {
    // 吸附效果 - 靠近左右边缘和底部时吸附
    const snapThreshold = 50; // 距离边缘多少像素时触发吸附
    const buttonWidthPx = uni.upx2px(buttonWidth.value);
    const buttonHeightPx = uni.upx2px(buttonHeight.value);
  
    // 靠近左边吸附
    if (buttonLeft.value < snapThreshold) {
      buttonLeft.value = 10;
    }
    // 靠近右边吸附
    else if (buttonLeft.value > windowWidth.value - buttonWidthPx - snapThreshold) {
      buttonLeft.value = windowWidth.value - buttonWidthPx - 20;
    }
    
    // 靠近底部吸附
    if (buttonTop.value > windowHeight.value - buttonHeightPx - snapThreshold - 100) {
      buttonTop.value = windowHeight.value - buttonHeightPx - 60;
    }
  }

// 加载更多
const loadMore = () => {
  scrollTop.value = 500
  fetchProducts()
}

// 页面加载时获取初始数据
onMounted(() => {
  initButtonPosition();
  uni.showLoading({
    title: '拼命加载中...'
  })
  scrollTop.value = 0
  // 先获取分类
  fetchCategories()
    .then(() => {
      // 再获取商品
      fetchProducts()
    })
})
</script>

<style scoped lang="scss">
.product-list-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.loading-fixed {
  position: fixed;
  bottom: 30rpx;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999;
}

.search-container {
  padding: 16rpx;
  background-color: #f5f5f5;
  flex-shrink: 0;
  box-sizing: border-box;
  margin-top: 90rpx;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  width: calc(100% - 175rpx);
}

.search-button {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  min-width: 120rpx;
}

.uv-vtabs {
  flex: 1;
  box-sizing: border-box;
}

.uv-vtabs-item {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding-bottom: 210rpx;
  height: 100%;
  position: relative;
}

::v-deep .uv-empty {
  height: 100%;
}

.loading-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  padding: 20rpx 0;
}

.tab-content::-webkit-scrollbar {
  display: none;
}

.product-grid {
  height: auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12rpx;
  padding: 12rpx;
  box-sizing: border-box;
}

/* 确保页面根元素无默认边距 */
page,
.product-list-page {
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.product-item {
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 22rpx;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
  margin: 0;
  background-color: #fff;
  box-sizing: border-box;
  height: auto;
}

.product-item:hover {
  transform: translateY(-6rpx);
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.12);
}

.product-image {
  width: 100%;
  height: 240rpx !important;
  border-radius: 12rpx;
  position: relative;
  overflow: hidden;
}

::v-deep .uv-image__loading {
  height: 240rpx !important;
}

.product-info {
  width: 100%;
  margin-left: 0;
  padding-top: 12rpx;
}

.product-desc {
  font-size: 22rpx;
  margin-bottom: 8rpx;
  line-height: 28rpx;
}

.product-sales {
  margin-bottom: 12rpx;
}

.add-to-cart {
  height: 64rpx;
  line-height: 64rpx;
  font-size: 26rpx;
}

.product-title {
  font-size: 32rpx;
  line-height: 44rpx;
  margin-bottom: 10rpx;
  font-weight: 600;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-price {
  font-size: 36rpx;
  color: #ff4d4f;
  font-weight: bold;
  margin-right: 10rpx;
}

.add-to-cart {
  width: 100%;
  height: 76rpx;
  line-height: 76rpx;
  font-size: 30rpx;
  background-color: #ff4d4f;
  color: white;
  border-radius: 10rpx;
  margin-top: 8rpx;
  transition: background-color 0.3s;
}

.add-to-cart:hover {
  background-color: #ff3333;
}

.product-image .uv-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-badge {
  position: absolute;
  top: 12rpx;
  left: 12rpx;
  background: #ff4d4f;
  color: white;
  font-size: 24rpx;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
  font-weight: 500;
}

.product-info {
  width: 100%;
  margin-left: 0;
  padding-top: 16rpx;
}

.product-title {
  font-size: 30rpx;
  line-height: 42rpx;
  margin-bottom: 8rpx;
  font-weight: 500;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 32rpx;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8rpx;
}

.product-price {
  font-size: 34rpx;
  color: #ff4d4f;
  font-weight: bold;
}

.product-rating {
  font-size: 24rpx;
  color: #ffb400;
  background-color: #fff8e6;
  padding: 2rpx 8rpx;
  border-radius: 4rpx;
}

.product-sales {
  font-size: 22rpx;
  color: #999;
  margin-bottom: 16rpx;
}

.add-to-cart {
  width: 100%;
  height: 70rpx;
  line-height: 70rpx;
  font-size: 28rpx;
  background-color: #ff4d4f;
  color: white;
  border-radius: 8rpx;
}

.load-more {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx 0;
  // position: fixed;
  // bottom: 0;
  // left: 130rpx;
  // width: 100%;

  .load-more-text {
    margin-left: 10rpx;
    font-size: 28rpx;
    color: #999;
  }
}

.no-more {
  text-align: center;
  padding: 30rpx 0;
  font-size: 28rpx;
  color: #999;
}

/* 浮动添加按钮样式 */
.float-add-button {
  position: fixed;
  width: 90rpx;
  height: 90rpx;
  background-color: #ff4d4f;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.2);
  z-index: 9999;
  transition: all 0.3s ease;
}

.float-add-button:hover {
  background-color: #ff3333;
  transform: scale(1.1);
}
</style>
