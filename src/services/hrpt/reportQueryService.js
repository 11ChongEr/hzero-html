/**
 * service - 报表平台/报表查询
 * @date: 2018-11-28
 * @version: 1.0.0
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_RPT } from 'utils/config';
import {
  parseParameters,
  getUrlParam,
  getCurrentOrganizationId,
  isTenantRoleLevel,
} from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${HZERO_RPT}/v1`;

/**
 * 报表列表查询
 * @async
 * @function fetchReportList
 * @param {object} params - 查询条件
 * @param {!string} params.tenantId - 租户ID
 * @param {!number} [params.page = 0] - 数据页码
 * @param {!number} [params.size = 10] - 分页大小
 * @returns {object} fetch Promise
 */
export async function fetchReportList(params) {
  const param = parseParameters(params);
  return request(
    organizationRoleLevel ? `${prefix}/${organizationId}/reports` : `${prefix}/reports`,
    {
      method: 'GET',
      query: param,
    }
  );
}
/**
 * 报表查看-获取参数
 * @async
 * @function fetchParams
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function fetchParams(params) {
  return request(
    organizationRoleLevel
      ? `${prefix}/${organizationId}/reports/${params.reportUuid}`
      : `${prefix}/reports/${params.reportUuid}`,
    {
      method: 'GET',
    }
  );
}
// /**
//  * 生成报表-返回html
//  * @async
//  * @function buildReport
//  * @param {object} params - 查询条件
//  * @returns {object} fetch Promise
//  */
// export async function buildReport(params) {
//   const { reportUuid, type, ...others } = params;
//   const strParam = getUrlParam(others);
//   return request(`${prefix}/reports/${type}/${reportUuid}${strParam}`, {
//     method: 'GET',
//     responseType: 'text',
//   });
// }
/**
 * 生成报表-返回object
 * @async
 * @function buildReport
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function buildReport(params) {
  const { reportUuid, type, strParam, ...others } = params;
  const otherParam = getUrlParam(others);
  if (strParam) {
    return request(
      organizationRoleLevel
        ? `${prefix}/${organizationId}/reports/${reportUuid}/data${otherParam}${strParam}`
        : `${prefix}/reports/${reportUuid}/data${otherParam}${strParam}`,
      {
        method: 'POST',
      }
    );
  } else {
    return request(
      organizationRoleLevel
        ? `${prefix}/${organizationId}/reports/${reportUuid}/data${otherParam}`
        : `${prefix}/reports/${reportUuid}/data${otherParam}`,
      {
        method: 'POST',
      }
    );
  }
}

/**
 * 定时报表
 * @async
 * @function getParameters
 * @param {object} params - 查询条件
 * @returns {object} fetch Promise
 */
export async function createRequest(params) {
  const { reportUuid, type, strParam, ...others } = params;
  const otherParam = getUrlParam(others);
  if (strParam) {
    return request(
      organizationRoleLevel
        ? `${prefix}/${organizationId}/reports/${reportUuid}/concurrent-request${otherParam}${strParam}`
        : `${prefix}/reports/${reportUuid}/concurrent-request${otherParam}${strParam}`,
      {
        method: 'POST',
      }
    );
  } else {
    return request(
      organizationRoleLevel
        ? `${prefix}/${organizationId}/reports/${reportUuid}/concurrent-request${otherParam}`
        : `${prefix}/reports/${reportUuid}/concurrent-request${otherParam}`,
      {
        method: 'POST',
      }
    );
  }
}
