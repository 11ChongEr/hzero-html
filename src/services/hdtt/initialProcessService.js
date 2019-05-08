/**
 * service - 数据初始化
 * @date: 2018-8-7
 * @version: 1.0.0
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_DTT } from 'utils/config';
import { parseParameters } from 'utils/utils';
// const HZERO_DTT_TEST = `/hdtt-16353`;
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${HZERO_DTT}/v1`;

/**
 * 数据查询
 * @async
 * @function searchList
 * @param {object} params - 查询条件
 * @param {?string} params.consumerService - 服务编码
 * @param {?string} params.createTable - 分发表
 * @param {?string} params.tenantId - 租户Id
 * @param {?string} params.processDate - 处理日期
 * @param {?string} params.processStatus - 处理状态
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */
export async function searchList(params) {
  return request(`${prefix}/init-sql-processes`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
/**
 * 处理明细查询
 * @async
 * @function searchDetail
 * @param {object} params - 请求参数
 * @param {!number} params.sqlProcessId - 处理ID
 * @returns {object} fetch Promise
 */
export async function searchDetail(params) {
  return request(`${prefix}/init-sql-processes/${params.sqlProcessId}`, {
    method: 'GET',
  });
}
/**
 *  初始化租户处理
 * @async
 * @function searchTenantProcess
 * @param {object} params - 查询条件
 * @param {?string} params.sqlProcessId - 初始化处理ID
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */
export async function searchTenantProcess(params) {
  return request(`${prefix}/init-tenant-processes`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 初始化DB处理
 * @async
 * @function searchDBProcess
 * @param {object} params - 查询条件
 * @param {?string} params.sqlProcessId - 初始化处理ID
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */
export async function searchDBProcess(params) {
  return request(`${prefix}/init-db-processes`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 数据保存
 * @async
 * @function save
 * @param {Array} params - 保存数据列表
 * @returns {object} fetch Promise
 */
export async function save(params) {
  return request(`${prefix}/init-sql-processes`, {
    method: 'POST',
    body: [...params.saveData],
  });
}

/**
 * 租户处理-提交处理
 * @async
 * @function submit
 * @param {object} params - 请求参数
 * @param {Array} params.data - 保存数据列表
 * @param {number} params.sqlProcessId - 初始化处理ID
 * @returns {object} fetch Promise
 */
export async function submit(params) {
  return request(`${prefix}/init-tenant-processes/submit/${params.sqlProcessId}`, {
    method: 'POST',
    body: [...params.data],
  });
}

/**
 * 租户处理-异步提交处理
 * @async
 * @function asyncSubmit
 * @param {object} params - 请求参数
 * @param {Array} params.data - 保存数据列表
 * @param {number} params.sqlProcessId - 初始化处理ID
 * @returns {object} fetch Promise
 */
export async function asyncSubmit(params) {
  return request(`${prefix}/init-tenant-processes/asyn-process-submit/${params.sqlProcessId}`, {
    method: 'POST',
    body: [...params.data],
  });
}

/**
 * 租户处理-保存
 * @async
 * @function saveTenantProcess
 * @param {Array} params - 删除数据列表
 * @returns {object} fetch Promise
 */
export async function saveTenantProcess(params) {
  return request(`${prefix}/init-tenant-processes`, {
    method: 'POST',
    body: [...params.saveData],
  });
}
/**
 * 租户处理-删除
 * @async
 * @function deleteTenantProcess
 * @param {Array} params - 删除数据列表
 * @returns {object} fetch Promise
 */
export async function deleteTenantProcess(params) {
  return request(`${prefix}/init-tenant-processes`, {
    method: 'DELETE',
    body: [...params.dataList],
  });
}
