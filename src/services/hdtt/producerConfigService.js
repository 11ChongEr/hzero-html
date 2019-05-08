/**
 * service - 数据生产配置
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_DTT } from 'utils/config';
/**
 *查询数据
 *
 * @export
 * @param {*} params.tableName 生产表名
 * @param {*} params.name 服务名称
 * @param {*} params.tenantId 租户名称
 * @param {*} params.page 分页参数
 * @param {*} params.size 分页参数
 * @returns
 */
export async function queryProducer(params) {
  return request(`${HZERO_DTT}/v1/producer-configs`, {
    method: 'GET',
    query: params,
  });
}
/**
 *保存新建或者编辑的数据
 *
 * @export
 * @param {*} params.form 表格内容
 * @param {*} params.objectVersionNumber 版本号
 * @returns
 */
export async function saveProducer(params) {
  return request(`${HZERO_DTT}/v1/producer-configs`, {
    method: 'POST',
    body: params.payloadData,
  });
}
/**
 *查询分发租户表数据
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryTenant(params) {
  return request(`${HZERO_DTT}/v1/cons-tenant-configs`, {
    method: 'GET',
    query: params,
  });
}
/**
 *删除查询租户表数据
 *
 * @export
 * @param {*} params.producerConfigId  数据配置Id
 * @param {*} params.consTenantConfigIdList  分发租户id数组
 * @returns
 */
export async function deleteTenant(params) {
  const { producerConfigId, consTenantConfigIdList } = params;
  return request(`${HZERO_DTT}/v1/cons-tenant-configs`, {
    method: 'DELETE',
    query: { producerConfigId },
    body: consTenantConfigIdList,
  });
}
/**
 *查询分发DB表数据
 *
 * @export
 * @param {*} params.producerConfigId 数据配置Id
 * @returns
 */
export async function queryDb(params) {
  return request(`${HZERO_DTT}/v1/cons-db-configs`, {
    method: 'GET',
    query: params,
  });
}
/**
 *保存Db表格数据
 *
 * @export
 * @param {*} params.consumerOffset 初始偏移数
 * @param {*} params.enabledFlag 状态值
 * @returns
 */
export async function saveDb(params) {
  return request(`${HZERO_DTT}/v1/cons-db-configs`, {
    method: 'POST',
    body: params.editData,
  });
}
export async function saveTenant(params) {
  const { producerConfigId, editData } = params;
  return request(`${HZERO_DTT}/v1/cons-tenant-configs`, {
    method: 'POST',
    query: { producerConfigId },
    body: editData,
  });
}
