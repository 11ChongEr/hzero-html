import request from 'utils/request';
import { HZERO_PTL } from 'utils/config';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

function configApi() {
  return isTenantRoleLevel() ? `${tenantId}/templates-configs` : 'templates-configs';
}

function itemApi() {
  return isTenantRoleLevel() ? `${tenantId}/templates-config-items` : 'templates-config-items';
}

/**
 * 查询模板配置头数据
 * @async fetchTemplatesConfigData
 * @param {Object} params - 查询参数
 * @param {String} [params.assignId] - 门户分配ID
 */
export async function fetchTemplatesConfigData(params) {
  return request(`${HZERO_PTL}/v1/${configApi()}/detail`, {
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
  return request(`${HZERO_PTL}/v1/${configApi()}/${params.assignId}`, {
    method: 'GET',
  });
}

/**
 * 启用模板
 * @async
 * @function enableTemplate
 * @param {Object} params - 查询参数
 */
export async function enableTemplate(params) {
  return request(`${HZERO_PTL}/v1/${configApi()}/default`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 获取门户模板配置明细
 * @async
 * @function fetchTemplateDetail
 * @param {Object} params - 查询参数
 * @param {String} params.configId - 配置ID
 */
export async function fetchTemplateDetail(params) {
  return request(`${HZERO_PTL}/v1/${itemApi()}/${params.configId}`, {
    method: 'GET',
  });
}

/**
 * 创建门户模板配置明细
 * @async
 * @function createTemplatesConfig
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupNum - 集团编码
 * @param {String} params.groupName - 集团名称
 * @param {String} params.companyNum - 公司编码
 * @param {String} params.companyName - 公司名称
 * @param {String} params.webUrl - 二级域名
 * @param {String} params.tenantId - 租户ID
 */
export async function createTemplatesConfig(params) {
  return request(`${HZERO_PTL}/v1/${itemApi()}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除模板配置明细项
 * @async
 * @function deleteTemplatesConfig
 * @param {String} params.enabledFlag - 是否启用
 */
export async function deleteTemplatesConfig(params) {
  return request(`${HZERO_PTL}/v1/${itemApi()}`, {
    method: 'DELETE',
    body: params,
  });
}
