<template>
  <view class="add-product-page">
    <!-- 导航栏 -->
    <uv-navbar title="添加商品" :left-show="true" :border="true" @left-click="navigateBack"></uv-navbar>

    <scroll-view scroll-y class="content" style="height: calc(100vh - 90rpx);">
      <view class="form-container">
        <!-- 商品名称 -->
        <view class="form-item">
          <text class="label">商品名称</text>
          <uv-input v-model="productForm.title" placeholder="请输入商品名称" :clearable="true"></uv-input>
        </view>

        <!-- 商品描述 -->
        <view class="form-item">
          <text class="label">商品描述</text>
          <uv-textarea v-model="productForm.desc" placeholder="请输入商品描述" :auto-height="true"
            :maxlength="200"></uv-textarea>
        </view>

        <!-- 商品价格 -->
        <view class="form-item">
          <text class="label">商品价格</text>
          <uv-input v-model="productForm.price" type="number" placeholder="请输入商品价格" :clearable="true"></uv-input>
        </view>

        <!-- 商品分类 -->
        <view class="form-item">
          <text class="label">商品分类</text>
          <uv-input v-model="productForm.categoriesLabel" type="text" placeholder="请选择商品分类" readonly
            @click="openCategoriesPicker" suffixIcon="arrow-right"></uv-input>
          <uv-picker ref="categoriesRef" :columns="categories" keyName="name" placeholder="请选择商品分类"
            @confirm="handleCategoryConfirm"></uv-picker>
        </view>

        <!-- 商品图片上传 -->
        <view class="form-item">
          <text class="label">商品图片</text>
          <uv-upload :fileList="productForm.imageUrlList" @afterRead="afterRead" @delete="deletePic" name="1" multiple
            :maxCount="1" width="120" height="120"></uv-upload>
        </view>

        <!-- 提交按钮 -->
        <uv-button class="submit-button" type="primary" :loading="submitting" :disabled="submitting || !isFormValid"
          @click="submitForm">
          提交
        </uv-button>
      </view>
    </scroll-view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getCategories, createProduct } from '@/common/api/product.js'

const categoriesRef = ref(null)
// 分类数据
const categories = ref([])

// 在页面挂载时获取商品分类
onMounted(() => {
  fetchCategories()
})

// 获取商品分类
const fetchCategories = () => {
  getCategories()
    .then(res => {
      if (res.success) {
        // 假设接口返回的数据格式为 { success: true, data: [{ id: 1, name: '分类1' }, ...] }
        // 将分类数据转换为picker需要的格式
        categories.value = [res.data]
      } else {
        uni.showToast({
          title: '获取分类失败',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      console.error('获取分类失败:', err)
      uni.showToast({
        title: '网络异常，请重试',
        icon: 'none'
      })
    })
}
// 商品表单数据
const productForm = ref({
  title: '',
  desc: '',
  price: '',
  categoriesLabel: '',
  categoryId: '',
  imageUrlList: [],
})
// 提交状态
const submitting = ref(false)

/**
 * 打开分类选择器
 */
const openCategoriesPicker = () => {
  categoriesRef.value.open()
}

/**
 * 处理分类选择器确认事件
 */
const handleCategoryConfirm = (e) => {
  console.log(e)
  const { name, id } = e.value[0]
  productForm.value.categoriesLabel = name
  productForm.value.categoryId = id
}

// 表单验证
const isFormValid = computed(() => {
  return (
    productForm.value.title.trim() !== '' &&
    productForm.value.desc.trim() !== '' &&
    productForm.value.price.trim() !== '' &&
    productForm.value.categoryId !== ''
  )
})

// 返回上一页
const navigateBack = () => {
  uni.navigateBack()
}

// 删除图片
const deletePic = (event) => {
  productForm.value.imageUrlList.splice(event.index, 1);
}
// 新增图片
const afterRead = async (event) => {
  // 当设置 multiple 为 true 时, file 为数组格式，否则为对象格式
  let lists = [].concat(event.file);
  let fileListLen =  productForm.value.imageUrlList.length;
  lists.map((item) => {
    productForm.value.imageUrlList.push({
      ...item,
      status: "uploading",
      message: "上传中",
    });
  });
  for (let i = 0; i < lists.length; i++) {
    const result = await uploadFilePromise(lists[i].url);
    let item = productForm.value.imageUrlList[fileListLen];
    productForm.value.imageUrlList.splice(
      fileListLen,
      1,
      Object.assign(item, {
        status: "success",
        message: "",
        url: result,
      })
    );
    fileListLen++;
  }
  
  console.log(productForm.value.imageUrlList)
}
const uploadFilePromise = async (url) => {
  return new Promise((resolve, reject) => {
    let a = uni.uploadFile({
      url: `${import.meta.env.VITE_BASE_URL}/file-upload/single`,
      filePath: url,
      name: "file",
      formData: {},
      success: (res) => {
        console.log(JSON.parse(res.data).data.data.path)
        setTimeout(() => {
          resolve(JSON.parse(res.data).data.data.path);
        }, 1000);
      },
    });
  });
}

// 提交表单
const submitForm = async () => {
  if (!isFormValid.value) {
    uni.showToast({
      title: '请完善商品信息',
      icon: 'none'
    })
    return
  }

  submitting.value = true
  try {
    // 准备提交数据
    const submitData = {
      name: productForm.value.title,
      description: productForm.value.desc,
      price: Number(productForm.value.price),
      categoryId: productForm.value.categoryId,
      imageUrl: productForm.value.imageUrlList.length > 0 ? productForm.value.imageUrlList[0].url : ''
    }

    // 调用创建商品接口
    const res = await createProduct(submitData)

    if (res.success) {
      uni.showToast({
        title: '添加成功',
        icon: 'success'
      })

      // 返回商品列表页
      setTimeout(() => {
        navigateBack()
      }, 1500)
    } else {
      uni.showToast({
        title: res.message || '添加失败，请重试',
        icon: 'error'
      })
    }
  } catch (error) {
    console.error('添加商品失败:', error)
    uni.showToast({
      title: error.message || '添加失败，请重试',
      icon: 'error'
    })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.add-product-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

.content {
  flex: 1;
  padding: 20rpx;
  box-sizing: border-box;
  margin-top: 100rpx;
}

.form-container {
  background-color: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.form-item {
  margin-bottom: 30rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
  font-weight: 500;
}

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 20rpx;
}

.preview-item {
  width: 160rpx;
  height: 160rpx;
  position: relative;
  border-radius: 10rpx;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
}

.delete-icon {
  position: absolute;
  top: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.submit-button {
  margin-top: 40rpx;
  width: 100%;
}
</style>