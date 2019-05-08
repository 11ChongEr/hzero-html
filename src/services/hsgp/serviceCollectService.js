/**
 * ServiceCollect - 服务汇总
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
 * @function fetchServiceCollectList
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchServiceCollectList(params) {
  return request(`${HZERO_HSGP}/v1/services`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询详细数据
 * @async
 * @function fetchServiceCollectDetail
 * @param {Object} params - 查询参数
 */
export async function fetchServiceCollectDetail(params) {
  return request(`${HZERO_HSGP}/v1/services/${params.serviceId}`, {
    method: 'GET',
  });
}

/**
 * 查询应用数据
 * @async
 * @function fetchAppLov
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchAppLov(params) {
  return request(`${HZERO_HSGP}/v1/apps`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 创建
 * @async
 * @function createServiceCollect
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupNum - 集团编码
 */
export async function createServiceCollect(params) {
  return request(`${HZERO_HSGP}/v1/services`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新
 * @async
 * @function updateServiceCollect
 * @param {Object} params - 查询参数
 */
export async function updateServiceCollect(params) {
  return request(`${HZERO_HSGP}/v1/services`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除
 * @async
 * @function deleteServiceCollect
 * @param {Object} params - 查询参数
 */
export async function deleteServiceCollect(params) {
  return request(`${HZERO_HSGP}/v1/services`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 启用
 * @async
 * @param {Object} params - 查询参数
 */
export async function enabledServiceCollect(params) {
  return request(`${HZERO_HSGP}/v1/services`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 禁用
 * @async
 * @param {Object} params - 查询参数
 */
export async function disabledServiceCollect(params) {
  return request(`${HZERO_HSGP}/v1/services`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 查询服务及版本值集，父子值集
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryWithVersion(params) {
  return request(`${HZERO_HSGP}/v1/services/with-version/value-set`, {
    method: 'GET',
    query: params,
  });
}
