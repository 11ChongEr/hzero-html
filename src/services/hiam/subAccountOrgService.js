import { getCurrentOrganizationId, parseParameters } from 'utils/utils';
import { HZERO_IAM, HZERO_PLATFORM } from 'utils/config';
import request from 'utils/request';

const currentOrganizationId = getCurrentOrganizationId();
/**
 * 请求快码
 * @param {String} lovCode 快码的code
 */
export async function enumSetQueryByCode(lovCode) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    method: 'GET',
    query: {
      lovCode,
    },
  });
}

/**
 * 租户级 查询当前登录用户所拥有分配权限的角色
 * @param {!Number} organizationId 租户id
 * @param {Object} params 查询信息
 * @param {String} params.phone 手机
 * @param {String} params.email 邮箱
 * @param {String} params.realName 描述
 * @param {String} params.loginName 帐号
 * @param {Number} pagination.pagination.page 分页
 * @param {Number} pagination.pagination.size 分页大小
 */
export async function querySubAccountOrgList(params) {
  const query = parseParameters(params);
  return request(`${HZERO_IAM}/hzero/v1/${currentOrganizationId}/users/paging`, {
    method: 'GET',
    query,
  });
}

/**
 * 查询当前登录用户所拥有 分配 全选的 角色
 * @param {!Number} currentOrganizationId 租户id
 */
export async function subAccountOrgRoleQueryAll(payload) {
  return request(`${HZERO_IAM}/hzero/v1/member-roles/subrole-list`, {
    method: 'GET',
    query: payload,
  });
}

/**
 * 创建一个新的帐号
 * @param {!Number} organizationId 当前租户id
 * @param {Object} user 帐号信息
 * @param {!String} user.realName 描述
 * @param {!String} user.email 邮箱
 * @param {!String} user.phone 手机号码
 * @param {!String} user.password 密码
 * @param {!String} user.anotherPassword 确认密码
 * @param {!String} user.startDateActive 有效日期从
 * @param {String} user.endDateActive 有效日期至
 * @param {String} user.locker 冻结
 * @param {Object[]} user.memberRoleList 角色信息
 * @param {Number|String} user.memberRoleList[].assignLevel 层级 快码对应的标记的 Number
 * @param {String} user.memberRoleList[].assignLevelValue 层级值 快码对应的 value
 * @param {Number} user.memberRoleList[].roleId 角色id
 */
export async function subAccountOrgCreateOne(user) {
  return request(`${HZERO_IAM}/hzero/v1/${currentOrganizationId}/users`, {
    body: user,
    method: 'POST',
  });
}

/**
 * 查询 子帐号详情
 * @param {Number} userId - 帐号id
 */
export async function subAccountOrgQuery(userId) {
  return request(`${HZERO_IAM}/hzero/v1/${currentOrganizationId}/users/${userId}/info`, {
    method: 'GET',
  });
}

/**
 * 更新帐号
 * @param {!Number} organizationId 当前租户id
 * @param {Object} user 帐号信息
 * @param {!String} user.realName 描述
 * @param {!String} user.email 邮箱
 * @param {!String} user.phone 手机号码
 * @param {String} [user.password] 密码
 * @param {String} [user.anotherPassword] 确认密码
 * @param {!String} user.startDateActive 有效日期从
 * @param {String} user.endDateActive 有效日期至
 * @param {String} user.locker 冻结
 * @param {Object[]} user.memberRoleList 角色信息
 * @param {Number|String} user.memberRoleList[].assignLevel 层级 快码对应的标记的 Number
 * @param {String} user.memberRoleList[].assignLevelValue 层级值 快码对应的 value
 * @param {Number} user.memberRoleList[].roleId 角色id
 */
export async function subAccountOrgUpdateOne(user) {
  return request(`${HZERO_IAM}/hzero/v1/${currentOrganizationId}/users`, {
    body: user,
    method: 'PUT',
  });
}

