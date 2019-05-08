import request from 'utils/request';
import { HZERO_IAM } from 'utils/config';

/**
 * 获取表单数据
 * @param {Number} organizationId 租户id
 */
export async function fetchPasswordPolicyList(organizationId) {
  return request(`${HZERO_IAM}/v1/organizations/${organizationId}/password_policies`, {
    method: 'GET',
  });
}

/**
 * 更新表单数据
 * @param {Number} organizationId 租户id
 * @param {Number} id 数据id
 * @param {String} params 其他参数
 */
export async function updatePasswordPolicy(params) {
  const { organizationId, id } = params;
  return request(`${HZERO_IAM}/v1/organizations/${organizationId}/password_policies/${id}`, {
    method: 'POST',
    body: params,
  });
}
