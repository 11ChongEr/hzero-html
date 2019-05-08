/**
 * ServiceManage - 服务管理
 * @date: 2018-1-23
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_HCNF } from 'utils/config';

import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

function manageApi() {
  return isTenantRoleLevel() ? `${tenantId}/services` : `services`;
}

/**
 * 查询列表数据
 * @async
 * @function fetchServiceManageList
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchServiceManageList(params) {
  return request(`${HZERO_HCNF}/v1/${manageApi()}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询详细数据
 * @async
 * @function fetchServiceManageDetail
 * @param {Object} params - 查询参数
 */
export async function fetchServiceManageDetail(params) {
  return request(`${HZERO_HCNF}/v1/${manageApi()}/${params.serviceId}`, {
    method: 'GET',
  });
}

/**
 * 创建
 * @async
 * @function createServiceCollect
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupNum - 集团编码
 */
export async function createService(params) {
  return request(`${HZERO_HCNF}/v1/${manageApi()}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新
 * @async
 * @function updateServiceCollect
 * @param {Object} params - 查询参数
 */
export async function updateService(params) {
  return request(`${HZERO_HCNF}/v1/${manageApi()}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除
 * @async
 * @function deleteServiceCollect
 * @param {Object} params - 查询参数
 */
export async function deleteService(params) {
  return request(`${HZERO_HCNF}/v1/${manageApi()}`, {
    method: 'DELETE',
    body: params,
  });
}
