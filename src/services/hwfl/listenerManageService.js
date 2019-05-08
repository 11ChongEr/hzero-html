/**
 * service - 流程设置/监听器管理
 * @date: 2018-12-20
 * @version: 1.0.0
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_WFL } from 'utils/config';
import { parseParameters } from 'utils/utils';
import { queryIdpValue } from '../api';

/**
 * 获取监听事件的值集
 * @async
 * @function queryStatus
 */
export async function queryEvent() {
  return queryIdpValue('HWFL.LISTENER_EVENT');
}
/**
 * 获取事务状态的值集
 * @async
 * @function queryStatus
 */
export async function queryTransactionState() {
  return queryIdpValue('HWFL.TRANSACTION');
}
/**
 * 获取流程分类
 * @async
 * @function searchCategory
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function searchCategory(params) {
  return request(`${HZERO_WFL}/v1/${params.tenantId}/process/categories`, {
    method: 'GET',
    query: { ...params },
  });
}
/**
 * 数据查询
 * @async
 * @function fetchListenerList
 * @param {object} params,tenantId - 查询条件
 * @param {!number} tenantId - 租户id
 * @param {?string} params.category - 流程类别
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchListenerList(params) {
  const { tenantId, ...otherParams } = params;
  const param = parseParameters(otherParams);
  return request(`${HZERO_WFL}/v1/${tenantId}/process/listener`, {
    method: 'GET',
    query: param,
  });
}
/**
 * 流程分类改变获取服务任务
 * @async
 * @function searchServiceTask
 * @param {object} params - 查询条件
 * @param {!number} params.tenantId - 租户id
 * @param {?string} params.category - 流程类别
 * @returns {object} fetch Promise
 */
export async function searchServiceTask(params) {
  return request(`${HZERO_WFL}/v1/${params.tenantId}/external/header/all`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 流程分类改变获取流程变量选项
 * @async
 * @function searchVariableOptions
 * @param {object} params,tenantId - 查询条件
 * @param {!number} tenantId - 租户id
 * @param {?string} params.category - 流程类别
 * @returns {object} fetch Promise
 */
export async function searchVariableOptions(params) {
  return request(`${HZERO_WFL}/v1/${params.tenantId}/process/variable/all`, {
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
  return request(`${HZERO_WFL}/v1/${params.tenantId}/external/header/all`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 服务任务改变获取动态参数
 * @async
 * @function searchParameters
 * @param {object} params - 查询条件
 * @param {!number} params.tenantId - 租户id
 * @param {?string} params.code - 服务任务
 * @returns {object} fetch Promise
 */
export async function searchParameters(params) {
  return request(`${HZERO_WFL}/v1/${params.tenantId}/external/line`, {
    method: 'GET',
    query: params,
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
  return request(`${HZERO_WFL}/v1/${params.tenantId}/process/listener/validation`, {
    method: 'POST',
    body: { code: params.code },
    // responseType: 'text',
  });
}
/**
 * 添加任务监听信息
 * @async
 * @function createListener
 * @param {object} params,tenantId - 请求参数
 * @param {object} tenantId - 租户id
 * @param {!object} params.code - 编码
 * @param {!string} params.description - 描述
 * @param {?number} params.parameterType - 类型
 * @param {!string} params.category - 流程分类
 * @param {!number} params.scope - 数据范围
 * @returns {object} fetch Promise
 */
export async function createListener(tenantId, params) {
  return request(`${HZERO_WFL}/v1/${tenantId}/process/listener`, {
    method: 'POST',
    body: { tenantId, ...params },
  });
}

/**
 * 编辑任务监听信息
 * @async
 * @function editListener
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
export async function editListener(tenantId, listenerId, params) {
  return request(`${HZERO_WFL}/v1/${tenantId}/process/listener/${listenerId}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除任务监听信息
 * @async
 * @function deleteListener
 * @param {object} params,tenantId,listenerId - 请求参数
 * @param {number} listenerId - listenerId
 * @param {number} tenantId - 租户id
 * @returns {object} fetch Promise
 */
export async function deleteListener(params) {
  const { tenantId, listenerId, record } = params;
  return request(`${HZERO_WFL}/v1/${tenantId}/process/listener/${listenerId}`, {
    method: 'DELETE',
    body: record,
  });
}
