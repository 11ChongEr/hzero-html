/**
 * service - 流程设置/流程定义
 * @date: 2018-8-16
 * @version: 1.0.0
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { filterNullValueObject, parseParameters } from 'utils/utils';
import { HZERO_WFL } from 'utils/config';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${HZERO_WFL}/v1`;

/**
 * 获取流程分类
 * @async
 * @function fetchCategory
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchCategory(params) {
  return request(`${HZERO_WFL}/v1/${params.tenantId}/process/categories`, {
    method: 'GET',
    query: params,
  });
}
/**
 * 流程查询
 * @async
 * @function fetchProcessList
 * @param {object} params - 查询条件
 * @param {?string} params.category - 流程分类
 * @param {?string} params.key - 流程编码
 * @param {?string} params.name - 流程名称
 * @param {!string} params.tenantId - 租户ID
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchProcessList(params) {
  const param = parseParameters(params);
  const { tenantId, ...others } = param;
  return request(`${prefix}/${tenantId}/process/models`, {
    method: 'GET',
    query: filterNullValueObject(others),
  });
}
/**
 * 流程部署记录查询
 * @async
 * @function fetchDeployHistory
 * @param {object} params - 查询条件
 * @param {?string} params.modelId - 流程Id
 * @param {!string} params.tenantId - 租户ID
 * @returns {object} fetch Promise
 */
export async function fetchDeployHistory(params) {
  const param = parseParameters(params);
  const { tenantId, ...others } = param;
  return request(`${prefix}/${tenantId}/process/models/definitions`, {
    method: 'GET',
    query: others,
  });
}
/**
 * 新增流程
 * @async
 * @function addProcess
 * @param {object} params - 请求条件
 * @param {!string} params.tenantId - 租户ID
 * @param {!object} params.process - 流程对象
 * @returns {object} fetch Promise
 */
export async function addProcess(params) {
  return request(`${prefix}/${params.tenantId}/process/models`, {
    method: 'POST',
    body: { ...params.process },
  });
}

/**
 * 删除流程
 * @async
 * @function deleteProcess
 * @param {object} params - 请求条件
 * @param {!string} params.tenantId - 租户ID
 * @param {!string} parmas.modelId - 流程Id
 * @returns {object} fetch Promise
 */
export async function deleteProcess(params) {
  const { tenantId, modelId, record } = params;
  return request(`${prefix}/${tenantId}/process/models/${modelId}`, {
    method: 'DELETE',
    body: record,
  });
}

/**
 * 发布流程
 * @async
 * @function releaseProcess
 * @param {object} params - 请求条件
 * @param {!string} params.tenantId - 租户ID
 * @param {!string} parmas.modelId - 流程Id
 * @returns {object} fetch Promise
 */
export async function releaseProcess(params) {
  return request(`${prefix}/${params.tenantId}/process/models/${params.modelId}/deploy`, {
    method: 'GET',
  });
}
/**
 * 流程编码唯一性校验
 * @async
 * @function checkProcessKey
 * @param {*} params - 请求参数
 * @param {!string} params.tenantId - 租户ID
 * @param {!object} params.values - 流程Id
 */
export async function checkProcessKey(params) {
  return request(`${prefix}/${params.tenantId}/process/models/check`, {
    method: 'POST',
    body: { ...params.values },
    // responseType: 'text',
  });
}
/**
 * 流程部署详情-部署信息查询
 * @async
 * @function fetchDeployDetail
 * @param {object} params - 请求参数
 * @param {?string} params.deploymentId - 流程部署Id
 * @param {!string} params.tenantId - 租户ID
 */
export async function fetchDeployDetail(params) {
  return request(`${prefix}/${params.tenantId}/repository/deployments/${params.deploymentId}`, {
    method: 'GET',
  });
}
/**
 * 流程部署详情-流程信息查询
 * @async
 * @function fetchProcessDetail
 * @param {object} params - 请求参数
 * @param {?string} params.processId - 流程Id
 * @param {!string} params.tenantId - 租户ID
 */
export async function fetchProcessDetail(params) {
  return request(`${prefix}/${params.tenantId}/process/models/definitions/${params.processId}`, {
    method: 'GET',
  });
}
/**
 * 流程部署详情-预览图查询
 * @async
 * @function fetchProcessImage
 * @param {object} params - 请求参数
 * @param {?string} params.processId - 流程Id
 * @param {!string} params.tenantId - 租户ID
 */
export async function fetchProcessImage(params) {
  return request(
    `${prefix}/${params.tenantId}/process/models/definitions/image/${params.processId}`,
    {
      method: 'GET',
      responseType: 'text',
    }
  );
}
/**
 * 删除流程部署记录
 * @async
 * @function deleteDeploy
 * @param {object} params - 请求参数
 * @param {!string} params.tenantId - 租户ID
 * @param {!string} params.deploymentId - 流程部署Id
 */
export async function deleteDeploy(params) {
  return request(`${prefix}/${params.tenantId}/repository/deployments/${params.deploymentId}`, {
    method: 'DELETE',
  });
}
