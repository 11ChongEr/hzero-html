/**
 * service - 待办事情列表
 * @date: 2018-8-14
 * @version: 1.0.0
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_WFL, HZERO_PLATFORM } from 'utils/config';
import { getUrlParam, parseParameters } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${HZERO_WFL}/v1`;
const hpfmFix = `${HZERO_PLATFORM}/v1`;

/**
 * 数据查询
 * @async
 * @function searchTaskList
 * @param {object} params - 查询条件
 * @param {!string} params.tenantId - 租户ID
 * @param {?number} params.processDefinitionId - 流程ID
 * @param {?string} params.name - 流程名称
 * @param {?string} params.createdBefore - 创建时间从
 * @param {?string} params.createdAfter - 创建时间至
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchTaskList(params) {
  const param = parseParameters(params);
  const { tenantId, ...others } = param;
  return request(`${prefix}/${tenantId}/activiti/task/query`, {
    method: 'POST',
    body: others,
  });
}

export async function fetchEmployeeList(params) {
  const strParam = getUrlParam(params);
  return request(`${hpfmFix}/lovs/sql/data${strParam}`, {
    method: 'GET',
  });
}

/**
 * 明细
 * @async
 * @function searchTaskList
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.id - 待办事项ID
 * @returns {object} fetch Promise
 */
export async function searchDetail(params) {
  return request(`${prefix}/${params.tenantId}/activiti/task/${params.id}`, {
    method: 'GET',
  });
}
/**
 * 流程图上表格数据
 * @async
 * @function searchTaskList
 * @param {object} params - 查询条件
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.id - 待办事项ID
 * @returns {object} fetch Promise
 */
export async function fetchForecast(params) {
  return request(`${prefix}/${params.tenantId}/process/instance/forecast/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 审批
 * @async
 * @function searchTaskList
 * @param {object} params - 保存条件
 * @param {?string} params.tenantId - 租户ID
 * @param {?string} params.id - 待办事项ID
 * @returns {object} fetch Promise
 */
export async function saveTask(params) {
  const { tenantId, currentTaskId, ...others } = params;
  return request(`${prefix}/${tenantId}/runtime/tasks/${currentTaskId}`, {
    method: 'POST',
    body: { ...others, currentTaskId },
  });
}
