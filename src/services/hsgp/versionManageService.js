/**
 * VersionManage - 版本管理
 * @date: 2018-11-19
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_HSGP } from 'utils/config';

/**
 * 查询列表数据
 * @async
 * @function fetchVersionManageList
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchVersionManageList(params) {
  const { serviceId, ...other } = params;
  return request(`${HZERO_HSGP}/v1/service-versions/${params.serviceId}`, {
    method: 'GET',
    query: other,
  });
}

/**
 * 查询详细数据
 * @async
 * @function fetchVersionManageDetail
 * @param {Object} params - 查询参数
 * @param {String} [params.page = 0] - 页码
 * @param {String} [params.size = 0] - 页数
 */
export async function fetchVersionManageDetail(params) {
  return request(
    `${HZERO_HSGP}/v1/service-versions/${params.serviceId}/${params.serviceVersionId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 查询版本号清单
 * @async
 * @function queryVersionList
 * @param {Object} params - 查询参数
 */
export async function queryVersionList(params) {
  return request(`${HZERO_HSGP}/v1/service-versions/${params.serviceId}/version`, {
    method: 'GET',
  });
}

/**
 * 查询猪齿鱼应用版本列表
 * @async
 * @function queryAppVersionList
 * @param {Object} params - 查询参数
 */
export async function queryAppVersionList(params) {
  return request(`${HZERO_HSGP}/v1/apps/${params.serviceId}/versions`, {
    method: 'GET',
  });
}

/**
 * 创建
 * @async
 * @function createJobInfo
 * @param {String} params.enabledFlag - 是否启用
 * @param {String} params.groupNum - 集团编码
 */
export async function createVersionManage(params) {
  return request(`${HZERO_HSGP}/v1/service-versions/${params.serviceId}`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 更新
 * @async
 * @function updateJobGlue
 * @param {Object} params - 查询参数
 */
export async function updateVersionManage(params) {
  return request(`${HZERO_HSGP}/v1/service-versions/${params.serviceId}`, {
    method: 'PUT',
    body: params,
  });
}

/**
 * 删除
 * @async
 * @function deleteVersionManage
 * @param {Object} params - 查询参数
 */
export async function deleteVersionManage(params) {
  return request(`${HZERO_HSGP}/v1/service-versions/${params.serviceId}`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 * 查询服务下的版本数据 - 值集
 * @async
 * @param {Object} params - 查询参数
 */
export async function queryVersionWithService(params) {
  return request(`${HZERO_HSGP}/v1/service-versions/${params.serviceId}/value-set`, {
    method: 'GET',
    query: params,
  });
}
