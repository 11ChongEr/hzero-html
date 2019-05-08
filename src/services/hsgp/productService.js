/**
 * Product - 产品汇总
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
 * @function fetchProductsList
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchProductList(params) {
  return request(`${HZERO_HSGP}/v1/products`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询详情数据
 * @async
 * @function fetchProductsDetail
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchProductDetail(params) {
  return request(`${HZERO_HSGP}/v1/products/${params.productId}`);
}

/**
 * 查询简要列表数据
 * @async
 * @function fetchSimpleProductList
 */
export async function fetchSimpleProductList() {
  return request(`${HZERO_HSGP}/v1/products/simple`);
}

/**
 * 创建
 * @async
 * @function createProducts
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupNum - 集团编码
 */
export async function createProduct(params) {
  return request(`${HZERO_HSGP}/v1/products`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新
 * @async
 * @function updateProducts
 * @param {Object} params - 查询参数
 */
export async function updateProduct(params) {
  return request(`${HZERO_HSGP}/v1/products`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除
 * @async
 * @function deleteProducts
 * @param {Object} params - 查询参数
 */
export async function deleteProduct(params) {
  return request(`${HZERO_HSGP}/v1/products`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询产品及版本
 * @async
 * @function queryProductWithVersion
 */
export async function queryProductWithVersion(params = {}) {
  return request(`${HZERO_HSGP}/v1/products/with-version/value-set`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询产品及其环境
 * @async
 * @function queryProductWithEnv
 */
export async function queryProductWithEnv(params = {}) {
  return request(`${HZERO_HSGP}/v1/products/with-env/value-set`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询产品及版本下的服务及版本 - 值集
 * @async
 * @function queryProductWithEnv
 */
export async function queryServiceWithProduct(params = {}) {
  return request(
    `${HZERO_HSGP}/v1/product-services/${params.productId}/${
      params.productVersionId
    }/with-version/value-set`,
    {
      method: 'GET',
      query: params,
    }
  );
}