/**
 * 查询当前租户下的用户所拥有的角色
 * @param {!Number} currentOrganizationId 租户id
 * @param {!Number} userId 用户id
 */
export async function subAccountOrgRoleCurrent({ userId, ...params }) {
  const parsedParams = parseParameters(params);
  return request(`${HZERO_IAM}/hzero/v1/${currentOrganizationId}/member-roles/${userId}`, {
    method: 'GET',
    query: parsedParams,
  });
}

/**
 * 查询组织
 * @param {Number} currentOrganizationId 租户id
 * @param {Object} params 其他参数
 * @return {Promise<Object>}
 */
export async function queryUnitsTree(params) {
  return request(`${HZERO_IAM}/hzero/v1/${currentOrganizationId}/hrunits/tree`, {
    query: params,
  });
}

/**
 * 修改密码
 * @param {!Number} id - 帐号 id
 * @param {!Number} organizationId - 租户id
 * @param {!Object} body
 * @param {!String} body.originalPassword - 原密码
 * @param {!String} body.password - 密码
 * @param {!String} query
 * @param {!Number} query.organizationId - 用户 租户id
 */
export async function subAccountOrgUpdatePassword(id, organizationId, body, query) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/users/${id}/admin-password`, {
    body,
    query,
    method: 'PUT',
  });
}

/**
 * 修改密码
 * @param {Object} params 验证信息
 * @param {String} params.password 新密码
 * @param {String} params.originalPassword 旧密码
 */
export async function subAccountOrgUpdateSelfPassword({ password, originalPassword }) {
  return request(`${HZERO_IAM}/hzero/v1/users/password`, {
    method: 'PUT',
    body: {
      originalPassword,
      password,
    },
  });
}

/**
 * 解锁用户
 * @param {Number} userId 用户id
 * @param {Number} organizationId 用户 租户 id
 */
export async function subAccountSiteUserUnlock(userId, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/users/${userId}/unlocked`, {
    method: 'POST',
  });
}

/**
 * 删除角色
 * @param {Number} memberRoleList 用户角色列表
 */
export async function deleteRoles(memberRoleList) {
  return request(`${HZERO_IAM}/hzero/v1/${currentOrganizationId}/member-roles`, {
    method: 'DELETE',
    body: memberRoleList,
  });
}

/**
 * 查询 可分配的用户组
 * @param {number} params.tenantId - 用户所属租户id
 * @param {number} params.name - 角色名
 * @param {number} params.excludeRoleIds - 新分配 角色id
 * @param {number} params.excludeUserIds - 已分配 角色id
 * @return {Promise<void>}
 */
export async function subAccountOrgGroupQueryAll(params) {
  const parsedParams = parseParameters(params);
  return request(
    `${HZERO_IAM}/v1/${currentOrganizationId}/${
      parsedParams.userId
    }/user-group-assigns/exclude-groups`,
    {
      method: 'GET',
      query: parsedParams,
    }
  );
}

/**
 * 查询 已分配的用户组
 * @return {Promise<void>}
 */
export async function subAccountOrgGroupCurrent({ userId, ...params }) {
  const parsedParams = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${currentOrganizationId}/${userId}/user-group-assigns`, {
    method: 'GET',
    query: parsedParams,
  });
}

/**
 * 添加用户组
 * @return {Promise<void>}
 */
export async function addUserGroup(params) {
  const { userId, memberGroupList } = params;
  return request(`${HZERO_IAM}/v1/${currentOrganizationId}/${userId}/user-group-assigns`, {
    method: 'POST',
    body: memberGroupList,
  });
}

/**
 * 删除用户组
 * @param {object[]} memberRoleList - 删除的角色
 */
export async function deleteUserGroup(params) {
  const { userId, remoteRemoveDataSource } = params;
  return request(`${HZERO_IAM}/v1/${currentOrganizationId}/${userId}/user-group-assigns`, {
    method: 'DELETE',
    body: remoteRemoveDataSource,
  });
}
