import request from 'utils/request';
import { HZERO_FILE, HZERO_PLATFORM } from 'utils/config';
import { isTenantRoleLevel } from 'utils/utils';

function apiSource(params) {
  return isTenantRoleLevel() ? `${params.tenantId}/storage-configs` : `storage-configs`;
}

/**
 * 查询默认文件存储配置
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchDefaultStorage(params) {
  return request(`${HZERO_FILE}/v1/${apiSource(params)}`, {
    method: 'GET',
    query: { tenantId: params.tenantId },
  });
}

/**
 * 查询文件存储配置
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function fetchStorage(params) {
  return request(`${HZERO_FILE}/v1/${apiSource(params)}/${params.storageType}`, {
    method: 'GET',
    query: { tenantId: params.tenantId },
  });
}

/**
 * 查询文件存储配置
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 */
export async function updateStorage(params) {
  return request(`${HZERO_FILE}/v1/${apiSource(params)}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 查询文件存储配置权限控制父子值集
 * @param {Object} params - 查询参数
 */
export async function queryLdpTree(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value/tree`, {
    method: 'GET',
    query: params,
  });
}
