/**
 * API - 全局通用 API
 * @date: 2018-6-20
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import request from 'utils/request';
import { HZERO_PLATFORM, HZERO_FILE, HZERO_MSG, HZERO_IAM, API_HOST } from 'utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getAccessToken,
  getCurrentRole,
  getResponse,
  getCurrentLanguage,
} from 'utils/utils';

// primary 私有的api(组件, 页面无关的api)

/**
 * 查询菜单.
 * {HZERO_IAM}/hzero/v1/menus/tree
 * @param {object} query - 现在菜单会包含语言
 */
export async function queryMenu(query = {}) {
  const organizationId = getCurrentOrganizationId();
  const organizationRoleLevel = isTenantRoleLevel();
  const role = getCurrentRole();
  return request(
    organizationRoleLevel
      ? `${HZERO_IAM}/hzero/v1/${organizationId}/menus/tree`
      : `${HZERO_IAM}/hzero/v1/menus/tree`,
    {
      method: 'GET',
      query: {
        ...query,
        roldId: role.id,
      },
    }
  );
}

/**
 * 查询平台多语言国际化
 * {HZERO_PLATFORM}/v1/{organizationId}/prompt/{language}
 * @param {Number} organizationId
 * @param {String} language
 * @param {String} promptKey - 这里只用到了 hzero.common
 */
export async function queryPromptLocale(organizationId, language, promptKey) {
  return request(
    `${HZERO_PLATFORM}/v1/${organizationId}/prompt/${language}?promptKey=${promptKey}`
  );
}

/**
 * 获取antd的国际化
 * hzero-ui/lib/locale-provider/{language}.js
 * @param {String} language
 */
export async function getAntdLocale(language) {
  return import(`hzero-ui/lib/locale-provider/${language.replace('-', '_')}.js`);
}

/**
 * 查询 LOV 配置.
 * {HZERO_PLATFORM}/v1/lov-view/info
 * @param {Object} params 参数
 */
export async function queryLov(params) {
  const res = request(`${HZERO_PLATFORM}/v1/lov-view/info`, {
    query: params,
  });
  return getResponse(res);
}

/**
 * 查询 LOV 数据.
 * @param {string} url URL
 * @param {Object} params 参数
 */
export async function queryLovData(url, params) {
  const res = request(url, {
    query: params,
  });
  return getResponse(res);
}

// primary 私有的api(组件, 页面无关的api)

// /**
//  * 查询提示.
//  */
// export async function queryNotices() {
//   // return request('/api/notices');
// }

/**
 * 统一查询独立、SQL、URL类型的值集
 * {HZERO_PLATFORM}/v1/lovs/data
 * @param {String} lovCode - 值集code
 * @param {Object} params - 额外的查询参数
 */
export async function queryUnifyIdpValue(lovCode, params = {}) {
  return request(`${HZERO_PLATFORM}/v1/lovs/data`, {
    query: {
      lovCode,
      ...params,
    },
  });
}

/**
 * 查询单个独立值集值
 * {HZERO_PLATFORM}/v1/lovs/value
 * @param {String} lovCode
 */
export async function queryIdpValue(lovCode) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value`, {
    query: {
      lovCode,
    },
  });
}

/**
 * 批量查询独立值集值
 * {HZERO_PLATFORM}/v1/lovs/value/batch
 * @param {Object} params
 * @example queryMapIdpValue({ level: 'HPFM.LEVEL', dir: 'HPFM.DIRECTION' })
 */
export async function queryMapIdpValue(params) {
  return request(`${HZERO_PLATFORM}/v1/lovs/value/batch`, {
    query: params,
  });
}

// 没有用到的 api 先注释
// /**
//  * 根据父值集值查询子值集值
//  * {HZERO_PLATFORM}/v1/lovs/value/parent-value
//  * @param {Object} params
//  * @param {String} params.lovCode 子值集编码
//  * @param {String} params.parentValue 父值集值
//  */
// export async function queryParentIdpValue(params) {
//   return request(`${HZERO_PLATFORM}/v1/lovs/value/parent-value`, {
//     query: params,
//   });
// }

// 没有用到的 api 先注释
// /**
//  * 根据 tag 获取值集值
//  * {HZERO_PLATFORM}/v1/lovs/value/tag
//  * @param {Object} params
//  * @param {String} params.lovCode 值集编码
//  * @param {String} params.tag tag
//  */
// export async function queryTagIdpValue(params) {
//   return request(`${HZERO_PLATFORM}/v1/lovs/value/tag`, {
//     query: params,
//   });
// }

/**
 * 获取fileList
 * {HZERO_FILE}/v1/files/{attachmentUUID}/file
 * todo {HZERO_FILE}/v1/{organizationId}/files/{attachmentUUID}/file
 * @export
 * @param {object} params 传递参数
 * @param {string} params.attachmentUUID - 文件uuid
 */
export async function queryFileList(params) {
  const tenantId = getCurrentOrganizationId();
  return request(
    `${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${tenantId}/` : '/'}files/${
      params.attachmentUUID
    }/file`,
    {
      method: 'GET',
      query: params,
    }
  );
}

