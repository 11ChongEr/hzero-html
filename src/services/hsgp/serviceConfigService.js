/**
 * ServiceConfig - 服务配置
 * @date: 2018-12-09
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_HSGP } from 'utils/config';

/**
 * 查询配置
 * @async
 * @function queryServiceConfigYaml
 * @param {Object} params - 查询参数
 */
export async function queryServiceConfigYaml(params) {
  return request(`${HZERO_HSGP}/v1/service-configs/yaml`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 刷新
 * @async
 * @function refreshServiceConfig
 * @param {Object} params - 查询参数
 */
export async function refreshServiceConfig(params) {
  return request(`${HZERO_HSGP}/v1/service-configs/refresh`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 保存配置
 * @async
 * @function saveServiceConfig
 * @param {Object} params - 查询参数
 */
export async function saveServiceConfig(params) {
  return request(`${HZERO_HSGP}/v1/service-configs`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 设置默认配置
 * @async
 * @function setDefaultConfig
 * @param {Object} params - 查询参数
 */
export async function setDefaultConfig(params) {
  return request(`${HZERO_HSGP}/v1/service-configs/set-default`, {
    method: 'POST',
    body: params,
  });
}
