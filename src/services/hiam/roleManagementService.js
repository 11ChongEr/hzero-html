/**
 * roleManagementService - 角色管理service
 * 使用了 平台 HZERO_PLATFORM 的接口 (查询角色分配的卡片)
 * @date: 2018-7-24
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import qs from 'querystring';
import request from 'utils/request';
import { HZERO_IAM, HZERO_PLATFORM } from 'utils/config';
import {
  getCurrentOrganizationId,
  parseParameters,
  filterNullValueObject,
  isTenantRoleLevel,
} from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

/**
 * 查询值集
 * @async
 * @function queryCode
 * @param {object} params - 查询条件
 * @param {!string} param.lovCode - 查询条件
 * @returns {object} fetch Promise
 */
export async function queryCode(params = {}) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: params,
  });
}

/**
 * 查询值集
 * @async
 * @function queryCode
 * @param {!number} id - 角色ID
 * @param {!boolean} [status=false] - 启用或停用
 * @returns {object} fetch Promise
 */
export async function enableRole(params) {
  const { status, ...others } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/roles/${status ? 'enable' : 'disable'}`
      : `${HZERO_IAM}/hzero/v1/roles/${status ? 'enable' : 'disable'}`,
    {
      method: 'PUT',
      body: others,
    }
  );
}

/**
 * 查询值集
 * @async
 * @function queryCode
 * @param {!number} id - 角色ID
 * @param {!boolean} [status=false] - 启用或停用
 * @returns {object} fetch Promise
 */
export async function enableOrganizationRole({ id, status }, organizationId) {
  return request(
    `${HZERO_IAM}/hzero/v1/${organizationId}/roles/${id}/${status ? 'enable' : 'disable'}`,
    {
      method: 'PUT',
      responseType: 'text',
    }
  );
}

/**
 * 通过类型查询label
 * @async
 * @function queryLabels
 * @param {object} params - 角色ID
 * @param {!boolean} [status=false] - 启用或停用
 * @returns {object} fetch Promise
 */
export async function queryLabels(params) {
  return request(
    organizationRoleLevel ? `${HZERO_IAM}/v1/${tenantId}/labels` : `${HZERO_IAM}/v1/labels`,
    {
      query: params,
    }
  );
}

/**
 * 通过id查询角色
 * @async
 * @function queryRole
 * @param {!number} roleId - 角色ID
 * @returns {object} fetch Promise
 */
export async function queryRole(roleId) {
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/roles/${roleId}`
      : `${HZERO_IAM}/hzero/v1/roles/${roleId}`
  );
}

/**
 * 通过id查询角色 - 租户级
 * @async
 * @function queryOrganizationRole
 * @param {!number} roleId - 角色ID
 * @returns {object} fetch Promise
 */
export async function queryOrganizationRole(roleId, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/roles/${roleId}`);
}

/**
 * 查询角色可分配权限集子树
 * @async
 * @function queryLevelPermissions
 * @param {!number} roleId - 角色ID
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function queryPermissionSets(roleId, params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/roles/${roleId}/permission-sets`
      : `${HZERO_IAM}/hzero/v1/roles/${roleId}/permission-sets`,
    {
      query: params,
    }
  );
}

/**
 * 分页查询角色对应层级的权限
 * @async
 * @function queryLevelPermissions
 * @param {!number} roleId - 角色ID
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function queryLevelPermissions(roleId, params = {}) {
  return request(`${HZERO_IAM}/hzero/v1/permissions/${roleId}`, {
    query: params,
  });
}

/**
 * 分页查询角色对应层级的权限 - 租户级
 * @async
 * @function queryOrganizationLevelPermissions
 * @param {!number} roleId - 角色ID
 * @param {!number} organizationId - 组织ID
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function queryOrganizationLevelPermissions(roleId, params = {}, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/permissions/${roleId}`, {
    query: params,
  });
}

/**
 * 创建角色
 * @async
 * @function createRole
 * @param {!object} params - 保存参数
 * @returns {object} fetch Promise
 */