/**
 * 获取fileList(租户级)
 * {HZERO_FILE}/v1/{organizationId}/files/{attachmentUUID}/file
 * @export
 * @param {object} params 传递参数
 * @param {string} params.attachmentUUID - 文件uuid
 */
export async function queryFileListOrg(params) {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_FILE}/v1/${organizationId}/files/${params.attachmentUUID}/file`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 删除文件
 * {HZERO_FILE}/v1/files/delete-by-uuidurl/not-null
 * @export
 * @param {object} params 传递参数
 * @param {string} params.bucketName - 桶
 * @param {string} params.attachmentUUID - 文件uuid
 * @param {string[]} params.urls - 删除文件
 */
export async function removeFileList(params) {
  return request(
    `${HZERO_FILE}/v1/files/delete-by-uuidurl/not-null?bucketName=${
      params.bucketName
    }&attachmentUUID=${params.attachmentUUID}`,
    {
      method: 'POST',
      body: params.urls,
    }
  );
}

/**
 * 删除上传的文件
 * {HZERO_FILE}/v1/files/delete-by-url
 * {HZERO_FILE}/v1/{organizationId}/files/delete-by-url
 * @param {object} params
 * @param {string} params.bucketName
 */
export async function removeUploadFile(params) {
  const { ...otherParams } = params;
  const tenantId = getCurrentOrganizationId();
  return request(
    `${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${tenantId}/` : '/'}files/delete-by-url?bucketName=${
      params.bucketName
    }`,
    {
      method: 'POST',
      body: otherParams.urls,
    }
  );
}

/**
 * 删除attachmentUUID对应的某一个文件
 * {HZERO_FILE}/v1/files/delete-by-uuidurl
 * todo {HZERO_FILE}/v1/{organizationId}/files/delete-by-uuidurl
 * @export
 * @param {object} params 传递参数
 * @param {string} params.bucketName - 桶
 * @param {string} params.attachmentUUID - 文件uuid
 * @param {string[]} params.urls - 要删除的文件
 */
export async function removeFile(params) {
  const tenantId = getCurrentOrganizationId();
  return request(
    `${HZERO_FILE}/v1${
      isTenantRoleLevel() ? `/${tenantId}/` : '/'
    }files/delete-by-uuidurl?bucketName=${params.bucketName}&attachmentUUID=${
      params.attachmentUUID
    }`,
    {
      method: 'POST',
      body: params.urls,
    }
  );
}

/**
 * 删除attachmentUUID对应的某一个文件(租户级)
 * {HZERO_FILE}/v1/{organizationId}/files/delete-by-uuidurl
 * @export
 * @param {object} params 传递参数
 * @param {string[]} params.urls - 删除的文件
 * @param {string} params.bucketName - 桶
 * @param {string} params.attachmentUUID - 文件uuid
 */
export async function removeFileOrg(params) {
  const organizationId = getCurrentOrganizationId();
  const { bucketName, attachmentUUID, urls } = params;
  return request(`${HZERO_FILE}/v1/${organizationId}/files/delete-by-uuidurl`, {
    method: 'POST',
    query: { bucketName, attachmentUUID },
    body: urls,
  });
}

/**
 * 获取fileList
 * {HZERO_FILE}/v1/files/uuid
 * {HZERO_FILE}/v1/{organizationId}/files/uuid
 * @export
 * @param {object} params 传递参数
 */
export async function queryUUID(params) {
  const tenantId = getCurrentOrganizationId();
  return request(`${HZERO_FILE}/v1${isTenantRoleLevel() ? `/${tenantId}/` : '/'}files/uuid`, {
    method: 'POST',
    query: params,
  });
}

/**
 * 获取导出Excel的列数据
 * @export
 * @param {object} params 传递参数
 */
export async function queryColumn(params) {
  return request(`${params.requestUrl}`, {
    method: params.method,
    query: { exportType: 'COLUMN' },
  });
}

/**
 * 下载
 * @export
 * @param {object} params 传递参数
 * @param {string} params.requestUrl 下载文件请求的url
 * @param {array} params.queryParams 下载文件请求的查询参数，参数格式为：[{ name: '', value: '' }]]
 */
