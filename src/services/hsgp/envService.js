import request from 'utils/request';
import { HZERO_HSGP } from 'utils/config';

/**
 * 查询列表数据
 * @function fetchEnv
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 * @param {String} params.envCode - 环境编码
 * @param {String} params.envName - 环境名称
 */
export async function fetchEnv(params) {
  return request(`${HZERO_HSGP}/v1/envs`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 获取某个环境配置信息
 * @function fetchEnvConfigInfo
 * @param {Object} params - 查询参数
 * @param {number} params.envId - 环境id
 */
export async function fetchEnvConfigInfo(params) {
  return request(`${HZERO_HSGP}/v1/envs/${params.envId}/config`, {
    method: 'GET',
  });
}

/**
 * 获取某个环境基本信息
 * @function fetchEnvBasicInfo
 * @param {Object} params - 查询参数
 * @param {number} params.envId - 环境id
 */
export async function fetchEnvBasicInfo(params) {
  return request(`${HZERO_HSGP}/v1/envs/${params.envId}`, {
    method: 'GET',
  });
}

/**
 * 创建环境
 * @function createEnv
 * @param {Object} params - 环境参数
 * @param {string} params.envCode - 环境编码
 * @param {string} params.envName - 环境名称
 * @param {string} params.description - 描述
 * @param {number} params.orderSeq - 序号
 * @param {string} params.devopsEnvId - 绑定环境的id
 * @param {string} params.devopsEnvName - 绑定环境的名称
 * @param {string} params.CLIENT_ID - 客户端ID
 * @param {string} params.CLIENT_SECRET - 客户端密钥
 * @param {string} params.GRANT_TYPE - 授权类型
 * @param {string} params.OAUTH_USERNAME - 认证用户名
 * @param {string} params.OAUTH_PASSWORD - 认证密码
 * @param {string} params.TENANT_QUERY_API - 租户查询地址
 * @param {string} params.USER_QUERY_API - 用户查询地址
 * @param {string} params.URL_QUERY_API - URL查询地址
 * @param {string} params.CONTEXT_PATH - 网关地址
 * @param {string} params.COMMON_REQUEST_PARAMS - 通用请求参数
 * @param {string} params.COMMON_URI_PARAMS - 通用URI参数
 */
export async function createEnv(params) {
  return request(`${HZERO_HSGP}/v1/envs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新环境
 * @function updateEnv
 * @param {Object} params - 环境参数
 * @param {Object} params - 环境参数
 * @param {string} params.envCode - 环境编码
 * @param {string} params.envName - 环境名称
 * @param {string} params.description - 描述
 * @param {number} params.orderSeq - 序号
 * @param {string} params.devopsEnvId - 绑定环境的id
 * @param {string} params.devopsEnvName - 绑定环境的名称
 * @param {string} params.CLIENT_ID - 客户端ID
 * @param {string} params.CLIENT_SECRET - 客户端密钥
 * @param {string} params.GRANT_TYPE - 授权类型
 * @param {string} params.OAUTH_USERNAME - 认证用户名
 * @param {string} params.OAUTH_PASSWORD - 认证密码
 * @param {string} params.TENANT_QUERY_API - 租户查询地址
 * @param {string} params.USER_QUERY_API - 用户查询地址
 * @param {string} params.URL_QUERY_API - URL查询地址
 * @param {string} params.CONTEXT_PATH - 网关地址
 * @param {string} params.COMMON_REQUEST_PARAMS - 通用请求参数
 * @param {string} params.COMMON_URI_PARAMS - 通用URI参数
 */
export async function updateEnv(params) {
  return request(`${HZERO_HSGP}/v1/envs`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除环境
 * @function deleteEnv
 * @param {Object} params - 环境数据
 * @param {string} params.envCode -环境编码
 * @param {number} params.envId -环境id
 * @param {string} params.envName -环境名称
 * @param {string} params.description -描述
 * @param {number} params.orderSeq -序号
 * @param {string} params.devopsEnvName -DevOps环境
 * @param {number} params.activeFlag -环境状态
 * @param {number} params.connectFlag -连接状态
 */
export async function deleteEnv(params) {
  return request(`${HZERO_HSGP}/v1/envs`, {
    method: 'DELETE',
    body: params,
  });
}
