import request from 'utils/request';
import { HZERO_PLATFORM } from 'utils/config';
import { isTenantRoleLevel } from 'utils/utils';

// 地区定义角色层级判断
function regionApi(params) {
  return isTenantRoleLevel() ? `${params.tenantId}/countries` : 'countries';
}

/**
 * 查询地区列表的数据
 * @param {Object} params - 查询参数
 */
export async function fetchRegionData(params) {
  const { countryId, ...other } = params;
  return request(`${HZERO_PLATFORM}/v1/${regionApi(params)}/${countryId}/regions`, {
    method: 'GET',
    query: other,
  });
}

/**
 * 查询地区列表的数据，第一层级
 * @param {Object} params - 查询参数
 */
export async function fetchRegionList(params) {
  return request(`${HZERO_PLATFORM}/v1/${regionApi(params)}/regions`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 新增地区
 * @param {Object} params - 参数
 */
export async function createRegion(params) {
  return request(`${HZERO_PLATFORM}/v1/${regionApi(params)}/${params.countryId}/region`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新地区数据
 * @param {Object} params - 参数
 */
export async function updateRegion(params) {
  return request(
    `${HZERO_PLATFORM}/v1/${regionApi(params)}/${params.countryId}/regions/${params.regionId}`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

/**
 * 删除地区定义数据
 * @param {Object} params - 参数
 */
export async function deleteRegion(params) {
  return request(`${HZERO_PLATFORM}/v1/${regionApi(params)}/regions`, {
    method: 'DELETE',
    body: params.seleRegionRows,
  });
}

/**
 * 设置地区禁用
 * @param {Object} params - 参数
 */
export async function setDisabledRegion(params) {
  return request(`${HZERO_PLATFORM}/v1/${regionApi(params)}/regions/${params.regionId}`, {
    method: 'PATCH',
    body: params,
  });
}
