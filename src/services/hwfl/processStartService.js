/**
 * service - 流程设置/流程启动
 * @date: 2018-8-21
 * @version: 1.0.0
 * @author: CJ <juan.chen01@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_WFL } from 'utils/config';

/**
 * 启动流程
 * @async
 * @function startProcess
 * @param {object} params,tenantId - 请求参数
 * @param {object} tenantId - 租户id
 * @param {!object} params.variables - 表格数据
 * @param {!string} params.processDefinitionKey - 流程定义
 * @returns {object} fetch Promise
 */
export async function startProcess(tenantId, params) {
  const { employeeNum, ...otherParams } = params;
  return request(`${HZERO_WFL}/v1/${tenantId}/process/instance/start-up`, {
    method: 'POST',
    body: otherParams,
    query: { employeeNum },
  });
}
