/**
 * subAccountService - 子账户平台级服务
 * @date 2018-12-15
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */
import querystring from 'querystring';

import { parseParameters } from 'utils/utils';
import { HZERO_IAM } from 'utils/config';
import request from 'utils/request';

/**
 * 查询子账户的信息-分页
 * @param {object} params
 * @return {Promise}
 */
export async function subAccountQueryPage(params) {
  const parseParams = parseParameters(params);
  return request(`${HZERO_IAM}/hzero/v1/users/paging`, {
    query: parseParams,
    method: 'GET',
  });
}

/**
 * 更新子账户的密码
 * @param {number} userId 用户id
 * @param {number} organizationId 用户所属租户id
 * @param {string} params.password 密码
 * @return {Promise}
 */
export async function subAccountPasswordUpdate({ userId, userOrganizationId, ...params }) {
  return request(`${HZERO_IAM}/hzero/v1/users/${userId}/admin-password`, {
    method: 'PUT',
    query: { organizationId: userOrganizationId },
    body: params,
  });
}

/**
 * 更新子账户的密码
 * @param {number} userId 用户id
 * @param {number} organizationId 用户所属租户id
 * @param {string} params.password 密码
 * @param {string} params.originalPassword 修改自己需要原密码
 * @return {Promise}
 */
export async function subAccountPasswordUpdateSelf({ userId, userOrganizationId, ...params }) {
  return request(`${HZERO_IAM}/hzero/v1/users/password`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 查询 可分配角色
 * @param {number} params.tenantId - 用户所属租户id
 * @param {number} params.name - 角色名
 * @param {number} params.excludeRoleIds - 新分配 角色id
 * @param {number} params.excludeUserIds - 已分配 角色id
 * @return {Promise<void>}
 */
export async function subAccountUserRolesQuery(params) {
  return request(
    `${HZERO_IAM}/hzero/v1/member-roles/subrole-list?${querystring.stringify(params)}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询 已分配角色
 * @return {Promise<void>}
 */
export async function subAccountCurrentUserRoles({ userId, ...params }) {
  const parsedParams = parseParameters(params);
  return request(`${HZERO_IAM}/hzero/v1/member-roles/${userId}`, {
    method: 'GET',
    query: parsedParams,
  });
}

/**
 * 查询 子帐号详情
 */
export async function subAccountQuery(userId, params) {
  return request(`${HZERO_IAM}/hzero/v1/users/${userId}/info`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 新建子账号
 * @return {Promise<void>}
 */
export async function subAccountCreate(params) {
  return request(`${HZERO_IAM}/hzero/v1/users`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新子账号
 * @return {Promise<void>}
 */
export async function subAccountUpdate(params) {
  return request(`${HZERO_IAM}/hzero/v1/users`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 解锁帐号
 * @param {number} userId - 用户id
 */
export async function subAccountUserUnlock(userId) {
  return request(`${HZERO_IAM}/hzero/v1/users/${userId}/unlocked`, {
    method: 'POST',
  });
}

/**
 * 删除角色
 * @param {object[]} memberRoleList - 删除的角色
 */
export async function subAccountUserRolesRemove(memberRoleList) {
  return request(`${HZERO_IAM}/hzero/v1/member-roles`, {
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
export async function subAccountUserGroupsQuery(params) {
  const parsedParams = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${parsedParams.userId}/user-group-assigns/exclude-groups`, {
    method: 'GET',
    query: parsedParams,
  });
}

/**
 * 查询 已分配的用户组
 * @return {Promise<void>}
 */
export async function subAccountCurrentGroupRoles({ userId, ...params }) {
  const parsedParams = parseParameters(params);
  return request(`${HZERO_IAM}/v1/${userId}/user-group-assigns`, {
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
  return request(`${HZERO_IAM}/v1/${userId}/user-group-assigns`, {
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
  return request(`${HZERO_IAM}/v1/${userId}/user-group-assigns`, {
    method: 'DELETE',
    body: remoteRemoveDataSource,
  });
}
