import request from 'utils/request';
import { HZERO_HITF } from 'utils/config';
import { getCurrentOrganizationId, parseParameters, isTenantRoleLevel } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

export async function queryList(params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers`
      : `${HZERO_HITF}/v1/interface-servers`,
    {
      query: parseParameters(params),
    }
  );
}

export async function edit(params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers`
      : `${HZERO_HITF}/v1/interface-servers`,
    {
      method: 'PUT',
      body: params,
    }
  );
}

export async function create(params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers`
      : `${HZERO_HITF}/v1/interface-servers`,
    {
      method: 'POST',
      body: params,
    }
  );
}

export async function deleteHeader(deleteList = []) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers`
      : `${HZERO_HITF}/v1/interface-servers`,
    {
      method: 'DELETE',
      body: deleteList,
    }
  );
}

export async function deleteLines(interfaceIds = []) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interfaces`
      : `${HZERO_HITF}/v1/interfaces`,
    {
      method: 'DELETE',
      body: interfaceIds,
    }
  );
}

export async function queryInterfaceDetail(params) {
  const { interfaceServerId, ...query } = params;
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers/${interfaceServerId}`
      : `${HZERO_HITF}/v1/interface-servers/${interfaceServerId}`,
    {
      query,
    }
  );
}

export async function importService(params = {}) {
  return request(
    organizationRoleLevel
      ? `${HZERO_HITF}/v1/${organizationId}/interface-servers/import`
      : `${HZERO_HITF}/v1/interface-servers/import`,
    {
      query: params,
      method: 'POST',
    }
  );
}
