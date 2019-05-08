import request from 'utils/request';
import { HZERO_HSGP } from 'utils/config';

/**
 * 查询环境数据
 * @async
 * @function fetchDefaultEnv
 * @param {Object} params - 查询参数
 */
export async function fetchDefaultEnv(params) {
  return request(`${HZERO_HSGP}/v1/envs/default`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取灰度发布列表
 * @async
 * @function fetchNodeGrayGroup
 * @param {Object} params - 查询参数
 * @param {number} params.envId - 环境id
 * @param {string} params.grayName - 灰度发布名称
 * @param {number} params.page - 请求页数
 * @param {number} params.size - 请求条数
 */
export async function fetchNodeGrayGroup(params) {
  return request(`${HZERO_HSGP}/v1/${params.envId}/node-gray-groups`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 根据灰度发布Id查询灰度节点组列表
 * @async
 * @function fetchNodeGroup
 * @param {Object} params - 查询参数
 * @param {number} params.page - 请求页数
 * @param {number} params.size - 请求条数
 * @param {number} params.envId - 环境id
 * @param {number} params.grayGroupId - 灰度id
 * @param {string} params.nodeGroupName - 应用节点组名称
 */
export async function fetchNodeGroup(params) {
  return request(
    `${HZERO_HSGP}/v1/${params.envId}/node-gray-groups/${params.grayGroupId}/node-groups`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 发布灰度
 * @async
 * @function releaseNodeGrayGroup
 * @param {Object} params - 查询参数
 * @param {number} params.envId - 环境id
 * @param {number} params.grayGroupId - 灰度id
 * @param {string} record.grayName 灰度发布名称
 * @param {string} record.groupStatus 状态
 * @param {string} record.releasedDate 发布时间
 * @param {string} record.finishedDate 结束时间
 */
export async function releaseNodeGrayGroup(params) {
  return request(`${HZERO_HSGP}/v1/${params.envId}/node-gray-groups/release`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 结束灰度
 * @async
 * @function completeNodeGrayGroup
 * @param {Object} params - 灰度数据
 * @param {number} params.envId - 环境id
 * @param {number} params.grayGroupId - 灰度id
 * @param {string} record.grayName 灰度发布名称
 * @param {string} record.groupStatus 状态
 * @param {string} record.releasedDate 发布时间
 * @param {string} record.finishedDate 结束时间
 */
export async function completeNodeGrayGroup(params) {
  return request(`${HZERO_HSGP}/v1/${params.envId}/node-gray-groups/complete`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 创建灰度发布
 * @async
 * @function addNodeGrayGroup
 * @param {Object} params - 灰度发布数据
 * @param {string} params.grayName - 灰度发布名称
 * @param {number} params.envId - 环境id
 */
export async function createNodeGrayGroup(params) {
  return request(`${HZERO_HSGP}/v1/${params.envId}/node-gray-groups`, {
    method: 'POST',
    body: {
      groupStatus: 'NEW',
      ...params,
    },
  });
}

/**
 * 停止节点组实例
 * @async
 * @function stopNodeGroup
 * @param {Object} params - 查询参数
 * @param {string} params.envId - 环境ID
 * @param {nodeGroupId} params.nodeGroupId - 节点组ID
 */
export async function stopNodeGroup(params) {
  return request(`${HZERO_HSGP}/v1/${params.envId}/node-groups/${params.nodeGroupId}/stop`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 重启节点组实例
 * @async
 * @function restartNodeGroup
 * @param {Object} params - 查询参数
 * @param {string} params.envId - 环境ID
 * @param {nodeGroupId} params.nodeGroupId - 节点组ID
 */
export async function restartNodeGroup(params) {
  return request(`${HZERO_HSGP}/v1/${params.envId}/node-groups/${params.nodeGroupId}/restart`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 删除节点组实例
 * @async
 * @function deleteNodeGroup
 * @param {Object} params - 查询参数
 * @param {string} params.envId - 环境ID
 * @param {nodeGroupId} params.nodeGroupId - 节点组ID
 */
export async function deleteNodeGroup(params) {
  return request(`${HZERO_HSGP}/v1/${params.envId}/node-groups/delete`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 获取当前环境可新增的节点组列表
 * @async
 * @function fetchNodeGrayGroup
 * @param {Object} params - 查询参数
 * @param {string} params.envId - 环境ID
 * @param {string} params.nodeGroupName - 应用节点组名称
 * @param {array} params.selectedRowKeys - 选中项的key
 */
export async function fetchNewestNodeGroup(params) {
  return request(`${HZERO_HSGP}/v1/${params.envId}/node-gray-groups/default`, {
    method: 'GET',
    query: {
      page: params.page,
      size: params.size,
      nodeGroupName: params.nodeGroupName,
    },
  });
}

/**
 * 添加灰度节点组
 * @async
 * @function saveNodeGroups
 * @param {Object} params - 查询参数
 * @param {string} params.envId - 环境ID
 * @param {nodeGroupId} params.nodeGroupId - 节点组ID
 * @param {array} params.selectedRowKeys - 选中项的key
 */
export async function saveNodeGroups(params) {
  return request(
    `${HZERO_HSGP}/v1/${params.envId}/node-gray-groups/${params.grayGroupId}/node-group`,
    {
      method: 'POST',
      body: params.selectedRowKeys,
    }
  );
}

/**
 * 删除节点组的灰度发布关系
 * @async
 * @function deleteRelation
 * @param {Object} params - 查询参数
 * @param {number} params.envId - 环境id
 * @param {number} params.grayGroupId - 灰度id
 */
export async function deleteRelation(params) {
  return request(
    `${HZERO_HSGP}/v1/${params.envId}/node-gray-groups/${params.nodeGroupId}/node-group`,
    {
      method: 'DELETE',
    }
  );
}

/**
 * 删除灰度发布
 * @async
 * @function deleteNodeGrayGroup
 * @param {Object} params - 查询参数
 * @param {number} params.envId - 环境id
 * @param {number} params.grayGroupId - 灰度id
 */
export async function deleteNodeGrayGroup(params) {
  return request(`${HZERO_HSGP}/v1/${params.envId}/node-gray-groups`, {
    method: 'DELETE',
    body: params,
  });
}
