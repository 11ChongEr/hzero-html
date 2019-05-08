/**
 * ldapService.js - LDAP service
 * @date: 2018-12-20
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_IAM } from 'utils/config';

/**
 * 查询LDAP数据
 * @param {Object} params - 查询参数
 */
export async function fetchLDAP(params) {
  return request(`${HZERO_IAM}/v1/organizations/${params.tenantId}/ldaps`, {
    method: 'GET',
  });
}
/**
 * 更新LDAP
 * @param {Object} params
 */
export async function updateLDAP(params) {
  const { tenantId, id, ...others } = params;
  return request(`${HZERO_IAM}/v1/organizations/${tenantId}/ldaps/${id}`, {
    method: 'POST',
    body: others,
  });
}
/**
 * 连接测试
 * @param {Object} params
 */
export async function testConnect(params) {
  const { tenantId, id, ...others } = params;
  return request(`${HZERO_IAM}/v1/organizations/${tenantId}/ldaps/${id}/test_connect`, {
    method: 'POST',
    body: others,
  });
}
/**
 * 禁用LDAP
 * @param {Object} params
 */
export async function disabledLDAP(params) {
  const { tenantId, id } = params;
  return request(`${HZERO_IAM}/v1/organizations/${tenantId}/ldaps/${id}/disable`, {
    method: 'PUT',
  });
}
/**
 * 启用LDAP
 * @param {Object} params
 */
export async function enabledLDAP(params) {
  const { tenantId, id } = params;
  return request(`${HZERO_IAM}/v1/organizations/${tenantId}/ldaps/${id}/enable`, {
    method: 'PUT',
  });
}
/**
 * 查询数据同步信息
 * @param {Object} params - 查询参数
 */
export async function fetchSyncInfo(params) {
  const { tenantId, id } = params;
  return request(`${HZERO_IAM}/v1/organizations/${tenantId}/ldaps/${id}/latest_history`, {
    method: 'GET',
    responseType: 'text',
  });
}
/**
 * 同步用户
 * @param {Object} params
 */
export async function syncUser(params) {
  const { tenantId, id } = params;
  return request(`${HZERO_IAM}/v1/organizations/${tenantId}/ldaps/${id}/sync_users`, {
    method: 'POST',
  });
}
/**
 * 停止同步用户
 * @param {Object} params
 */
export async function stopSyncUser(params) {
  const { tenantId, id } = params;
  return request(`${HZERO_IAM}/v1/organizations/${tenantId}/ldaps/${id}/stop`, {
    method: 'PUT',
  });
}
