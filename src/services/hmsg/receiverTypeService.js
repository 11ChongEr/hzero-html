/**
 * service - 接收者类型维护
 * @date: 2018-7-26
 * @version: 0.0.1
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_MSG } from 'utils/config';
import { parseParameters, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

function receiverApi() {
  return isTenantRoleLevel() ? `${tenantId}/receiver-types` : 'receiver-types';
}

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${HZERO_MSG}/v1`;

/**
 * 查询接收者类型列表数据
 * @async
 * @function fetchReceiverType
 * @param {object} params - 查询条件
 * @param {?string} params.typeCode - 类型编码
 * @param {?string} params.typeName - 描述
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchReceiverType(params) {
  const param = parseParameters(params);
  return request(`${prefix}/${receiverApi()}`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 更新接收者类型信息
 * @async
 * @function updateReceiverType
 * @param {object} params - 请求参数
 * @param {!object} params.data - 更新对象
 * @param {!string} params.data.apiUrl - URL
 * @param {?number} params.data.enabledFlag - 启用标记
 * @param {!string} params.data.routeName - 服务
 * @param {!number} params.data.tenantId - 租户ID
 * @param {!string} params.data.typeCode - 类型编码
 * @param {!string} params.data.typeName - 描述
 * @returns {object} fetch Promise
 */

export async function updateReceiverType(params) {
  return request(`${prefix}/${receiverApi()}`, {
    method: 'PUT',
    body: { ...params },
  });
}

/**
 * 添加接收者类型信息
 * @async
 * @function addReceiverType
 * @param {object} params - 请求参数
 * @param {!object} params.data - 保存对象
 * @param {!string} params.data.apiUrl - URL
 * @param {?number} params.data.enabledFlag - 启用标记
 * @param {!string} params.data.routeName - 服务
 * @param {!number} params.data.tenantId - 租户ID
 * @param {!string} params.data.typeCode - 类型编码
 * @param {!string} params.data.typeName - 描述
 * @returns {object} fetch Promise
 */
export async function addReceiverType(params) {
  return request(`${prefix}/${receiverApi()}`, {
    method: 'POST',
    body: { ...params },
  });
}
