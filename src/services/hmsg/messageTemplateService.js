/**
 * service - 消息模板
 * @date: 2018-7-26
 * @version: 1.0.0
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import request from 'utils/request';
import { HZERO_MSG, HZERO_PLATFORM, HZERO_IAM } from 'utils/config';
import { parseParameters, getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

/**
 * 请求API前缀
 * @type {string}
 */
const prefix = `${HZERO_MSG}/v1`;

const organizationId = getCurrentOrganizationId();
const organizationRoleLevel = isTenantRoleLevel();

/**
 * 查询消息模板列表数据
 * @async
 * @function search
 * @param {object} params - 查询条件
 * @param {?string} params.templateCode - 消息模板编码
 * @param {?string} params.templateName - 消息模板名称
 * @param {!object} params.page - 分页参数
 * @returns {object} fetch Promise
 */

export async function search(params) {
  const param = parseParameters(params);
  return request(
    organizationRoleLevel
      ? `${prefix}/${organizationId}/message/templates`
      : `${prefix}/message/templates`,
    {
      method: 'GET',
      query: param,
    }
  );
}

/**
 * 查询消息模板明细
 * @async
 * @function searchDetail
 * @param {object} params - 查询条件
 * @param {?string} params.templateId - 消息模板Id
 * @returns {object} fetch Promise
 */

export async function searchDetail(params) {
  return request(
    organizationRoleLevel
      ? `${prefix}/${organizationId}/message/templates/${params.templateId}`
      : `${prefix}/message/templates/${params.templateId}`,
    {
      method: 'GET',
    }
  );
}

/**
 * 更新消息模板信息
 * @async
 * @function updateTemplate
 * @param {object} params - 请求参数
 * @param {?string} params.templateCode - 消息模板编码
 * @param {!string} params.templateName - 消息模板名称
 * @param {!string} params.templateContent - 消息模板内容
 * @param {!string} params.templateTitle - 消息模板标题
 * @param {!string} params.templateTypeCode - 消息模板类型
 * @param {!number} params.tenantId - 租户Id
 * @param {!number} params.templateId - 消息模板Id
 * @param {!number} params.enabledFlag - 启用标记
 * @param {?string} params.sqlValue - SQL
 * @returns {object} fetch Promise
 */
export async function updateTemplate(params) {
  return request(
    organizationRoleLevel
      ? `${prefix}/${organizationId}/message/templates`
      : `${prefix}/message/templates`,
    {
      method: 'PUT',
      body: { ...params },
    }
  );
}

/**
 * 添加消息模板信息
 * @async
 * @function addTemplate
 * @param {object} params - 请求参数
 * @param {?string} params.templateCode - 消息模板编码
 * @param {!string} params.templateName - 消息模板名称
 * @param {!string} params.templateContent - 消息模板内容
 * @param {!string} params.templateTitle - 消息模板标题
 * @param {!string} params.templateTypeCode - 消息模板类型
 * @param {!number} params.tenantId - 租户Id
 * @param {!number} params.enabledFlag - 启用标记
 * @param {?string} params.sqlValue - SQL
 * @returns {object} fetch Promise
 */
export async function addTemplate(params) {
  return request(
    organizationRoleLevel
      ? `${prefix}/${organizationId}/message/templates`
      : `${prefix}/message/templates`,
    {
      method: 'POST',
      body: { ...params },
    }
  );
}

/**
 * 添加消息模板信息
 * @async
 * @function addTemplate
 * @param {object} params - 请求参数
 * @returns {object} fetch Promise
 */
export async function searchCategoryCodeTree(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value/tree`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 查询系统支持的语言数据
 * @async
 * @function queryLanguageData
 * @returns fetch Promise
 */
export async function queryLanguageData() {
  return request(`${HZERO_IAM}/v1/languages/list`, {
    method: 'GET',
  });
}
