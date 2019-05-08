/**
 * service - 报错日志
 * @date: 2018-8-14
 * @version: 1.0.0
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_WFL } from 'utils/config';
import { parseParameters } from 'utils/utils';
/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${HZERO_WFL}/v1`;

/**
 * 查询报错日志列表数据
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchExceptionList(params) {
  const param = parseParameters(params);
  const { tenantId, ...others } = param;
  return request(`${prefix}/${tenantId}/process/exception`, {
    method: 'GET',
    query: others,
  });
}

/**
 * 查询报错详情
 * @export
 * @param {*} params
 * @returns
 */
export async function fetchExceptionDetail(params) {
  const { tenantId, procId } = params;
  return request(`${prefix}/${tenantId}/process/exception/${procId}`, {
    method: 'POST',
  });
}
