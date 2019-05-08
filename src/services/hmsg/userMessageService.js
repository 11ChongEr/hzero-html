/**
 * service - 站内消息
 * @date: 2018-8-10
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_MSG } from 'utils/config';
import { parseParameters, filterNullValueObject } from 'utils/utils';
/**
 *
 *查询站内消息
 * @export
 * @param {*} params
 * @returns
 */
export async function queryMessage(params) {
  const { organizationId, ...other } = params;
  const param = filterNullValueObject(parseParameters(other));
  return request(`${HZERO_MSG}/v1/${organizationId}/messages/user`, {
    method: 'GET',
    query: param,
  });
}
/**
 *改变消息为未读
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function changeRead(params) {
  const { organizationId, ...other } = params;
  return request(`${HZERO_MSG}/v1/${organizationId}/messages/user/read-flag`, {
    method: 'PATCH',
    query: other,
  });
}
/**
 *查询站内消息明细
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function queryMessageDetail(params) {
  const { organizationId, messageId } = params;
  return request(`${HZERO_MSG}/v1/${organizationId}/messages/user/${messageId}`, {
    method: 'GET',
  });
}
/**
 *删除站内消息
 *
 * @export
 * @param {*} params
 * @returns
 */
export async function deleteMessage(params) {
  const { organizationId, ...other } = params;
  return request(`${HZERO_MSG}/v1/${organizationId}/messages/user`, {
    method: 'DELETE',
    query: other,
  });
}
