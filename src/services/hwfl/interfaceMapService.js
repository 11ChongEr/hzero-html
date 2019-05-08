/**
 * service - 流程设置/接口映射
 * @date: 2018-8-15
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
 * @function fetchInterfaceMap
 * @param {object} params,tenantId - 查询条件
 * @param {!number} tenantId - 租户id
 * @param {?string} params.code - 接口编码
 * @param {!number} params.serviceId - 服务Id
 * @param {?string} params.description - 接口说明
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchInterfaceMap(params) {
  const { tenantId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${HZERO_WFL}/v1/${tenantId}/interface-mappings`, {
    method: 'GET',
    query: param,
  });
}

/**
 * 添加接口映射信息
 * @async
 * @function createInterfaceMap
 * @param {object} params,tenantId - 请求参数
 * @param {object} tenantId - 租户id
 * @param {?string} params.code - 接口编码
 * @param {!number} params.serviceId - 服务编码
 * @param {?string} params.description - 接口说明
 * @param {?string} params.url - 接口地址
 * @param {!number} params.scope - 数据范围
 * @returns {object} fetch Promise
 */
export async function createInterfaceMap(tenantId, params) {
  return request(`${HZERO_WFL}/v1/${tenantId}/interface-mappings`, {
    method: 'POST',
    body: { tenantId, ...params },
  });
}

/**
 * 编辑接口映射信息
 * @async
 * @function editInterfaceMap
 * @param {object} params,tenantId,interfaceMappingId - 请求参数
 * @param {object} tenantId - 租户id
 * @param {?string} params.code - 接口编码
 * @param {!number} params.serviceId - 服务编码
 * @param {?string} params.description - 接口说明
 * @param {?string} params.url - 接口地址
 * @param {!number} params.scope - 数据范围
 * @param {!string} params.interfaceMappingId - interfaceMappingId
 * @param {!string} params.objectVersionNumber - 版本号
 * @returns {object} fetch Promise
 */
export async function editInterfaceMap(tenantId, interfaceMappingId, params) {
  return request(`${HZERO_WFL}/v1/${tenantId}/interface-mappings/${interfaceMappingId}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除接口映射信息
 * @async
 * @function deleteInterfaceMap
 * @param {object} params,tenantId,interfaceMappingId - 请求参数
 * @param {number} interfaceMappingId - interfaceMappingId
 * @param {number} tenantId - 租户id
 * @param {?string} params.code - 接口编码
 * @param {!number} params.serviceId - 服务编码
 * @param {?string} params.description - 接口说明
 * @param {?string} params.url - 接口地址
 * @param {!number} params.scope - 数据范围
 * @param {!string} params.objectVersionNumber - 版本号
 * @returns {object} fetch Promise
 */
export async function deleteInterfaceMap(tenantId, interfaceMappingId, params) {
  return request(`${HZERO_WFL}/v1/${tenantId}/interface-mappings/${interfaceMappingId}`, {
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
  return request(`${HZERO_WFL}/v1/${params.tenantId}/interface-mappings/check`, {
    method: 'POST',
    body: { code: params.code },
    // responseType: 'text',
  });
}
