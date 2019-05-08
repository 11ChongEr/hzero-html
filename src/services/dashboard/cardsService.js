/**
 * expertService.js - 工作台卡片 service
 * @date: 2019-02-23
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { HZERO_MSG, HZERO_WFL, HZERO_PTL } from 'utils/config';

const organizationId = getCurrentOrganizationId();

/**
 *
 * 系统消息查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function querySystemMessage(params) {
  return request(`${HZERO_MSG}/v1/${organizationId}/messages/user/preview`, {
    method: 'GET',
    query: params,
  });
}

/**
 *
 * 工作流查询
 * @param {Object} params 查询参数
 * @export
 * @returns
 */
export async function queryWorkflow(params) {
  return request(
    `${HZERO_WFL}/v1/${organizationId}/activiti/task/query?ignoreEmployeeNotFound=true`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查询公告列表数据
 * @param {Object} params - 查询参数
 */
export async function queryAnnouncement(params) {
  return request(`${HZERO_PTL}/v1/${organizationId}/notices/page-details`, {
    method: 'GET',
    query: params,
  });
}

/**
 *改变消息为已读
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function changeRead(params) {
  return request(`${HZERO_MSG}/v1/${organizationId}/messages/user/read-flag`, {
    method: 'PATCH',
    query: params,
  });
}
