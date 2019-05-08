import request from 'utils/request';
import { getCurrentOrganizationId, parseParameters, isTenantRoleLevel } from 'utils/utils';
import { HZERO_HITF } from 'utils/config';

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

export async function fetchLogsList(params = {}) {
  // const { ...query } = params;
  const param = parseParameters(params);
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-logs`
      : `${HZERO_HITF}/v1/interface-logs`,
    {
      method: 'GET',
      query: param,
    }
  );
}

export async function fetchLogsDetail(params) {
  const { interfaceLogId } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-logs/${interfaceLogId}`
      : `${HZERO_HITF}/v1/interface-logs/${interfaceLogId}`,
    {
      method: 'GET',
      params,
    }
  );
}