export async function downloadFile(params = {}) {
  const { requestUrl: url, queryParams, method } = params;
  let newUrl = !url.startsWith('/api') && !url.startsWith('http') ? `${API_HOST}${url}` : url;
  const iframeName = `${url}${Math.random()}`;

  // 构建iframe
  const iframe = document.createElement('iframe');
  iframe.setAttribute('name', iframeName);
  iframe.setAttribute('id', iframeName);
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.display = 'none';

  // 构建form
  const downloadForm = document.createElement('form');
  // form 指向 iframe
  downloadForm.setAttribute('target', iframeName);

  // 设置token
  const tokenInput = document.createElement('input');
  tokenInput.setAttribute('type', 'hidden');
  tokenInput.setAttribute('name', 'access_token');
  tokenInput.setAttribute('value', `${getAccessToken()}`);

  // 处理post请求时token效验
  if (method === 'POST') {
    newUrl = `${newUrl}?access_token=${getAccessToken()}`;
  }

  // 表单添加请求配置
  downloadForm.setAttribute('method', method);
  downloadForm.setAttribute('action', newUrl);
  downloadForm.appendChild(tokenInput);

  // 表单添加查询参数
  if (queryParams && Array.isArray(queryParams)) {
    queryParams.forEach(item => {
      const input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', item.name);
      input.setAttribute('value', item.value);
      downloadForm.appendChild(input);
    });
  }

  document.body.appendChild(iframe);
  document.body.appendChild(downloadForm);
  downloadForm.submit();

  // setTimeout(() => {
  //   document.body.removeChild(downloadForm);
  //   document.body.removeChild(iframe);
  // }, 2500);
  return true;
}

/**
 *查询未读的站内消息
 * {HZERO_MSG}/v1/{organizationId}/messages/user/preview
 * @export
 * @param {object} params
 */
export async function queryNotices() {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_MSG}/v1/${organizationId}/messages/user/preview`, {
    method: 'GET',
    query: { readFlag: 0 },
  });
}

/**
 *查询站内消息条数
 * {HZERO_MSG}/v1/{organizationId}/messages/user/count
 * @export
 */
export async function queryCount() {
  const organizationId = getCurrentOrganizationId();
  return request(`${HZERO_MSG}/v1/${organizationId}/messages/user/count`, {
    method: 'GET',
  });
}

/**
 * 查询TL多语言
 * {HZERO_PLATFORM}/v1/multi-language
 * @export
 * @param {object} params - 查询参数
 * @param {string} params.fieldName - 查询的表单域名称
 * @param {string} params._token - token
 */
export async function queryTL(params) {
  return request(`${HZERO_PLATFORM}/v1/multi-language`, {
    method: 'GET',
    query: params,
  });
}

/**
 * 变更用户的默认语言选项
 * @export
 * {HZERO_IAM}/hzero/v1/users/default-language
 * @function updateDefaultLanguage
 * @param {!string} params.languageCode - 语言编码
 * @returns fetch Promise
 */
export async function updateDefaultLanguage(params) {
  return request(`${HZERO_IAM}/hzero/v1/users/default-language`, {
    method: 'PUT',
    query: params,
  });
}

/**
 * 查询静态文本数据 不会报 400 异常, 异常全是 200
 * 需要自己处理异常(自己调用getResponse)
 * {HZERO_PLATFORM}/v1/static-texts/text/by-code/nullable
 * @param {string} textCode - 静态文本编码
 * @param {string} [lang=currentLanguage] - 语言 默认是系统当前语言
 * @return {Promise}
 */
export async function queryStaticText(textCode, lang = getCurrentLanguage()) {
  const organizationId = getCurrentOrganizationId();
  const organizationRoleLevel = isTenantRoleLevel();
  return request(
    `${HZERO_PLATFORM}/v1/${
      organizationRoleLevel ? `${organizationId}/` : ''
    }static-texts/text/by-code/nullable`,
    {
      query: {
        textCode,
        lang,
      },
      method: 'GET',
    }
  );
}

/**
 * 获取菜单对应的权限集
 * @param {string} params.service - 权限编码
 */
export async function getPermission(params) {
  const organizationId = getCurrentOrganizationId();
  return request(
    `${HZERO_IAM}/hzero/v1/${isTenantRoleLevel() ? `${organizationId}/` : ''}menus/buttons`,
    {
      query: { ...params },
      method: 'GET',
    }
  );
}

/**
 * 检验权限
 * @param {array} params.code - 权限编码
 */
export async function checkPermission(params) {
  return request(`${HZERO_IAM}/hzero/v1/menus/check-permissions`, {
    method: 'POST',
    body: params,
  });
}
