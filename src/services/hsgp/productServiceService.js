/**
 * ProductService - 服务组合
 * @date: 2018-11-29
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_HSGP } from 'utils/config';

/**
 * 查询列表数据
 * @async
 * @function fetchProductServiceList
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchProductServiceList(params) {
  return request(
    `${HZERO_HSGP}/v1/product-services/${params.productId}/${params.productVersionId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 创建
 * @async
 * @function createProductService
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupNum - 集团编码
 */
export async function createProductService(params) {
  return request(
    `${HZERO_HSGP}/v1/product-services/${params.productId}/${params.productVersionId}`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 删除
 * @async
 * @function deleteProductService
 * @param {Object} params - 查询参数
 */
export async function deleteProductService(params) {
  return request(
    `${HZERO_HSGP}/v1/product-services/${params.productId}/${params.productVersionId}`,
    {
      method: 'DELETE',
      body: params,
    }
  );
}

/**
 * 查询排除已经组合的服务列表
 * @async
 * @function queryProductServiceLov
 * @param {Object} params - 查询参数
 */
export async function queryProductServiceLov(params) {
  return request(
    `${HZERO_HSGP}/v1/product-services/${params.productId}/${
      params.productVersionId
    }/exclude-services`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 获取拓扑图列表
 * @async
 * @function fetchTopologyList
 * @param {Object} params - 查询参数
 */
export async function fetchTopologyList(params) {
  return request(
    `${HZERO_HSGP}/v1/product-services/${params.productId}/${params.productVersionId}/topology`,
    {
      method: 'GET',
    }
  );
}