export async function createRole(params) {
  return request(`${HZERO_IAM}/hzero/v1/roles`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 创建角色 - 租户级
 * @async
 * @function createOrganizationRole
 * @param {!number} organizationId - 组织ID
 * @param {!object} params - 保存参数
 * @returns {object} fetch Promise
 */
export async function createOrganizationRole(params, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/roles`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 修改角色
 * @async
 * @function editRole
 * @param {!object} params - 保存参数
 * @returns {object} fetch Promise
 */
export async function editRole(params) {
  return request(`${HZERO_IAM}/hzero/v1/roles`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 修改角色 - 租户级
 * @async
 * @function editOrganizationRole
 * @param {!number} organizationId - 组织ID
 * @param {!object} params - 保存参数
 * @returns {object} fetch Promise
 */
export async function editOrganizationRole(params, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/roles`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 复制并创建角色
 * @async
 * @function copyRole
 * @param {!object} params - 保存参数
 * @returns {object} fetch Promise
 */
export async function copyRole(params) {
  return request(`${HZERO_IAM}/hzero/v1/roles/copy`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 复制并创建角色 - 租户级
 * @async
 * @function copyOrganizationRole
 * @param {!number} organizationId - 组织ID
 * @param {!object} params - 保存参数
 * @returns {object} fetch Promise
 */
export async function copyOrganizationRole(params, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/roles/copy`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 继承并创建角色
 * @async
 * @function inheritRole
 * @param {!object} params - 保存参数
 * @returns {object} fetch Promise
 */
export async function inheritRole(params) {
  return request(`${HZERO_IAM}/hzero/v1/roles/inherit`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 继承并创建角色 - 租户级
 * @async
 * @function inheritOrganizationRole
 * @param {!number} organizationId - 组织ID
 * @param {!object} params - 保存参数
 * @returns {object} fetch Promise
 */
export async function inheritOrganizationRole(params, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/roles/inherit`, {
    method: 'POST',
    body: params,
  });
}

export async function queryHrunitsTree(params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/hrunits/tree`
      : `${HZERO_IAM}/hzero/v1/hrunits/tree`,
    {
      query: params,
    }
  );
}

export async function queryMemberRolesUsers(params = {}) {
  return request(`${HZERO_IAM}/hzero/v1/member-roles/users`, {
    query: params,
  });
}

export async function queryOrganizationMemberRolesUsers(params = {}, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/member-roles/users`, {
    query: params,
  });
}

export async function saveMembers(data, isEdit) {
  return request(`${HZERO_IAM}/hzero/v1/member-roles/batch-assign/by-member-role-list`, {
    method: 'POST',
    body: data,
    query: {
      isEdit,
    },
  });
}

export async function saveOrganizationMembers(data, isEdit, organizationId) {
  return request(
    `${HZERO_IAM}/hzero/v1/${organizationId}/member-roles/batch-assign/by-member-role-list`,
    {
      method: 'POST',
      body: data,
      query: {
        isEdit,
      },
    }
  );
}

export async function deleteMember(data = {}) {
  return request(`${HZERO_IAM}/hzero/v1/member-roles`, {
    method: 'DELETE',
    body: data,
  });
}

export async function deleteOrganizationMember(data = {}, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/member-roles`, {
    method: 'DELETE',
    body: data,
  });
}

export async function queryRoleAuth(params) {
  const { roleId, body } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/v1/${tenantId}/roles/${roleId}/role-auths/${getCurrentOrganizationId()}`
      : `${HZERO_IAM}/v1/roles/${roleId}/role-auths/${getCurrentOrganizationId()}`,
    {
      method: 'GET',
      query: body,
    }
  );
}

export async function saveRoleAuth(params) {
  const { roleId, body } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/v1/${tenantId}/roles/${roleId}/role-auths`
      : `${HZERO_IAM}/v1/roles/${roleId}/role-auths`,
    {
      method: 'POST',
      body,
    }
  );
}

export async function deleteRoleAuth(params) {
  const { roleId, body } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/v1/${tenantId}/roles/${roleId}/role-auths?${qs.stringify({
          roleAuthId: body.roleAuthId,
        })}`
      : `${HZERO_IAM}/v1/roles/${roleId}/role-auths?${qs.stringify({
          roleAuthId: body.roleAuthId,
        })}`,
    {
      method: 'DELETE',
      body,
    }
  );
}

/**
 * 查询角色可分配权限的菜单子树
 * @async
 * @function queryPermissionMenus
 * @param {!object} params - 保存参数
 * @returns {object} fetch Promise
 */
export async function queryPermissionMenus(roleId, params) {
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/roles/${roleId}/permission-set-tree`
      : `${HZERO_IAM}/hzero/v1/roles/${roleId}/permission-set-tree`,
    {
      query: params,
    }
  );
}

/**
 * 批量分配权限集至角色
 * @async
 * @function batchAssignPermissionSets
 * @param {!object} params - 保存参数
 * @param {!number} roleId - 角色ID
 * @returns {object} fetch Promise
 */
export async function batchAssignPermissionSets(roleId, data) {
  return request(`${HZERO_IAM}/hzero/v1/roles/${roleId}/permission-sets/assign`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 批量分配权限集至角色 - 租户级
 * @async
 * @function batchAssignPermissionSets
 * @param {!object} params - 保存参数
 * @param {!number} roleId - 角色ID
 * @returns {object} fetch Promise
 */
export async function batchAssignOrganizationPermissionSets(roleId, data, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/roles/${roleId}/permission-sets/assign`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 批量取消分配权限集至角色
 * @async
 * @function batchAssignPermissionSets
 * @param {!object} params - 保存参数
 * @param {!number} roleId - 角色ID
 * @returns {object} fetch Promise
 */
export async function batchUnassignPermissionSets(roleId, data) {
  return request(`${HZERO_IAM}/hzero/v1/roles/${roleId}/permission-sets/recycle`, {
    method: 'PUT',
    body: data,
  });
}

/**
 * 批量取消分配权限集至角色 - 租户级
 * @async
 * @function batchAssignPermissionSets
 * @param {!object} params - 保存参数
 * @param {!number} roleId - 角色ID
 * @returns {object} fetch Promise
 */
export async function batchUnassignOrganizationPermissionSets(roleId, data, organizationId) {
  return request(
    `${HZERO_IAM}/hzero/v1/${organizationId}/roles/${roleId}/permission-sets/recycle`,
    {
      method: 'PUT',
      body: data,
    }
  );
}

/**
 * 批量取消分配明细权限
 * @async
 * @function unassignOrganizationPermissions
 * @param {!object} params - 保存参数
 * @param {!number} roleId - 角色ID
 * @returns {object} fetch Promise
 */
export async function unassignOrganizationPermissions(roleId, data, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/roles/${roleId}/permissions/unassign`, {
    method: 'PUT',
    body: data,
    responseType: 'text',
  });
}

/**
 * 组织层查询当前登录用户默认角色
 * @async
 * @function queryCurrentRole
 * @returns {object} fetch Promise
 */
export async function queryCurrentRole() {
  return request(`${HZERO_IAM}/hzero/v1/member-roles/current-role`);
}

/**
 * 分页查查询角色信息
 * @async
 * @function queryCreatedSubroles
 * @param {!number} parentRoleId - 角色ID
 * @param {object} params - 查询条件
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function queryCreatedSubroles(parentRoleId, params = {}) {
  const query = filterNullValueObject(parseParameters(params));
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/member-roles/created-subroles/${parentRoleId}`
      : `${HZERO_IAM}/hzero/v1/member-roles/created-subroles/${parentRoleId}`,
    {
      query,
    }
  );
}

/* 角色分配卡片 */

/**
 * 查询角色分配的卡片
 * @requestUrl {HZERO_PLATFORM}/v1/dashboard-role-cards/{roleId}
 * @requestMethod GET
 * @param {object} - page - 分页信息
 * @param {object} - sort - 排序信息
 * @param {number} - roleId - 角色id
 */
export async function roleCardsQuery(params) {
  const { roleId, ...restParams } = params;
  const parsedParams = parseParameters(restParams);
  return request(`${HZERO_PLATFORM}/v1/dashboard-role-cards/${roleId}`, {
    method: 'GET',
    query: parsedParams,
  });
}

/**
 * 删除角色分配的卡片
 * @requestUrl {HZERO_PLATFORM}/v1/dashboard-role-cards
 * @requestMethod DELETE
 * @param {object[]} - params - 删除的卡片信息
 */
export async function roleCardsDelete(params) {
  return request(`${HZERO_PLATFORM}/v1/dashboard-role-cards`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 新增或修改角色分配的卡片
 * @requestUrl {HZERO_PLATFORM}/v1/dashboard-role-cards
 * @requestMethod POST
 * @param {object[]} - params - 删除的卡片信息
 */
export async function roleCardsInsertOrUpdate(params) {
  return request(`${HZERO_PLATFORM}/v1/dashboard-role-cards`, {
    method: 'POST',
    body: params,
  });
}

/* 角色分配卡片 租户级 */

/**
 * 查询角色分配的卡片
 * @requestUrl {HZERO_PLATFORM}/v1/{organizationId}/dashboard-role-cards/{roleId}
 * @requestMethod GET
 * @param {object} - page - 分页信息
 * @param {object} - sort - 排序信息
 * @param {number} - roleId - 角色id
 */
export async function orgRoleCardsQuery(organizationId, params) {
  const { roleId, ...restParams } = params;
  const parsedParams = parseParameters(restParams);
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/dashboard-role-cards/${roleId}`, {
    method: 'GET',
    query: parsedParams,
  });
}

/**
 * 删除角色分配的卡片
 * @requestUrl {HZERO_PLATFORM}/v1/{organizationId}/dashboard-role-cards
 * @requestMethod DELETE
 * @param {object[]} - params - 删除的卡片信息
 */
export async function orgRoleCardsDelete(organizationId, params) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/dashboard-role-cards`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 新增或修改角色分配的卡片
 * @requestUrl {HZERO_PLATFORM}/v1/{organizationId}/dashboard-role-cards
 * @requestMethod POST
 * @param {object[]} - params - 删除的卡片信息
 */
export async function orgRoleCardsInsertOrUpdate(organizationId, params) {
  return request(`${HZERO_PLATFORM}/v1/${organizationId}/dashboard-role-cards`, {
    method: 'POST',
    body: params,
  });
}
