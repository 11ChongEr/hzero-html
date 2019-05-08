import request from 'utils/request';
import { HZERO_HSGP } from 'utils/config';

/**
 * 查询列表数据
 * @async
 * @function fetchPortalAssign
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchNodeRule(params) {
  return request(`${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-rules`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询启用状态下的列表数据
 * @async
 * @function fetchPortalAssign
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchNodeRuleEnabled(params) {
  return request(
    `${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-rules/enabled-rules`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询详细数据
 * @async
 * @function fetchNodeRuleDetails
 * @param {Object} params - 查询参数
 */
export async function fetchNodeRuleDetails(params) {
  return request(
    `${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-rules/${params.nodeRuleId}`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询租户
 * @async
 * @function fetchTenantList
 * @param {Object} params - 查询参数
 */
export async function fetchTenantList(params) {
  return request(
    `${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-rules/${
      params.nodeRuleId
    }/tenants`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询租户下的用户
 * @async
 * @function fetchUserList
 * @param {Object} params - 查询参数
 */
export async function fetchUserList(params) {
  const { productEnvId, tenantId, page, size, loginName } = params;
  return request(`${HZERO_HSGP}/v1/${productEnvId}/api/${tenantId}/users`, {
    method: 'GET',
    query: { page, size, loginName },
  });
}

/**
 * 查询租户下的url
 * @async
 * @function fetchUrlList
 * @param {Object} params - 查询参数
 */
export async function fetchUrlList(params) {
  return request(`${HZERO_HSGP}/v1/${params.productEnvId}/api/urls`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 创建
 * @async
 * @function createJobInfo
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupNum - 集团编码
 */
export async function createNodeRule(params) {
  return request(`${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-rules`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新
 * @async
 * @function updateJobGlue
 * @param {Object} params - 查询参数
 */
export async function updateNodeRule(params) {
  return request(`${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-rules`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 启用
 * @async
 * @function enabledNodeRule
 * @param {Object} params - 查询参数
 */
export async function enabledNodeRule(params) {
  return request(`${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-rules/enabled`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 禁用
 * @async
 * @function disabledNodeRule
 * @param {Object} params - 查询参数
 * @param {string} params.nodeRuleId - 节点组规则ID
 */
export async function disabledNodeRule(params) {
  return request(
    `${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-rules/disabled`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 删除租户
 * @async
 * @function deleteTenant
 */
export async function deleteTenant(params) {
  return request(`${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-rules/tenants`, {
    method: 'DELETE',
    body: [params],
  });
}

/**
 * 删除节点组规则
 * @async
 * @function deleteTenant
 * @param {String} params.nodeRuleId - 节点组规则ID
 */
export async function deleteNodeRule(params) {
  return request(`${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-rules`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询租户下 Lov - lov用
 * @async
 * @function fetchTenantLovList
 * @param {Object} params - 查询参数
 */
export async function fetchTenantLovList(params) {
  return request(`${HZERO_HSGP}/v1/${params.productEnvId}/api/tenants`, {
    method: 'GET',
    query: params,
  });
}
