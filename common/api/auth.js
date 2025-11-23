// 认证相关API
import { post } from './request.js';

/**
 * 发送验证码
 * @param {string} phone - 手机号
 * @returns {Promise}
 */
export const sendCode = (phone) => {
  return post('/auth/sendCode', {
    phone
  });
};

/**
 * 手机号密码登录
 * @param {string} phone - 手机号
 * @param {string} password - 密码
 * @returns {Promise}
 */
export const loginWithPassword = (phone, password) => {
  return post('/auth/login/password', {
    phone,
    password
  });
};

/**
 * 手机号验证码登录
 * @param {string} phone - 手机号
 * @param {string} code - 验证码
 * @returns {Promise}
 */
export const loginWithCode = (phone, code) => {
  return post('/auth/login/code', {
    phone,
    code
  });
};

/**
 * 用户注册
 * @param {string} phone - 手机号
 * @param {string} password - 密码
 * @param {string} code - 验证码
 * @returns {Promise}
 */
export const register = (phone, password, code) => {
  return post('/auth/register', {
    phone,
    password,
    code
  });
};