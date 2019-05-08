import fetch from 'dva/fetch';
import { notification } from 'hzero-ui';
import { API_HOST, AUTH_URL, AUTH_SELF_URL } from './config';
import {
  generateUrlWithGetParam,
  getAccessToken,
  removeAccessToken,
  removeAllCookie,
  filterNullValueObject,
} from './utils';

notification.config({
  placement: 'bottomRight',
});

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const errortext = response.statusText;
  const error = new Error(errortext);
  error.name = response.status;
  error.response = response;
  throw error;
}

const headers = {
  Pragma: 'no-cache',
  'Cache-Control': 'no-cache',
};

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options) {
  const defaultOptions = {
    credentials: 'include',
    headers,
  };

  // TODO: API MOCK 代理
  let newUrl = !url.startsWith('/api') && !url.startsWith('http') ? `${API_HOST}${url}` : url;

  const newOptions = { ...defaultOptions, ...options };
  if (
    newOptions.method === 'POST' ||
    newOptions.method === 'PUT' ||
    newOptions.method === 'DELETE' ||
    newOptions.method === 'PATCH'
  ) {
    if (!(newOptions.body instanceof FormData)) {
      newOptions.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json; charset=utf-8',
        ...newOptions.headers,
      };
      newOptions.body = JSON.stringify(newOptions.body);
    } else {
      // newOptions.body is FormData
      newOptions.headers = {
        Accept: 'application/json',
        ...newOptions.headers,
      };
    }
  }

  // 头查询参数
  if (newOptions.query) {
    let filterNullQuery = newOptions.query;
    if (newOptions.method === 'GET') {
      filterNullQuery = filterNullValueObject(newOptions.query);
    }
    newUrl = generateUrlWithGetParam(newUrl, filterNullQuery);
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    newOptions.headers = {
      ...newOptions.headers,
      Authorization: `bearer ${accessToken}`,
    };
  }

  return fetch(newUrl, newOptions)
    .then(checkStatus)
    .then(response => {
      if (response.status === 204) {
        return {};
      }
      if (newOptions.responseType === 'blob') {
        return response.blob();
      }
      return newOptions.responseType === 'text' ? response.text() : response.json();
    })
    .catch(e => {
      const status = e.name;

      if (status === 401) {
        removeAccessToken();
        removeAllCookie();
        const cacheLocation = encodeURIComponent(window.location.toString());
        window.location.href = `${AUTH_URL}&redirect_uri=${cacheLocation}`; // 401 需要在登录后返回401的页面
        return; // 正常流程 这里结束
      }

      if (newUrl.indexOf(AUTH_SELF_URL) !== -1) {
        // self 接口报错后需要 跳转到错误页面
        return e;
      }

      notification.error({
        message: `${status}`,
        description: e.message,
      });
    });
}
