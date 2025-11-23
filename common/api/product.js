import { get, post } from './request.js';

/**
 * 获取商品分类
 * @returns {Promise}
 */
export const getCategories = () => {
  return get('/products/categories');
};

/**
 * 创建商品
 * @param {Object} data - 商品数据
 * @param {string} data.name - 商品名称
 * @param {string} data.description - 商品描述
 * @param {number} data.price - 商品价格
 * @param {string} data.categoryId - 分类ID
 * @param {string} data.imageUrl - 图片URL
 * @returns {Promise}
 */
export const createProduct = (data) => {
  return post('/products/create', data);
};

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {string} params.search - 搜索关键词
 * @param {string} params.categoryId - 分类ID
 * @returns {Promise}
 */
export const getProducts = (params) => {
  return get('/products', params);
};

/**
 * 获取商品详情
 * @param {string|number} productId - 商品ID
 * @returns {Promise}
 */
export const getProductDetail = (productId) => {
  return get(`/products/${productId}`);
};