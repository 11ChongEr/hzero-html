/**
 * appSource - 应用来源
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
 * @function fetchAppSourceList
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchAppSourceList(params) {
  return request(`${HZERO_HSGP}/v1/app-sources`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询详情数据
 * @async
 * @function fetchAppSourceDetail
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchAppSourceDetail(params) {
  return request(`${HZERO_HSGP}/v1/app-sources/${params.appSourceId}`, {
    method: 'GET',
  });
}

/**
 * 查询值集- hsgp 通用值集
 * @async
 * @function fetchAppSourceDetail
 * @param {Object} params - 查询参数
 */
export async function fetchCommonValueSet(params) {
  return request(`${HZERO_HSGP}/v1/common/value-set`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 创建
 * @async
 * @function createAppSource
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupNum - 集团编码
 */
export async function createAppSource(params) {
  return request(`${HZERO_HSGP}/v1/app-sources`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新
 * @async
 * @function updateAppSource
 * @param {Object} params - 查询参数
 */
export async function updateAppSource(params) {
  return request(`${HZERO_HSGP}/v1/app-sources`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除
 * @async
 * @function deleteAppSource
 * @param {Object} params - 查询参数
 */
export async function deleteAppSource(params) {
  return request(`${HZERO_HSGP}/v1/app-sources`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 禁用
 * @async
 * @function disabledAppSource
 * @param {Object} params - 查询参数
 */
export async function disabledAppSource(params) {
  return request(`${HZERO_HSGP}/v1/app-sources/disabled`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 启用
 * @async
 * @function disabledAppSource
 * @param {Object} params - 查询参数
 */
export async function enabledAppSource(params) {
  return request(`${HZERO_HSGP}/v1/app-sources/enabled`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取来源lov - lov
 * @async
 * @param {Object} params - 查询参数
 */
export async function fetchSourceLov(params) {
  return request(`${HZERO_HSGP}/v1/app-sources/enabled-source`, {
    method: 'GET',
    query: params,
  });
}
