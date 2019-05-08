/**
 * service - 流程设置/消息服务管理
 * @date: 2018-8-21
 * @version: 1.0.0
 * @author: CJ <juan.chen01@hand-china.com>
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
 * 消息服务列表数据查询
 * @async
 * @function fetchMessageList
 * @param {object} params - 查询条件
 * @param {!string} params.tenantId - 租户ID
 * @param {?string} params.code - 编码
 * @param {?string} params.description - 条件描述
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchMessageList(params) {
  const { tenantId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${prefix}/${params.tenantId}/external/header`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 消息头查询
 * @async
 * @function fetchMessageHeader
 * @param {object} params - 查询条件
 * @param {?string} params.externalDefinitionId - 审核规则Id
 * @param {?string} params.tenantId - 租户ID
 * @returns {object} fetch Promise
 */

export async function fetchMessageHeader(params) {
  return request(
    `${prefix}/${params.tenantId}/external/header-line/${params.expressionDefinitionId}`,
    {
      method: 'GET',
    }
  );
}
/**
 * 删除消息服务
 * @async
 * @function deleteHeader
 * @param {object} params - 请求参数
 * @param {!string} params.tenantId - 租户ID
 * @param {!object} params.externalDefinitionId - 审核规则ID
 */
export async function deleteHeader(params) {
  const { tenantId, externalDefinitionId, record } = params;
  return request(`${prefix}/${tenantId}/external/${externalDefinitionId}`, {
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
 * @param {!object} params.dto - 待保存对象
 * @param {!Array} params.dto.parameters - 参数行
 */
export async function saveHeader(params) {
  return request(`${prefix}/${params.tenantId}/external`, {
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
 * @param {!string} params.externalDefinitionId - 审核规则ID
 * @param {!object} params.dto - 待保存对象
 * @param {!Array} params.dto.parameters - 参数行
 */
export async function updateHeader(params) {
  return request(`${prefix}/${params.tenantId}/external/${params.externalDefinitionId}`, {
    method: 'PUT',
    body: { ...params.dto },
  });
}
/**
 * 删除行参数
 * @async
 * @function deleteLine
 * @param {object} params - 请求参数
 * @param {!string} params.tenantId - 租户ID
 * @param {!object} params.recordParameterId - 参数ID
 */
export async function deleteLine(params) {
  const { tenantId, recordParameterId, record } = params;
  return request(`${prefix}/${tenantId}/external/line/${recordParameterId}`, {
    method: 'DELETE',
    body: record,
  });
}
/**
 * 编码唯一性校验
 * @async
 * @function checkUniqueCode
 * @param {*} params - 请求参数
 * @param {!string} params.tenantId - 租户ID
 * @param {!object} params.code - 编码
 */
export async function checkUniqueCode(params) {
  return request(`${prefix}/${params.tenantId}/external/header/validation`, {
    method: 'POST',
    body: { code: params.code, type: params.type },
    // responseType: 'text',
  });
}
/**
 * 接口映射
 * @async
 * @function fetchInterfaceMap
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchInterfaceMap(params) {
  return request(`${HZERO_WFL}/v1/${params.tenantId}/interface-mappings/all`, {
    method: 'GET',
  });
}
