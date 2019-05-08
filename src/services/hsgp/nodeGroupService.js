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
export async function fetchNodeGroup(params) {
  const { productId, productEnvId, ...other } = params;
  return request(`${HZERO_HSGP}/v1/${productId}/${productEnvId}/node-groups`, {
    method: 'GET',
    query: other,
  });
}

/**
 * 查询详情数据
 * @async
 * @function fetchNodeGroupDetail
 * @param {Object} params - 查询参数
 */
export async function fetchNodeGroupDetail(params) {
  return request(
    `${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-groups/${
      params.nodeGroupId
    }/detail`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询节点组规则数据 - lov用
 * @async
 * @function fetchInstance
 * @param {object} params - 请求参数
 */
export async function fetchRuleList(params) {
  return request(
    `${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-groups/${
      params.nodeGroupId
    }/rules`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询灰度规则数据 - lov用
 * @async
 * @function fetchInstance
 * @param {object} params - 请求参数
 */
export async function fetchGrayRuleList(params) {
  return request(
    `${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-groups/${
      params.nodeGroupId
    }/gray-rules`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询实例配置数据
 * @async
 * @function fetchInstanceConfig
 * @param {String} [params.appId] - 应用ID
 * @param {String} [params.appVersionId] - 版本ID
 * @param {String} [params.envId] - 环境ID
 */
export async function fetchInstanceConfig(params) {
  return request(
    `${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-groups/instance-config`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 新建
 * @async
 * @function createNodeGroup
 * @param {Object} params - 查询参数
 */
export async function createNodeGroup(params) {
  return request(`${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-groups`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 编辑
 * @async
 * @function updateNodeGroup
 * @param {Object} params - 查询参数
 */
export async function updateNodeGroup(params) {
  return request(`${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-groups/update`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 停止实例
 * @async
 * @function stopNodeGroup
 * @param {Object} params - 查询参数
 * @param {string} params.envId - 环境ID
 * @param {nodeGroupId} params.nodeGroupId - 节点组ID
 */
export async function stopNodeGroup(params) {
  return request(`${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-groups/stop`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 重启实例
 * @async
 * @function restartNodeGroup
 * @param {Object} params - 查询参数
 */
export async function restartNodeGroup(params) {
  return request(
    `${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-groups/restart`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 删除实例
 * @async
 * @function deleteNodeGroup
 * @param {Object} params - 查询参数
 */
export async function deleteNodeGroup(params) {
  return request(`${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-groups/delete`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 灰度完成
 * @async
 * @function grayComplete
 * @param {Object} params - 查询参数
 */
export async function grayComplete(params) {
  return request(
    `${HZERO_HSGP}/v1/${params.productId}/${params.productEnvId}/node-groups/gray-complete`,
    {
      method: 'POST',
      body: params,
    }
  );
}
