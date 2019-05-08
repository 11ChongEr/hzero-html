/**
 * category - 流程设置/流程分类
 * @date: 2018-8-21
 * @version: 1.0.0
 * @author: CJ <juan.chen01@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_WFL } from 'utils/config';
import { parseParameters } from 'utils/utils';

/**
 * 数据查询
 * @async
 * @function fetchCategories
 * @param {object} params,organizationId - 查询条件
 * @param {!number} organizationId - 租户id
 * @param {?string} params.code - 流程分类编码
 * @param {?string} params.description - 流程分类描述
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchCategories(params) {
  const { organizationId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${HZERO_WFL}/v1/${organizationId}/process/categories`, {
    method: 'GET',
    query: { ...param },
  });
}

/**
 * 添加流程分类信息
 * @async
 * @function createCategories
 * @param {object} params,organizationId - 请求参数
 * @param {object} organizationId - 租户id
 * @param {?string} params.code - 流程分类编码
 * @param {?string} params.description - 流程分类描述
 * @returns {object} fetch Promise
 */
export async function createCategories(organizationId, params) {
  return request(`${HZERO_WFL}/v1/${organizationId}/process/categories`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 编辑流程分类信息
 * @async
 * @function editCategories
 * @param {object} params,organizationId,processCategoryId - 请求参数
 * @param {object} organizationId - 租户id
 * @param {?string} params.code - 流程分类编码
 * @param {?string} params.description - 流程分类描述
 * @param {!string} params.processCategoryId - processCategoryId
 * @param {!string} params.objectVersionNumber - 版本号
 * @returns {object} fetch Promise
 */
export async function editCategories(organizationId, processCategoryId, params) {
  return request(`${HZERO_WFL}/v1/${organizationId}/process/categories/${processCategoryId}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除流程分类信息
 * @async
 * @function deleteCategories
 * @param {object} params,organizationId,processCategoryId - 请求参数
 * @param {number} processCategoryId - processVariableId
 * @param {number} organizationId - 租户id
 * @param {?string} params.code - 流程分类编码
 * @param {?string} params.description - 流程分类描述
 * @param {!string} params.objectVersionNumber - 版本号
 * @returns {object} fetch Promise
 */
export async function deleteCategories(organizationId, processCategoryId, params) {
  return request(`${HZERO_WFL}/v1/${organizationId}/process/categories/${processCategoryId}`, {
    method: 'DELETE',
    body: params,
  });
}
