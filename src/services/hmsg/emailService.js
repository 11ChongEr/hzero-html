import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import request from 'utils/request';
import { HZERO_MSG } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

/**
 * 查询邮箱账户数据
 * @async
 * @function fetchEmailData
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.tenantId - 租户ID
 * @param {String} params.serverCode - 消息模板编码
 * @param {String} params.serverName - 消息模板名称
 */
export async function fetchEmail(params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_MSG}/v1/${organizationId}/email/servers`
      : `${HZERO_MSG}/v1/email/servers`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 查询邮箱账户服务器配置项
 * @async
 * @function fetchEmailData
 * @param {Object} params - 查询参数
 * @param {String} params.serverId - 邮箱账号Id
 */
export async function queryEmailServers(params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_MSG}/v1/${organizationId}/email/servers/${params.serverId}`
      : `${HZERO_MSG}/v1/email/servers/${params.serverId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 新建邮箱账户
 * @async
 * @function fetchEmailData
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.port - 端口
 * @param {String} params.sender - 发送人
 * @param {String} params.serverCode - 账户代码
 * @param {String} params.serverName - 账户名称
 * @param {String} params.serverId - 服务器ID
 * @param {String} params.host -邮件服务器
 * @param {String} params.tenantId - 租户ID
 * @param {String} params.tenantName - 租户名称
 * @param {String} params.tryTimes - 重试次数
 * @param {String} params.userName - 用户名称
 * @param {String} params.password - 密码
 * @param {Array} params.emailProperties - 服务器配置属性
 * @param {String} params.emailProperties.propertyCode - 属性编码
 * @param {String} params.emailProperties.propertyId - 属性ID
 * @param {String} params.emailProperties.propertyValue - 属性值
 * @param {String} params.emailProperties.serverId - 服务器ID
 * @param {String} params.emailProperties.tenantId - 租户ID
 */
export async function createEmail(params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_MSG}/v1/${organizationId}/email/servers`
      : `${HZERO_MSG}/v1/email/servers`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 更新邮箱账户
 * @async
 * @function fetchEmailData
 * @param {Object} params - 查询参数
 * @param {String} params.page - 页码
 * @param {String} params.size - 页数
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.port - 端口
 * @param {String} params.sender - 发送人
 * @param {String} params.serverCode - 账户代码
 * @param {String} params.serverName - 账户名称
 * @param {String} params.serverId - 服务器ID
 * @param {String} params.host -邮件服务器
 * @param {String} params.tenantId - 租户ID
 * @param {String} params.tenantName - 租户名称
 * @param {String} params.tryTimes - 重试次数
 * @param {String} params.userName - 用户名称
 * @param {String} params.password - 密码
 * @param {Array} params.emailProperties - 服务器配置属性
 * @param {String} params.emailProperties.propertyCode - 属性编码
 * @param {String} params.emailProperties.propertyId - 属性ID
 * @param {String} params.emailProperties.propertyValue - 属性值
 * @param {String} params.emailProperties.serverId - 服务器ID
 * @param {String} params.emailProperties.tenantId - 租户ID
 */
export async function updateEmail(params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_MSG}/v1/${organizationId}/email/servers`
      : `${HZERO_MSG}/v1/email/servers`,
    {
      method: 'PUT',
      body: params,
    }
  );
}
