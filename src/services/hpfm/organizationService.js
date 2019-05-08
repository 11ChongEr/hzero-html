/**
 * service HR组织架构维护
 * @date: 2018-6-19
 * @version: 0.0.1
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hands
 */

import request from 'utils/request';
import { filterNullValueObject } from 'utils/utils';
import { HZERO_PLATFORM } from 'utils/config';
// const HZERO_PLATFORM = `/hpfm-10902`;
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${HZERO_PLATFORM}/v1`;

/**
 * 获取租户信息
 * @async
 * @function fetchOrgInfo
 * @param {object} params - 请求参数
 * @param {!string} params.tenantId - 租户Id
 * @returns {object} fetch Promise
 */
export async function fetchOrgInfo(params) {
  return request(`${prefix}/${params.tenantId}/tenants`, {
    method: 'GET',
  });
}
/**
 * 根据租户Id，获取所有组织架构信息
 * @async
 * @function searchAll
 * @param {object} params - 请求参数
 * @param {!string} params.tenantId - 租户Id
 * @returns {object} fetch Promise
 */
export async function searchAll(params) {
  return request(`${prefix}/${params.tenantId}/units/company/tree`, {
    method: 'GET',
  });
}

/**
 * 根据参数查询组织信息
 * @async
 * @function search
 * @param {Object} params - 请求参数
 * @param {!string} params.tenantId - 租户Id
 * @param {?string} params.unitCode - 组织编码
 * @param {?string} params.unitName - 组织名称
 * @returns {object} fetch Promise
 */
export async function search(params) {
  return request(`${prefix}/${params.tenantId}/units/company`, {
    method: 'GET',
    query: filterNullValueObject(params),
  });
}
/**
 * 更新组织信息
 * @async
 * @function saveEdit
 * @param {Object} params - 请求参数
 * @param {!string} params.tenantId - 租户Id
 * @param {!object} params.values - 待保存的组织信息对象
 * @param {!string} params.values.unitId - 组织Id
 * @param {!string} params.values.unitCode - 组织编码
 * @param {!string} params.values.unitName - 组织名称
 * @param {!string} params.values.unitTypeCode - 组织类型编码
 * @param {?string} params.values.supervisorFlag - 主管组织标记
 * @param {?string} params.values.enabledFlag - 启用标记
 * @param {?string} params.values.parentUnitId - 上级组织Id
 * @returns {object} fetch Promise
 */
export async function saveEdit(params) {
  return request(`${prefix}/${params.tenantId}/units`, {
    method: 'PUT',
    body: { ...params.values },
  });
}
/**
 * 添加组织信息
 * @async
 * @function saveAdd
 * @param {Object} params - 请求参数
 * @param {!string} params.tenantId - 租户Id
 * @param {!object[]} params.data - 新增组织对象列表
 * @param {!string} params.data[].unitId - 组织Id
 * @param {!string} params.data[].unitCode - 组织编码
 * @param {!string} params.data[].unitName - 组织名称
 * @param {!string} params.data[].unitTypeCode - 组织类型编码
 * @param {?number} [params.data[].supervisorFlag = 0 ] - 主管组织标记
 * @param {?number} [params.data[].enabledFlag = 1 ] - 启用标记
 * @param {?string} params.data[].parentUnitId - 上级组织Id
 * @returns {object} fetch Promise
 */
export async function saveAdd(params) {
  return request(`${prefix}/${params.tenantId}/units`, {
    method: 'POST',
    body: [...params.data],
  });
}
/**
 * 禁用组织信息
 * @async
 * @function forbindLine
 * @param {Object} params - 请求参数
 * @param {!string} params.tenantId - 租户Id
 * @param {!string} params.unitId - 组织Id
 * @param {!string} params._token - token
 * @param {!number} params.objectVersionNumber - 版本号
 * @returns {object} fetch Promise
 */
export async function forbindLine(params) {
  return request(`${prefix}/${params.tenantId}/units/disable`, {
    method: 'POST',
    body: { ...params },
  });
}
/**
 * 启用组织信息
 * @async
 * @function enabledLine
 * @param {!string} params.tenantId - 租户Id
 * @param {!string} params.unitId - 组织Id
 * @param {!string} params._token - token
 * @param {!number} params.objectVersionNumber - 版本号
 * @returns {object} fetch Promise
 */
export async function enabledLine(params) {
  return request(`${prefix}/${params.tenantId}/units/enable`, {
    method: 'POST',
    body: { ...params },
  });
}
/**
 * 动态获取特定组织的下级组织，更新页面数据展示
 * @deprecated
 * @param {array} collections - 页面展示数据
 * @param {array} cursorList - 特定组织的层级路径
 * @param {array} data - 替换特定组织对象的children属性值
 * @returns {array} 更新后的页面展示数据
 */
export function findAndSetNodeProps(collections, cursorList, data) {
  if (collections.length === 0) {
    return data;
  }
  let newCursorList = cursorList || [];
  const cursor = newCursorList[0];

  return collections.map(n => {
    const m = n;
    if (m.unitId === cursor) {
      if (newCursorList[1]) {
        // if (!m.children) {
        //   m.children = [];
        // }
        newCursorList = newCursorList.filter(o => newCursorList.indexOf(o) !== 0);
        m.children = findAndSetNodeProps(m.children, newCursorList, data);
      } else {
        // m.children = Array.from(new Set(m.children.concat(data)));
        m.children = [...data];
      }
      return m;
    }
    return m;
  });
}
/**
 * 处理接口获取的数据，提取每个节点的层次路径
 * @param {array} collections - 页面展示数据
 * @param {array} levelPath - 特定组织的层级路径
 * @returns {object} 节点树和层次路径组成的对象
 */
export function renderTreeData(collections = [], levelPath = {}) {
  const pathMap = levelPath;
  const renderTree = collections.map(item => {
    const temp = item;
    pathMap[temp.unitId] = [...(pathMap[temp.parentUnitId] || []), temp.unitId];
    if (temp.children) {
      temp.children = [...renderTreeData(temp.children || [], pathMap).renderTree];
    }
    return temp;
  });
  return {
    renderTree,
    pathMap,
  };
}
