/**
 * Version - 产品汇总-版本管理
 * @date: 2018-11-28
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_HSGP } from 'utils/config';

/**
 * 查询列表数据
 * @async
 * @function fetchProductVersionList
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchProductVersionList(params) {
  return request(`${HZERO_HSGP}/v1/product-versions/${params.productId}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询详情数据
 * @async
 * @function fetchProductVersionDetail
 * @param {Object} params - 查询参数
 */
export async function fetchProductVersionDetail(params) {
  return request(
    `${HZERO_HSGP}/v1/product-versions/${params.productId}/${params.productVersionId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 根据产品查询产品版本 - 值集
 * @async
 * @function queryProductWithVersion
 * @param {Object} params - 查询参数
 */
export async function queryProductWithVersion(params) {
  return request(`${HZERO_HSGP}/v1/product-versions/${params.productId}/value-set`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 创建
 * @async
 * @function createProductVersion
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupNum - 集团编码
 */
export async function createProductVersion(params) {
  return request(`${HZERO_HSGP}/v1/product-versions/${params.productId}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新
 * @async
 * @function updateProductVersion
 * @param {Object} params - 查询参数
 */
export async function updateProductVersion(params) {
  return request(`${HZERO_HSGP}/v1/product-versions/${params.productId}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除
 * @async
 * @function deleteProductVersion
 * @param {Object} params - 查询参数
 */
export async function deleteProductVersion(params) {
  return request(`${HZERO_HSGP}/v1/product-versions/${params.productId}`, {
    method: 'DELETE',
    body: params,
  });
}
