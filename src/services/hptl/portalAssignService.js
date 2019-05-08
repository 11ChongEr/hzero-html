import request from 'utils/request';
import { HZERO_PTL } from 'utils/config';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

function assignApi() {
  return isTenantRoleLevel() ? `${tenantId}/portal-assigns` : 'portal-assigns';
}

function templateApi() {
  return isTenantRoleLevel() ? `${tenantId}/templates-configs` : 'templates-configs';
}

/**
 * 查询门户分配列表数据
 * @async
 * @function fetchPortalAssign
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchPortalAssign(params) {
  return request(`${HZERO_PTL}/v1/${assignApi()}`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 创建门户分配
 * @async
 * @function createPortalAssign
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupNum - 集团编码
 * @param {String} params.groupName - 集团名称
 * @param {String} params.companyNum - 公司编码
 * @param {String} params.companyName - 公司名称
 * @param {String} params.webUrl - 二级域名
 * @param {String} params.tenantId - 租户ID
 */
export async function createPortalAssign(params) {
  return request(`${HZERO_PTL}/v1/${assignApi()}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 修改门户分配信息
 * @async
 * @function updatePortalAssign
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupId - 集团ID
 * @param {String} params.groupNum - 集团编码
 * @param {String} params.groupName - 集团名称
 * @param {String} params.companyId - 公司ID
 * @param {String} params.companyNum - 公司编码
 * @param {String} params.companyName - 公司名称
 * @param {String} params.webUrl - 二级域名
 * @param {String} params.tenantId - 租户ID
 */
export async function updatePortalAssign(params) {
  return request(`${HZERO_PTL}/v1/${assignApi()}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 查询模板配置头数据
 * @async fetchTemplatesConfigData
 * @param {Object} params - 查询参数
 * @param {String} [params.assignId] - 门户分配ID
 */
export async function fetchTemplatesConfigData(params) {
  return request(`${HZERO_PTL}/v1/${templateApi()}/detail`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询模板配置行数据
 * @async
 * @function fetchTemplateConfigList
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchTemplateConfigList(params) {
  return request(`${HZERO_PTL}/v1/${templateApi()}/${params.assignId}`, {
    method: 'GET',
  });
}

/**
 * 启用模板
 * @async
 * @function enableTemplate
 * @param {Object} params - 查询参数
 * @param {String} [params.configId] - 配置ID
 */
export async function enableTemplate(params) {
  return request(`${HZERO_PTL}/v1/${templateApi()}/default`, {
    method: 'PUT',
    body: params,
  });
}
/**
 * 查询可访问租户列表
 * @async
 * @function enableTenantIdList
 * @param {Object} params - 查询参数
 * @param {String} [params.tenantId] - 租户ID
 */
export async function enableTenantIdList(params) {
  return request(`${HZERO_PTL}/v1/portal-assigns/self`, {
    method: 'GET',
    query: params,
  });
}
