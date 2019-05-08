/*
 * zuulRateLimitService - 限流设置
 * @date: 2018/10/13 11:14:04
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { HZERO_HCNF } from 'utils/config';
import request from 'utils/request';
import { parseParameters, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

const tenantId = getCurrentOrganizationId();

function zuulApi() {
  return isTenantRoleLevel() ? `${tenantId}/zuul-rate-limits` : 'zuul-rate-limits';
}

function zuulLineApi() {
  return isTenantRoleLevel() ? `${tenantId}/zuul-rate-limit-lines` : 'zuul-ratelimit-lines';
}

/**
 * 查询限流规则列表
 */
export async function fetchRateLimitList(params) {
  return request(`${HZERO_HCNF}/v1/${zuulApi()}`, {
    method: 'GET',
    query: parseParameters(params),
  });
}

/**
 * 添加限流规则
 */
export async function addRateLimit(params) {
  return request(`${HZERO_HCNF}/v1/${zuulApi()}/create`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 查询限流规则头详情
 */
export async function fetchHeaderInformation(params) {
  const { page, size, rateLimitId } = params;
  return request(`${HZERO_HCNF}/v1/${zuulApi()}/${rateLimitId}/lines`, {
    method: 'GET',
    query: { page, size },
  });
}

/**
 * 头行保存
 */
export async function detailSave(params) {
  return request(`${HZERO_HCNF}/v1/${zuulApi()}/detail/save`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 头删除
 */
export async function deleteHeaders(params) {
  return request(`${HZERO_HCNF}/v1/${zuulApi()}/batch-delete`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 刷新头
 */
export async function refresh(params) {
  return request(`${HZERO_HCNF}/v1/${zuulApi()}/config/batch-update`, {
    method: 'POST',
    body: params,
  });
}

/**
 * 行删除
 */
export async function deleteLines(params) {
  return request(`${HZERO_HCNF}/v1/${zuulLineApi()}/batch-delete`, {
    method: 'POST',
    body: params,
  });
}
/**
 * 查询限流规则行
 */
export async function fetchLines(params) {
  return request(`${HZERO_HCNF}/v1/${zuulLineApi()}`, {
    method: 'GET',
    query: parseParameters(params),
  });
}
