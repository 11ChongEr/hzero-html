/**
 * service - 流程监控
 * @date: 2018-8-14
 * @version: 1.0.0
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_WFL, HZERO_PLATFORM } from 'utils/config';
import { parseParameters, getUrlParam } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${HZERO_WFL}/v1`;

export async function fetchEmployeeList(params) {
  const strParam = getUrlParam(params);
  return request(`${HZERO_PLATFORM}/v1/lovs/sql/data${strParam}`, {
    method: 'GET',
  });
}

/**
 * 数据查询
 * @async
 * @function searchTaskList
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchMonitorList(params) {
  const param = parseParameters(params);
  const { tenantId, ...others } = param;
  return request(`${prefix}/${tenantId}/process/instance/monitor/query`, {
    method: 'POST',
    body: others,
  });
}

/**
 * 详情
 * @async
 * @function fetchDetail
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.id - 流程ID
 * @returns {object} fetch Promise
 */
export async function fetchDetail(params) {
  return request(`${prefix}/${params.tenantId}/instance/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 流程图上表格数据
 * @async
 * @function fetchForecast
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.id - 流程ID
 * @returns {object} fetch Promise
 */
export async function fetchForecast(params) {
  return request(`${prefix}/${params.tenantId}/process/instance/forecast/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 挂起详情
 * @export
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.processInstanceId - 流程ID
 * @returns
 */
export async function fetchExceptionDetail(params) {
  return request(`${prefix}/${params.tenantId}/process/exception/${params.processInstanceId}`, {
    method: 'POST',
  });
}

/**
 * 终止流程
 * @async
 * @function stopProcess
 * @param {String} params.tenantId - 当前的租户ID
 * @param {String} params.processInstanceId - 流程ID
 */
export async function stopProcess(params) {
  return request(`${prefix}/${params.tenantId}/runtime/prc/end/${params.processInstanceId}`, {
    method: 'GET',
  });
}

/**
 * 恢复流程
 * @async
 * @function resumeProcess
 * @param {String} params.tenantId - 当前的租户ID
 * @param {String} params.processInstanceId - 流程ID
 */
export async function resumeProcess(params) {
  return request(`${prefix}/${params.tenantId}/runtime/prc/active/${params.processInstanceId}`, {
    method: 'GET',
  });
}

/**
 * 挂起流程
 * @async
 * @function suspendProcess
 * @param {String} params.tenantId - 当前的租户ID
 * @param {String} params.processInstanceId - 流程ID
 */
export async function suspendProcess(params) {
  return request(`${prefix}/${params.tenantId}/runtime/prc/suspend/${params.processInstanceId}`, {
    method: 'GET',
  });
}

/**
 * 查询有效的节点
 * @async
 * @function fetchValidNode
 * @param {String} params.tenantId - 当前的租户ID
 * @param {String} params.processInstanceId - 流程ID
 */
export async function fetchValidNode(params) {
  return request(`${prefix}/${params.tenantId}/definition/user-tasks/${params.processInstanceId}`, {
    method: 'GET',
  });
}

/**
 * 审批重试
 * @async
 * @function retryProcess
 * @param {String} params.tenantId - 当前的租户ID
 * @param {String} params.processInstanceId - 流程ID
 */
export async function retryProcess(params) {
  return request(`${prefix}/${params.tenantId}/runtime/execute/retry`, {
    method: 'POST',
    body: params.taskRetryList,
  });
}

/**
 * 转交
 * @async
 * @function retryProcess
 * @param {String} params.tenantId - 当前的租户ID
 * @param {String} params.processInstanceId - 流程ID
 */
export async function delegateProcess(params) {
  const { tenantId, processInstanceId, employeeCode, ...others } = params;
  return request(`${prefix}/${tenantId}/runtime/execute/${processInstanceId}`, {
    method: 'POST',
    query: { employeeCode },
    body: others,
  });
}

/**
 * 跳转
 * @async
 * @function retryProcess
 * @param {String} params.tenantId - 当前的租户ID
 * @param {String} params.processInstanceId - 流程ID
 */
export async function jumpProcess(params) {
  const { tenantId, processInstanceId, ...others } = params;
  return request(`${prefix}/${tenantId}/runtime/execute/${processInstanceId}`, {
    method: 'POST',
    body: others,
  });
}
