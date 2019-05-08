/**
 * apiManage - api管理
 * @date: 2018-11-27
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_HSGP } from 'utils/config';

/**
 * 查询列表数据
 * @async
 * @function fetchApiManageList
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchApiManageList(params) {
  return request(`${HZERO_HSGP}/v1/service-apis/${params.serviceId}/${params.serviceVersionId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询详情数据
 * @async
 * @function fetchApiManageDetail
 * @param {Object} params - 查询参数
 */
export async function fetchApiManageDetail(params) {
  return request(`${HZERO_HSGP}/v1/service-apis/${params.apiId}`);
}

/**
 * 刷新 Api
 * @async
 * @function refreshApi
 * @param {Object} params - 查询参数
 */
export async function refreshApi(params) {
  return request(
    `${HZERO_HSGP}/v1/service-apis/${params.serviceId}/${params.serviceVersionId}/refresh`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 更新
 * @async
 * @function updateApiManage
 * @param {Object} params - 查询参数
 */
export async function updateApiManage(params) {
  return request(`${HZERO_HSGP}/v1/app-sources`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除
 * @async
 * @function deleteApiManage
 * @param {Object} params - 查询参数
 */
export async function deleteApiManage(params) {
  return request(`${HZERO_HSGP}/v1/app-sources`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 禁用
 * @async
 * @function disabledApiManage
 * @param {Object} params - 查询参数
 */
export async function disabledApiManage(params) {
  return request(`${HZERO_HSGP}/v1/app-sources/disabled`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 启用
 * @async
 * @function disabledApiManage
 * @param {Object} params - 查询参数
 */
export async function enabledApiManage(params) {
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
