/**
 * deployPlatform - 部署平台
 * @date: 2018-11-19
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_HSGP } from 'utils/config';

/**
 * 查询列表数据
 * @async
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchDeployPlatformList(params) {
  return request(`${HZERO_HSGP}/v1/deploy-platforms`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询详细数据
 * @async
 * @param {Object} params - 查询参数
 */
export async function fetchDeployPlatformDetail(params) {
  return request(`${HZERO_HSGP}/v1/deploy-platforms/${params.deployPlatformId}`, {
    method: 'GET',
  });
}

/**
 * 查询启用状态的部署平台 - lov
 * @async
 */
export async function queryEnabledPlatformLov(params = {}) {
  return request(`${HZERO_HSGP}/v1/deploy-platforms/enabled-platform`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 创建
 * @async
 * @param {Object} params - 请求参数
 */
export async function createDeployPlatform(params) {
  return request(`${HZERO_HSGP}/v1/deploy-platforms`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新
 * @async
 * @param {Object} params - 查询参数
 */
export async function updateDeployPlatform(params) {
  return request(`${HZERO_HSGP}/v1/deploy-platforms`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除
 * @async
 * @param {Object} params - 查询参数
 */
export async function deleteDeployPlatform(params) {
  return request(`${HZERO_HSGP}/v1/deploy-platforms`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 启用
 * @async
 * @param {Object} params - 查询参数
 */
export async function enabledDeployPlatform(params) {
  return request(`${HZERO_HSGP}/v1/deploy-platforms/enabled`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 禁用
 * @async
 * @param {Object} params - 查询参数
 */
export async function disabledDeployPlatform(params) {
  return request(`${HZERO_HSGP}/v1/deploy-platforms/disabled`, {
    method: 'POST',
    body: params,
  });
}
