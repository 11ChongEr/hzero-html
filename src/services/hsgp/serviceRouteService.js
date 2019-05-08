/**
 * serviceRoute - 服务路由
 * @date: 2018-12-06
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_HSGP } from 'utils/config';

/**
 * 查询列表数据
 * @async
 * @function fetchServiceRouteList
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchServiceRouteList(params) {
  return request(`${HZERO_HSGP}/v1/service-routes/${params.productId}/${params.productEnvId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询详细数据
 * @async
 * @function fetchServiceRouteList
 * @param {Object} params - 查询参数
 */
export async function fetchServiceRouteDetail(params) {
  return request(
    `${HZERO_HSGP}/v1/service-routes/${params.productId}/${params.productEnvId}/${
      params.serviceRouteId
    }`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 创建
 * @async
 * @function createServiceRoute
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupNum - 集团编码
 */
export async function createServiceRoute(params) {
  return request(`${HZERO_HSGP}/v1/service-routes/${params.productId}/${params.productEnvId}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新
 * @async
 * @function updateServiceRoute
 * @param {Object} params - 查询参数
 */
export async function updateServiceRoute(params) {
  return request(`${HZERO_HSGP}/v1/service-routes/${params.productId}/${params.productEnvId}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除
 * @async
 * @function deleteServiceRoute
 * @param {Object} params - 查询参数
 */
export async function deleteServiceRoute(params) {
  return request(`${HZERO_HSGP}/v1/service-routes/${params.productId}/${params.productEnvId}`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 刷新服务路由
 * @async
 * @function refreshServiceRoute
 * @param {Object} params - 查询参数
 */
export async function refreshServiceRoute(params) {
  return request(
    `${HZERO_HSGP}/v1/service-routes/${params.productId}/${params.productEnvId}/refresh`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查询排除已配置路由的服务列表
 * @async
 * @function fetchExcludeRouteList
 * @param {Object} params - 查询参数
 * @param {Object} params.serviceId - 需要排除的服务id
 */
export async function fetchExcludeRouteList(params) {
  return request(
    `${HZERO_HSGP}/v1/service-routes/${params.productId}/${
      params.productEnvId
    }/exclude-configured-services`,
    {
      method: 'GET',
      query: params,
    }
  );
}
