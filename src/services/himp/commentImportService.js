import request from 'utils/request';
import { HZERO_IMP } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();
/**
 * 模板头数据查询接口
 * @async
 * @function loadTemplate
 * @param {Object} params - 查询参数
 * @param {String} params.code - 模板编码
 */
export async function loadTemplate(params) {
  return request(`${HZERO_IMP}/v1/${organizationId}/template/${params.code}/info`, {
    method: 'GET',
  });
}

/**
 * 导入数据查询
 * @async
 * @function loadDataSource
 * @param {Object} params - 查询参数
 * @param {String} templateCode - 模板编码
 */
export async function loadDataSource(templateCode, batch, prefixPatch, params = {}) {
  return request(`${prefixPatch}/v1/${organizationId}/import/data`, {
    method: 'GET',
    query: {
      templateCode,
      batch,
      ...params,
    },
  });
}

/**
 * 导入数据验证
 * @async
 * @function validateData
 * @param {Object} params - 查询参数
 * @param {String} params.templateCode - 模板编码
 */
export async function validateData(params) {
  return request(
    `${params.prefixPatch}/v1/${organizationId}/import/data/data-validate?templateCode=${
      params.templateCode
    }&batch=${params.batch}`,
    {
      method: 'POST',
    }
  );
}

/**
 * 导入数据到正式库
 * @async
 * @function importData
 * @param {Object} params - 查询参数
 * @param {String} params.templateCode - 模板编码
 * @param {String} params.prefixPatch - 客户端路径前缀
 * @param {String} params.batch - 批次编码
 */
export async function importData(params) {
  return request(
    `${params.prefixPatch}/v1/${organizationId}/import/data/data-import?templateCode=${
      params.templateCode
    }&batch=${params.batch}`,
    {
      method: 'POST',
    }
  );
}

/**
 * 导入数据到正式库
 * @async
 * @function updateOne
 * @param {Object} params - 查询参数
 * @param {String} params.prefixPatch - 客户端路径前缀
 * @param {String} params.data - 单条保存数据
 * @param {String} params.id - 单条保存数据 id
 */
export async function updateOne(params) {
  return request(`${params.prefixPatch}/v1/${organizationId}/import/data/${params.id}`, {
    method: 'PUT',
    body: params.data,
  });
}

/**
 * 状态查询
 * @async
 * @function queryStatus
 * @param {Object} params - 查询参数
 * @param {String} params.templateCode - 模板编码
 * @param {String} params.prefixPatch - 客户端路径前缀
 * @param {String} params.batch - 批次编码
 */
export async function queryStatus(prefixPatch, params = {}) {
  return request(`${prefixPatch}/v1/${organizationId}/import/data/status`, {
    query: params,
  });
}
