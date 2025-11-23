// 基础请求封装
const baseUrl = import.meta.env.VITE_BASE_URL;

/**
 * 基础请求函数
 * @param {string} url - 请求URL
 * @param {string} method - 请求方法
 * @param {Object} data - 请求数据
 * @param {Object} options - 额外选项
 * @returns {Promise}
 */
export const request = (url, method, data = {}, options = {}) => {
  return new Promise((resolve, reject) => {
    // 获取token
    const token = uni.getStorageSync('token') || '';

    // 构建请求头
    const header = {
      'content-type': 'application/json',
      ...options.header,
    };

    // 如果有token，添加到请求头
    if (token) {
      header['Authorization'] = `Bearer ${token}`;
    }

    uni.request({
      url: `${baseUrl}${url}`,
      method,
      data,
      header,
      timeout: options.timeout || 10000,
      success: (res) => {
        // 处理响应
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 200-299范围内的状态码都视为成功
          if (res.data.success) {
            resolve(res.data);
          } else {
            // 显示错误信息
            uni.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            });
            reject(res.data);
          }
        } else if (res.statusCode === 401) {
          // 未授权，跳转到登录页
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          });
          setTimeout(() => {
            uni.reLaunch({
              url: '/pages/login/index'
            });
          }, 1500);
          reject({ message: '未授权' });
        } else {
          // 其他错误
          uni.showToast({
            title: `请求错误: ${res.statusCode}`,
            icon: 'none'
          });
          reject(res);
        }
      },
      fail: (err) => {
        console.log('请求失败', err);
        // 网络错误
        uni.showToast({
          title: '网络异常，请稍后重试',
          icon: 'none'
        });
        reject(err);
      },
      complete: () => {
        // 完成回调
        if (options.complete) {
          options.complete();
        }
      }
    });
  });
};

/**
 * GET请求
 * @param {string} url - 请求URL
 * @param {Object} params - 请求参数
 * @param {Object} options - 额外选项
 * @returns {Promise}
 */
export const get = (url, params = {}, options = {}) => {
  return request(url, 'GET', params, options);
};

/**
 * POST请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} options - 额外选项
 * @returns {Promise}
 */
export const post = (url, data = {}, options = {}) => {
  return request(url, 'POST', data, options);
};

/**
 * PUT请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} options - 额外选项
 * @returns {Promise}
 */
export const put = (url, data = {}, options = {}) => {
  return request(url, 'PUT', data, options);
};

/**
 * DELETE请求
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} options - 额外选项
 * @returns {Promise}
 */
export const del = (url, data = {}, options = {}) => {
  return request(url, 'DELETE', data, options);
};