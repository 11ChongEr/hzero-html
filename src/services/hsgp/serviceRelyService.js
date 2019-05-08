/**
 * serviceRely - 服务依赖
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
 * @function fetchServiceRelyList
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchServiceRelyList(params) {
  return request(`${HZERO_HSGP}/v1/service-relies/${params.serviceId}/${params.serviceVersionId}`, {
    method: 'GET',
  });
}

/**
 * 创建
 * @async
 * @function createServiceRely
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupNum - 集团编码
 */
export async function createServiceRely(params) {
  return request(`${HZERO_HSGP}/v1/service-relies/${params.serviceId}/${params.serviceVersionId}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除
 * @async
 * @function deleteServiceRely
 * @param {Object} params - 查询参数
 */
export async function deleteServiceRely(params) {
  return request(`${HZERO_HSGP}/v1/service-relies/${params.serviceId}/${params.serviceVersionId}`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 获取服务编码lov
 * @async
 * @param {Object} params - 查询参数
 */
export async function fetchServiceLov(params) {
  return request(
    `${HZERO_HSGP}/v1/service-relies/${params.serviceId}/${
      params.serviceVersionId
    }/exclude-services`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询依赖管理-服务
 * @async
 * @function fetchServiceCollectList
 * @param {Object} params - 查询参数
 * @param {Object} params.serviceId - 需要排除的服务id
 */
export async function fetchExcludeServiceList(params) {
  return request(`${HZERO_HSGP}/v1/service-relies/${params.serviceId}/exclude`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取依赖版本值集
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryRelyVersionList(params) {
  return request(
    `${HZERO_HSGP}/v1/service-relies/${params.serviceId}/${
      params.serviceVersionId
    }/exclude-rely-versions`,
    {
      method: 'GET',
      query: params,
    }
  );
}
