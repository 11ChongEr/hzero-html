import request from 'utils/request';
import { HZERO_IAM, HZERO_PLATFORM } from 'utils/config';
import {
  parseParameters,
  filterNullValueObject,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

export async function queryMenuTree(params = {}) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_IAM}/hzero/v1/menus/manage-tree`, {
    query,
  });
}

export async function queryOrganizationMenuTree(organizationId, params) {
  const query = filterNullValueObject(parseParameters(params));
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/menus/manage-tree`, {
    query,
  });
}

export async function checkMenuDirExists(params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/menus/check-duplicate`
      : `${HZERO_IAM}/hzero/v1/menus/check-duplicate`,
    {
      method: 'POST',
      body: params,
    }
  );
}

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

export async function queryDir(params = {}) {
  return request(`${HZERO_IAM}/hzero/v1/menus/dir`, {
    query: params,
  });
}

export async function queryOrganizationDir(params = {}, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/menus/dir`, {
    query: params,
  });
}

export async function createDir(data = {}) {
  return request(`${HZERO_IAM}/hzero/v1/menus/create`, {
    method: 'POST',
    body: data,
  });
}

export async function createOrganizationDir(data = {}, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/menus/create`, {
    method: 'POST',
    body: data,
  });
}

export async function saveDir(data = {}) {
  return request(`${HZERO_IAM}/hzero/v1/menus/update`, {
    method: 'POST',
    body: data,
  });
}

export async function saveOrganizationDir(data = {}, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/menus/update`, {
    method: 'POST',
    body: data,
  });
}

export async function importMenu(params) {
  return request(`${HZERO_IAM}/hzero/v1/menus/standard-menu-import`, {
    method: 'POST',
    body: params,
    responseType: 'text',
  });
}

export async function importOrganizationMenu(organizationId, params) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/menus/custom-menu-import`, {
    method: 'POST',
    body: params,
    responseType: 'text',
  });
}

export async function queryPermissions(params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/permissions/self`
      : `${HZERO_IAM}/hzero/v1/permissions/self`,
    {
      query: params,
    }
  );
}

export async function deleteMenu(id) {
  return request(`${HZERO_IAM}/hzero/v1/menus/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteOrganizationMenu(id, organizationId) {
  return request(`${HZERO_IAM}/hzero/v1/${organizationId}/menus/${id}`, {
    method: 'DELETE',
  });
}

// 查询权限集
export async function queryPermissionSetTree(menuId, params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/menus/${menuId}/permission-set`
      : `${HZERO_IAM}/hzero/v1/menus/${menuId}/permission-set`,
    {
      query: params,
    }
  );
}

/**
 * 启用禁用权限集及其下的所有子权限集
 * @async
 * @function setPermissionSetEnable
 * @param {!number} menuId - 查询条件
 * @param {!params} param - 查询条件
 * @param {!params} param.enableFlag - 是否启用
 * @returns {object} fetch Promise
 */
export async function setPermissionSetEnable(params) {
  const { paramType, ...others } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/menus/${paramType}`
      : `${HZERO_IAM}/hzero/v1/menus/${paramType}`,
    {
      body: others,
      method: 'PUT',
    }
  );
}

// 查询权限集下可分配的所有权限
export async function queryPermissionsByMenuId(menuId, params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/menus/${menuId}/assignable-permissions`
      : `${HZERO_IAM}/hzero/v1/menus/${menuId}/assignable-permissions`,
    {
      query: params,
    }
  );
}

// 查询权限集下已分配的权限
export async function queryPermissionsByMenuIdAll(menuId, params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/menus/permission-set/${menuId}/permissions`
      : `${HZERO_IAM}/hzero/v1/menus/permission-set/${menuId}/permissions`,
    {
      query: params,
    }
  );
}

// 查询权限集下已分配的Lov
export async function queryLovsByMenuIdAll(menuId, params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/menus/permission-set/${menuId}/lovs`
      : `${HZERO_IAM}/hzero/v1/menus/permission-set/${menuId}/lovs`,
    {
      query: params,
    }
  );
}

// 查询权限集下可分配的所有lov
export async function queryLovByMenuId(menuId, params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/menus/${menuId}/assignable-lovs`
      : `${HZERO_IAM}/hzero/v1/menus/${menuId}/assignable-lovs`,
    {
      query: params,
    }
  );
}

// 为权限集分配权限(包括Lov)
export async function assignPermissions(params = {}) {
  const { menuId, permissionCodes, ...others } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/menus/${menuId}/permission-set/assign-permissions`
      : `${HZERO_IAM}/hzero/v1/menus/${menuId}/permission-set/assign-permissions`,
    {
      method: 'POST',
      query: others,
      body: permissionCodes,
    }
  );
}

// 回收权限集的权限(包括Lov)
export async function deletePermissions(params = {}) {
  const { menuId, permissionCodes } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${tenantId}/menus/${menuId}/permission-set/recycle-permissions`
      : `${HZERO_IAM}/hzero/v1/menus/${menuId}/permission-set/recycle-permissions`,
    {
      method: 'POST',
      body: permissionCodes,
    }
  );
}

// 查询icon
export async function svnIconQueryPages(params) {
  const requestUrl = organizationRoleLevel
    ? `${HZERO_PLATFORM}/v1/${tenantId}/icons`
    : `${HZERO_PLATFORM}/v1/icons`;
  return request(requestUrl, {
    method: 'GET',
    query: params,
  });
}
