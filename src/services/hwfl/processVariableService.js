/**
 * service - 流程设置/流程变量
 * @date: 2018-8-15
 * @version: 1.0.0
 * @author: CJ <juan.chen01@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_WFL } from 'utils/config';
import { parseParameters } from 'utils/utils';
import { queryIdpValue } from '../../services/api';

/**
 * 获取流程分类
 * @async
 * @function queryCategories
 * @param {object} tenantId - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryCategories(tenantId) {
  return request(`${HZERO_WFL}/v1/${tenantId}/process/categories`, {
    method: 'GET',
    query: tenantId,
  });
}
/**
 * 获取变量类型的值集
 * @async
 * @function queryTypeList
 */
export async function queryTypeList() {
  return queryIdpValue('HWFL.PROCESS_VARIABLE_TYPE');
}
/**
 * 数据查询
 * @async
 * @function searchVariableList
 * @param {object} params,tenantId - 查询条件
 * @param {!number} tenantId - 租户id
 * @param {?string} params.category - 流程类别
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function searchVariableList(params) {
  const { tenantId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${HZERO_WFL}/v1/${tenantId}/process/variable`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 添加流程变量信息
 * @async
 * @function creatOne
 * @param {object} params,tenantId - 请求参数
 * @param {object} tenantId - 租户id
 * @param {!object} params.code - 编码
 * @param {!string} params.description - 描述
 * @param {?number} params.parameterType - 类型
 * @param {!string} params.category - 流程分类
 * @param {!number} params.scope - 数据范围
 * @returns {object} fetch Promise
 */
export async function creatOne(tenantId, params) {
  return request(`${HZERO_WFL}/v1/${tenantId}/process/variable`, {
    method: 'POST',
    body: { tenantId, ...params },
  });
}

/**
 * 编辑流程变量信息
 * @async
 * @function editOne
 * @param {object} params,tenantId,processVariableId - 请求参数
 * @param {object} tenantId - 租户id
 * @param {!object} params.code - 编码
 * @param {!string} params.description - 描述
 * @param {?number} params.parameterType - 类型
 * @param {!string} params.category - 流程分类
 * @param {!number} params.scope - 数据范围
 * @param {!string} params.processVariableId - processVariableId
 * @param {!string} params.objectVersionNumber - 版本号
 * @returns {object} fetch Promise
 */
export async function editOne(tenantId, processVariableId, params) {
  return request(`${HZERO_WFL}/v1/${tenantId}/process/variable/${processVariableId}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除流程变量信息
 * @async
 * @function deleteOne
 * @param {object} params,tenantId,processVariableId - 请求参数
 * @param {number} processVariableId - processVariableId
 * @param {number} tenantId - 租户id
 * @param {!object} params.code - 编码
 * @param {!string} params.description - 描述
 * @param {?number} params.parameterType - 类型
 * @param {!string} params.category - 流程分类
 * @param {!number} params.scope - 数据范围
 * @param {!string} params.objectVersionNumber - 版本号
 * @returns {object} fetch Promise
 */
export async function deleteOne(tenantId, processVariableId, params) {
  return request(`${HZERO_WFL}/v1/${tenantId}/process/variable/${processVariableId}`, {
    method: 'DELETE',
    body: params,
  });
}
/**
 * 条件编码唯一性校验
 * @async
 * @function checkUniqueCode
 * @param {*} params - 请求参数
 * @param {!string} params.tenantId - 租户ID
 * @param {!object} params.code - 编码
 */
export async function checkUniqueCode(params) {
  return request(`${HZERO_WFL}/v1/${params.tenantId}/process/variable/validation`, {
    method: 'POST',
    body: { code: params.code },
    // responseType: 'text',
  });
}
