/**
 * service - 流程设置/审批权限管理
 * @date: 2018-8-20
 * @version: 1.0.0
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_WFL } from 'utils/config';
import { parseParameters } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${HZERO_WFL}/v1`;

/**
 * 数据查询
 * @async
 * @function fetchApproveList
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.category - 流程类别
 * @param {?string} params.code - 条件编码
 * @param {?string} params.description - 条件描述
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchApproveList(params) {
  const param = parseParameters(params);
  const { tenantId, ...others } = param;
  return request(`${prefix}/${tenantId}/expression/header`, {
    method: 'GET',
    query: others,
  });
}
/**
 * 条件头查询
 * @async
 * @function fetchApproveHeader
 * @param {object} params - 查询条件
 * @param {?string} params.expressionDefinitionId - 条件Id
 * @param {?string} params.tenantId - 租户ID
 * @returns {object} fetch Promise
 */
export async function fetchApproveHeader(params) {
  return request(`${prefix}/${params.tenantId}/expression/header/single-by-options`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 条件行查询
 * @async
 * @function fetchApproveLine
 * @param {object} params - 查询条件
 * @param {?string} params.headerId - 条件头Id
 * @param {?string} params.tenantId - 租户ID
 * @returns {object} fetch Promise
 */
export async function fetchApproveLine(params) {
  return request(`${prefix}/${params.tenantId}/expression/line/${params.headerId}`, {
    method: 'GET',
  });
}
/**
 * 删除审核权限规则（行）
 * @async
 * @function deleteLine
 * @param {object} params - 请求参数
 * @param {!string} params.tenantId - 租户ID
 * @param {!object} params.lineId - 规则ID
 */
export async function deleteLine(params) {
  const { tenantId, lineId, record } = params;
  return request(`${prefix}/${tenantId}/expression/line/${lineId}`, {
    method: 'DELETE',
    body: record,
  });
}

/**
 * 新增
 * @async
 * @function saveHeader
 * @param {object} params - 请求参数
 * @param {!string} params.tenantId - 租户ID
 * @param {!object} params.dto - 跳转条件对象
 * @param {!Array} params.dto.lines - 条件规则
 */
export async function saveHeader(params) {
  return request(`${prefix}/${params.tenantId}/expression/header`, {
    method: 'POST',
    body: { ...params.dto },
  });
}

/**
 * 更新
 * @async
 * @function updateHeader
 * @param {object} params - 请求参数
 * @param {!string} params.tenantId - 租户ID
 * @param {!string} params.headerId - 规则ID
 * @param {!object} params.dto - 跳转条件对象
 * @param {!Array} params.dto.lines - 条件规则
 */
export async function updateHeader(params) {
  return request(`${prefix}/${params.tenantId}/expression/header/${params.headerId}`, {
    method: 'PUT',
    body: { ...params.dto },
  });
}
/**
 * 条件编码唯一性校验
 * @async
 * @function checkUniqueCode
 * @param {*} params - 请求参数
 * @param {!string} params.tenantId - 租户ID
 * @param {!object} params.code - 权限编码
 */

export async function checkUniqueCode(params) {
  return request(`${prefix}/${params.tenantId}/expression/check`, {
    method: 'GET',
    query: { code: params.code },
    // responseType: 'text',
  });
}
export async function fetchProcessCategory(params) {
  return request(`${prefix}/${params.tenantId}/process/categories`, {
    method: 'GET',
  });
}

/**
 * 删除条件头
 * @async
 * @function deleteHeader
 * @param {object} params - 请求参数
 * @param {!string} params.tenantId - 租户ID
 * @param {!string} params.headerId - 规则ID
 */
export async function deleteHeader(params) {
  const { tenantId, headerId, record } = params;
  return request(`${prefix}/${tenantId}/expression/header/${headerId}`, {
    method: 'DELETE',
    body: record,
  });
}

/**
 * 流程变量、数值、字符串-操作数查询
 * @async
 * @function fetchVariableOperand
 * @param {?string} params.tenantId - 租户ID
 * @returns {object} fetch Promise
 */
export async function fetchVariableOperand(params) {
  return request(`${prefix}/${params.tenantId}/process/variable/all`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 远程服务-操作数查询
 * @async
 * @function fetchServiceOperand
 * @param {?string} params.tenantId - 租户ID
 * @returns {object} fetch Promise
 */
export async function fetchServiceOperand(params) {
  return request(`${prefix}/${params.tenantId}/external/header/all`, {
    method: 'GET',
    query: params,
  });
}
