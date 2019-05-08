/**
 * ProductEnv - 环境管理
 * @date: 2018-11-30
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_HSGP } from 'utils/config';

/**
 * 查询列表数据
 * @async
 * @function fetchProductEnvList
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchProductEnvList(params) {
  return request(`${HZERO_HSGP}/v1/product-envs/${params.productId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询详情数据
 * @async
 * @function fetchProductEnvDetail
 * @param {Object} params - 查询参数
 */
export async function fetchProductEnvDetail(params) {
  return request(`${HZERO_HSGP}/v1/product-envs/${params.productId}/${params.productEnvId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询猪齿鱼环境列表
 * @async
 * @function queryCherodonEnvList
 * @param {Object} params - 查询参数
 */
export async function queryCherodonEnvList(params) {
  return request(`${HZERO_HSGP}/v1/product-envs/${params.productId}/devops-envs`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 创建
 * @async
 * @function createProductEnv
 * @param {object} params - 请求参数
 */
export async function createProductEnv(params) {
  return request(`${HZERO_HSGP}/v1/product-envs/${params.productId}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新
 * @async
 * @function updateProductEnv
 * @param {object} params - 请求参数
 */
export async function updateProductEnv(params) {
  return request(`${HZERO_HSGP}/v1/product-envs/${params.productId}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除
 * @async
 * @function deleteProductEnv
 * @param {Object} params - 查询参数
 */
export async function deleteProductEnv(params) {
  return request(`${HZERO_HSGP}/v1/product-envs/${params.productId}`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 启用
 * @async
 * @function enabledProductEnv
 * @param {object} params - 请求参数
 */
export async function enabledProductEnv(params) {
  return request(`${HZERO_HSGP}/v1/product-envs/${params.productId}/enabled`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 禁用
 * @async
 * @function disabledProductEnv
 * @param {object} params - 请求参数
 */
export async function disabledProductEnv(params) {
  return request(`${HZERO_HSGP}/v1/product-envs/${params.productId}/disabled`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询产品版本值集
 * @async
 * @function queryVersionValueSet
 * @param {Object} params - 查询参数
 */
export async function queryVersionValueSet(params) {
  return request(`${HZERO_HSGP}/v1/product-envs/${params.productId}/version-value-set`, {
    method: 'GET',
  });
}

/**
 * 查询产品环境- 值集
 * @async
 * @function queryVersionValueSet
 * @param {Object} params - 查询参数
 */
export async function queryProductWithEnv(params) {
  return request(`${HZERO_HSGP}/v1/product-envs/${params.productId}/value-set`, {
    method: 'GET',
  });
}
