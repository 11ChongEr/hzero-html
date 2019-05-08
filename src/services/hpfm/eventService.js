/**
 * Event - 事件服务
 * @date: 2018-6-20
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_PLATFORM, HZERO_MSG } from 'utils/config';
import { parseParameters, isTenantRoleLevel } from 'utils/utils';

function eventApi(params = {}) {
  return isTenantRoleLevel()
    ? `${HZERO_PLATFORM}/v1/${params.tenantId}/events`
    : `${HZERO_PLATFORM}/v1/events`;
}

function messageApi(params) {
  return isTenantRoleLevel() ? `${params.tenantId}/message-events` : `message-events`;
}
/**
 * 查询事件列表.
 * @param {Object} params 查询条件
 * @returns {Object} 返回结果
 */
async function queryEvents(params = {}) {
  const query = parseParameters(params, { field: 'eventCode', order: 'asc' });
  return request(eventApi(params), {
    method: 'GET',
    query,
  });
}

/**
 * 根据ID查询具体事件数据.
 * @param {number} id 事件 ID
 * @returns {Object} 返回结果
 */
async function getEvent(params) {
  return request(`${eventApi(params)}/${params.id}`);
}

/**
 * 批量删除事件.
 * @param {Object} params 待删除数据
 */
async function remove(params) {
  return request(eventApi(params), {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 创建事件.
 * @param {Object} params 事件
 */
async function addEvent(params) {
  return request(eventApi(params), {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新事件.
 * @param {Object} params 事件
 */
async function updateEvent(params) {
  return request(eventApi(params), {
    method: 'PUT',
    body: params,
  });
}

/**
 * 更新事件规则.
 * @param {Object} params 事件规则
 */
async function updateRule(params) {
  return request(`${eventApi(params)}/${params.eventId}/rules`, {
    method: params.eventRuleId ? 'PUT' : 'POST',
    body: params,
  });
}

/**
 * 批量删除事件规则.
 * @param {Object} params 事件规则
 */
async function removeRule(params) {
  return request(`${eventApi(params)}/${params.eventId}/rules`, {
    method: 'DELETE',
    body: params.selectedRows,
  });
}

/**
 * 查询消息列表.
 * @param {Object} params 查询条件
 * @returns {Object} 返回结果
 */
async function queryMessages(params) {
  return request(`${HZERO_MSG}/v1/${messageApi(params)}`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 新增消息.
 * @param {Object} params 事件消息参数
 * @returns {Object} 返回结果
 */
async function createMessage(params) {
  return request(`${HZERO_MSG}/v1/${messageApi(params)}`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 更新消息
 * @param {Object} params 事件消息参数
 * @returns {Object} 返回结果
 */
async function updateMessage(params) {
  return request(`${HZERO_MSG}/v1/${messageApi(params)}`, {
    method: 'PUT',
    body: params,
  });
}
/**
 * 批量删除事件消息.
 * @param {Object} params 事件消息参数
 */
async function deleteMessages(params) {
  return request(`${HZERO_MSG}/v1/${messageApi(params)}/batch-remove`, {
    method: 'DELETE',
    body: params.messageEvents,
  });
}
export default {
  queryEvents,
  getEvent,
  remove,
  addEvent,
  updateEvent,
  updateRule,
  removeRule,
  queryMessages,
  createMessage,
  updateMessage,
  deleteMessages,
};
