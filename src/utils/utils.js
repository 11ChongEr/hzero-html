import qs from 'querystring';
import Cookies from 'universal-cookie';
import { notification } from 'hzero-ui';
import {
  isArray,
  isEmpty,
  forEach,
  isRegExp,
  isNumber,
  isUndefined,
  uniq,
  sortBy,
  pull,
  forIn,
} from 'lodash';
import moment from 'moment';
import pathToRegexp from 'path-to-regexp';
import {
  DEFAULT_DATE_FORMAT,
  DEFAULT_DATETIME_FORMAT,
  DEFAULT_TIME_FORMAT,
  PAGE_SIZE_OPTIONS,
} from './constants';
import { totalRender } from './renderer';
import { HZERO_FILE } from './config';
import intl from './intl';

export function getPlainNode(nodeList, parentPath = '') {
  const arr = [];
  nodeList.forEach(node => {
    const item = node;
    item.path = `${parentPath}/${item.path || ''}`.replace(/\/+/g, '/');
    item.exact = true;
    if (item.children && !item.component) {
      arr.push(...getPlainNode(item.children, item.path));
    } else {
      if (item.children && item.component) {
        item.exact = false;
      }
      arr.push(item);
    }
  });
  return arr;
}

//
// export function digitUppercase(n) {
//   const fraction = ['角', '分'];
//   const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
//   const unit = [['元', '万', '亿'], ['', '拾', '佰', '仟']];
//   let num = Math.abs(n);
//   let s = '';
//   fraction.forEach((item, index) => {
//     s += (digit[Math.floor(num * 10 * 10 ** index) % 10] + item).replace(/零./, '');
//   });
//   s = s || '整';
//   num = Math.floor(num);
//   for (let i = 0; i < unit[0].length && num > 0; i += 1) {
//     let p = '';
//     for (let j = 0; j < unit[1].length && num > 0; j += 1) {
//       p = digit[num % 10] + unit[1][j] + p;
//       num = Math.floor(num / 10);
//     }
//     s = p.replace(/(零.)*零$/, '').replace(/^$/, '零') + unit[0][i] + s;
//   }
//
//   return s
//     .replace(/(零.)*零元/, '元')
//     .replace(/(零.)+/g, '零')
//     .replace(/^整$/, '零元整');
// }

function getRelation(str1, str2) {
  if (str1 === str2) {
    console.warn('Two path are equal!'); // eslint-disable-line
  }
  const arr1 = str1.split('/');
  const arr2 = str2.split('/');
  if (arr2.every((item, index) => item === arr1[index])) {
    return 1;
  } else if (arr1.every((item, index) => item === arr2[index])) {
    return 2;
  }
  return 3;
}

function getRenderArr(routes) {
  let renderArr = [];
  renderArr.push(routes[0]);
  for (let i = 1; i < routes.length; i += 1) {
    let isAdd = false;
    // 是否包含
    isAdd = renderArr.every(item => getRelation(item, routes[i]) === 3);
    // 去重
    renderArr = renderArr.filter(item => getRelation(item, routes[i]) !== 1);
    if (isAdd) {
      renderArr.push(routes[i]);
    }
  }
  return renderArr;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {string} path
 * @param {routerData} routerData
 */
export function getRoutes(path, routerData = {}) {
  /* FIXME: START 会选到不是直接子路由 */
  // let routes = Object.keys(routerData).filter(
  //   routePath => routePath.indexOf(path) === 0 && routePath !== path
  // );
  let routes = [];
  // 匹配到的 路由的 path。相当于 match.path
  let routerPath = '';
  // 匹配到的 路由的 path 的 开始正则。
  // 用来找到 当前 path 的路由 和 所有子路由
  let routerPathRegexpStart;
  forEach(routerData, (route, routePath) => {
    if (isRegExp(routerPathRegexpStart)) {
      // 找到 router 下 path 对应路由 及 他的所有子路由
      if (routerPathRegexpStart.test(routePath)) {
        routes.push(routePath);
      }
    } else if (route.pathRegexp.test(path)) {
      // 先找到 对应的 router 里面的 路由
      // routes.push(route);
      routerPath = routePath;
      routerPathRegexpStart = pathToRegexp(routerPath, [], { end: false });
    }
  });
  /* FIXME: END */
  // Replace path to '' eg. path='user' /user/name => name
  routes = routes.map(item => item.replace(path, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routes);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routes.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${path}${item}`],
      key: `${path}${item}`,
      path: `${path}${item}`,
    };
  });
  return renderRoutes;
}

/**
 * Get router routing configuration
 * { path:{name,...param}}=>Array<{name,path ...param}>
 * @param {String} path
 * @param {Object} [routerData={}]
 */
export function getRoutesContainsSelf(path, routerData = {}) {
  const routes = [];
  // 匹配到的 路由的 path。相当于 match.path
  let routerPath = '';
  // 匹配到的 路由的 path 的 开始正则。
  // 用来找到 当前 path 的路由 和 所有子路由
  let routerPathRegexpStart;
  forEach(routerData, (route, routePath) => {
    if (isRegExp(routerPathRegexpStart)) {
      // 找到 router 下 path 对应路由 及 他的所有子路由
      if (routerPathRegexpStart.test(routePath)) {
        routes.push(route);
      }
    } else if (route.pathRegexp.test(path)) {
      // 先找到 对应的 router 里面的 路由
      routes.push(route);
      routerPath = routePath;
      routerPathRegexpStart = pathToRegexp(routerPath, [], { end: false });
    }
  });
  // if(routerPathRegexpStart){
  //   // 对象遍历时 顺序时不确定的。
  //   lodash.forEach(routerData,(route,routePath)=>{
  //     // 找到 router 下 path 对应路由 及 他的所有子路由
  //     if(routerPathRegexpStart.test(routePath)){
  //       routes.push(route);
  //     }
  //   });
  // }
  // 所有匹配到的路由的 path
  let routePaths = [];
  forEach(routes, route => {
    routePaths.push(route.path);
  });
  routePaths = routePaths.map(item => item.replace(routerPath, ''));
  // Get the route to be rendered to remove the deep rendering
  const renderArr = getRenderArr(routePaths);
  // Conversion and stitching parameters
  const renderRoutes = renderArr.map(item => {
    const exact = !routePaths.some(route => route !== item && getRelation(route, item) === 1);
    return {
      exact,
      ...routerData[`${routerPath}${item}`],
      key: `${routerPath}${item}`,
      path: `${routerPath}${item}`,
    };
  });
  return renderRoutes;
}

/* eslint no-useless-escape:0 */
const reg = /(((^https?:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/g;

export function isUrl(path) {
  return reg.test(path);
}

/**
 * 生成带Get参数的URL
 * @param {String} url      原来的url
 * @param {Object} params   get 参数
 */
export function generateUrlWithGetParam(url, params) {
  let newUrl = url;
  if (params && Object.keys(params).length >= 1) {
    const newParams = params; // filterNullValueObject
    if (Object.keys(newParams).length >= 1) {
      newUrl += `${url.indexOf('?') >= 0 ? '&' : '?'}${qs.stringify(newParams)}`;
    }
  }
  return newUrl;
}

export const ACCESS_TOKEN = 'access_token';
const cookies = new Cookies();

/**
 * 抽取AccessToken
 * @param {String} hash   hash值
 */
export function extractAccessTokenFromHash(hash) {
  if (hash) {
    const ai = hash.indexOf(ACCESS_TOKEN);
    if (ai !== -1) {
      const accessTokenReg = /#?access_token=[0-9a-zA-Z-]*/g; // todo 确定 确定的 access_token 头, 现在看起来时 /#access_token
      hash.match(accessTokenReg);
      const centerReg = hash.match(accessTokenReg)[0];
      const accessToken = centerReg.split('=')[1];
      return accessToken;
    }
  }
  return null;
}

export function getAccessToken() {
  return cookies.get(ACCESS_TOKEN, {
    path: '/',
  });
}

export function setAccessToken(token) {
  // const expires = expiresion * 1000;
  // const expirationDate = new Date(Date.now() + expires);
  // let option;

  cookies.set(ACCESS_TOKEN, token, {
    path: '/',
  });
}

export function removeAccessToken() {
  cookies.remove(ACCESS_TOKEN, {
    path: '/',
  });
}

export function removeAllCookie() {
  forIn(cookies.getAll(), (value, key) => {
    cookies.remove(key);
  });
}

export function isPromise(obj) {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof obj.then === 'function'
  );
}

/**
 * 根据传入的数据列表对象，生成页面分页参数对象
 * @param {object} data - 数据列表对象
 * @returns {object} pagination- 分页对象
 */
export function createPagination(data) {
  if (data) {
    return {
      showSizeChanger: true,
      pageSizeOptions: [...PAGE_SIZE_OPTIONS],
      // showQuickJumper: true,
      current: (isNumber(data.number) ? data.number : data.start) + 1,
      pageSize: data.size, // 每页大小
      total: isNumber(data.totalElements) ? data.totalElements : data.total,
      showTotal: totalRender,
    };
  }
}

/**
 * 表格批量新增操作, 添加数据行，更新分页信息
 * @author WH <heng.wei@hand-china.com>
 * @param {number} length - 数据列表长度
 * @param {object} pagination - 原始分页对象
 * @returns {object} pagination - 分页对象
 */
export function addItemToPagination(length, pagination = {}) {
  const { total = 0, pageSize = 10, current = 1, sourceSize } = pagination;
  const size = length === pageSize ? pageSize + 1 : pageSize;
  const source = isUndefined(sourceSize) ? pageSize : sourceSize;
  const pages = uniq([...pull([...PAGE_SIZE_OPTIONS], `${pageSize}`), `${size}`]);
  return {
    ...pagination,
    // 变更每页显示条数
    pageSizeOptions: sortBy(pages, item => +item),
    // 更新数据总量
    total: total + 1,
    // 记录pageSize的原始值
    sourceSize: source,
    // 根据 数据列表的长度与每页大小的情况，更新分页大小
    pageSize: size,
    // 变更showTotal信息
    showTotal: () =>
      totalRender(total + 1, [
        source * (current - 1) + 1,
        source * (current - 1) + size < total + 1 ? source * (current - 1) + size : total + 1,
      ]),
  };
}

/**
 * 表格批量新增操作, 移除数据行，更新分页信息
 * @author WH <heng.wei@hand-china.com>
 * @param {number} length - 数据列表长度
 * @param {object} pagination - 原始分页对象
 * @returns {object} pagination - 分页对象
 */
export function delItemToPagination(length, pagination = {}) {
  const { total = 1, pageSize = 10, current = 1, sourceSize } = pagination;
  const size = length === pageSize ? pageSize - 1 : pageSize;
  const pages = uniq([...pull([...PAGE_SIZE_OPTIONS], `${pageSize}`), `${size}`]);
  return {
    ...pagination,
    // 更新数据总量
    total: total - 1,
    // 变更每页显示条数
    pageSizeOptions: sortBy(pages, item => +item),
    // 根据 数据列表的长度与每页大小的情况，更新分页大小
    pageSize: size,
    // 变更showTotal信息
    showTotal: () =>
      totalRender(total - 1, [
        sourceSize * (current - 1) + 1,
        sourceSize * (current - 1) + size < total - 1
          ? sourceSize * (current - 1) + size
          : total - 1,
      ]),
  };
}

// 批量 表格编辑
// 增加可以无限增加, 由调用方做限制
// 删除时 分页大小 如果还原了就变为 原来的分页大小

/**
 * 表格批量新增操作, 添加数据行，更新分页信息
 * @author WH <heng.wei@hand-china.com> WY <yang.wang06@hand-china.com> (继承修改)
 * @param {number} addItemsLength - 新增数据长度
 * @param {number} currentLength - 当前数据长度
 * @param {object} pagination - 原始分页对象
 * @returns {object} pagination - 分页对象
 */
export function addItemsToPagination(addItemsLength, currentLength = 0, pagination = {}) {
  const { total = 0, pageSize = 10, current = 1, sourceSize } = pagination;
  const nextDataLength = currentLength + addItemsLength;
  const nextTotal = total + addItemsLength;
  const size = nextDataLength >= pageSize ? nextDataLength : pageSize;
  const source = isUndefined(sourceSize) ? pageSize : sourceSize;
  const pages = uniq([...pull([...PAGE_SIZE_OPTIONS], `${pageSize}`), `${size}`]);
  return {
    ...pagination,
    // 变更每页显示条数
    pageSizeOptions: sortBy(pages, item => +item),
    // 更新数据总量
    total: nextTotal,
    // 记录pageSize的原始值
    sourceSize: source,
    // 根据 数据列表的长度与每页大小的情况，更新分页大小
    pageSize: size,
    // 变更showTotal信息
    showTotal: () =>
      totalRender(nextTotal, [
        source * (current - 1) + 1,
        source * (current - 1) + size < nextTotal ? source * (current - 1) + size : nextTotal,
      ]),
  };
}

/**
 * 表格批量新增操作, 移除数据行，更新分页信息
 * @author WH <heng.wei@hand-china.com> WY <yang.wang06@hand-china.com> (继承修改)
 * @param {number} delItemsLength - 新增数据长度
 * @param {number} currentLength - 当前数据长度
 * @param {object} pagination - 原始分页对象
 * @returns {object} pagination - 分页对象
 */
export function delItemsToPagination(delItemsLength, currentLength = 0, pagination = {}) {
  const { total = 0, pageSize = 10, current = 1, sourceSize = pageSize } = pagination;
  const nextDataLength = currentLength - delItemsLength;
  const nextTotal = total - delItemsLength;
  const size = Math.max(nextDataLength <= pageSize ? nextDataLength : pageSize, sourceSize);
  const pages = uniq([...pull([...PAGE_SIZE_OPTIONS], `${pageSize}`), `${size}`]);
  return {
    ...pagination,
    // 更新数据总量
    total: nextTotal,
    // 变更每页显示条数
    pageSizeOptions: sortBy(pages, item => +item),
    // 根据 数据列表的长度与每页大小的情况，更新分页大小
    pageSize: size,
    // 变更showTotal信息
    showTotal: () =>
      totalRender(nextTotal, [
        sourceSize * (current - 1) + 1,
        sourceSize * (current - 1) + size < nextTotal
          ? sourceSize * (current - 1) + size
          : nextTotal,
      ]),
  };
}

// todo 调整消息返回
export function getResponse(response, errorCallback) {
  if (response && response.failed === true) {
    if (errorCallback) {
      errorCallback(response);
    } else {
      const msg = {
        message: intl.get('hzero.common.notification.error').d('操作失败'),
        description: response.message,
      };
      switch (response.type) {
        case 'info':
          notification.info(msg);
          break;
        case 'warn':
          notification.warning(msg);
          break;
        case 'error':
        default:
          notification.error(msg);
          break;
      }
    }
  } else {
    return response;
  }
}

/**
 * 过滤掉对象值为 undefined 和 空字符串 和 空数组 的属性
 * @author WH <heng.wei@hand-china.com>
 * @param {Object} obj
 * @returns {Object} 过滤后的查询参数
 */
export function filterNullValueObject(obj) {
  const result = {};
  if (obj && Object.keys(obj).length >= 1) {
    Object.keys(obj).forEach(key => {
      if (key && obj[key] !== undefined && obj[key] !== '' && obj[key] !== null) {
        // 如果查询的条件不为空
        if (isArray(obj[key]) && obj[key].length === 0) {
          return;
        }
        result[key] = obj[key];
      }
    });
  }
  return result; // 返回查询条件
}

/**
 * 获取当前租户id
 */
export function getCurrentOrganizationId() {
  return getCurrentTenant().tenantId;
}

/**
 * 获取当前用户所属租户 ID
 */
export function getUserOrganizationId() {
  return getCurrentUser().organizationId;
}

/**
 * 获取当前登录用户id
 */
export function getCurrentUserId() {
  return getCurrentUser().id;
}

/**
 * 存储sessionStorage
 */
export function setSession(key, value) {
  const formatValue = JSON.stringify(value);
  window.sessionStorage.setItem(key, formatValue);
  return true;
}

/**
 * 获取sessionStorage
 */
export function getSession(key) {
  const value = sessionStorage.getItem(key);
  if (value) {
    return JSON.parse(value);
  }
  return false;
}

/**
 * 获取当前登录用户所属的租户id
 * @returns {object}
 */
export function getCurrentUser() {
  // eslint-disable-next-line no-underscore-dangle
  const state = window.dvaApp._store.getState();
  const { user = {} } = state;
  const { currentUser = {} } = user;
  return currentUser;
}

/**
 * 获取当前登录用户的角色信息
 */
export function getCurrentRole() {
  // eslint-disable-next-line no-underscore-dangle
  const state = window.dvaApp._store.getState();
  const { user = {} } = state;
  const { currentUser = {} } = user;
  const { currentRoleId, currentRoleName, currentRoleLevel, currentRoleCode } = currentUser;
  return {
    id: currentRoleId,
    name: currentRoleName,
    level: currentRoleLevel,
    code: currentRoleCode,
  };
}

/**
 * 获取当前租户信息
 */
export function getCurrentTenant() {
  const state = window.dvaApp._store.getState();
  const { user = {} } = state;
  const { currentUser = {} } = user;
  const { tenantId, tenantName, tenantNum } = currentUser;
  return { tenantId, tenantName, tenantNum };
}

/**
 * 判断角色层级是否是租户层级
 */
export function isTenantRoleLevel() {
  const { level } = getCurrentRole();
  return level !== 'site';
}

/**
 * 解析查询参数
 * @param {Object} params
 */
export function parseParameter(params = {}) {
  const { page = { current: 1, pageSize: 10 }, sort = {}, body } = params;

  if (sort.order === 'ascend') {
    sort.order = 'asc';
  }
  if (sort.order === 'descend') {
    sort.order = 'desc';
  }

  const sortObj = {};
  if (!isEmpty(sort)) sortObj.sort = `${sort.field},${sort.order}`;

  return {
    page: page.current - 1,
    size: page.pageSize,
    ...body,
    ...sortObj,
  };
}

/**
 * 解析查询参数
 * @author WH <heng.wei@hand-china.com>
 * @param {Object} params
 * @returns {Object} 解析后的查询参数
 */
export function parseParameters(params = {}) {
  const { page = {}, sort = {}, ...others } = params;
  const { current = 1, pageSize = 10 } = page;
  if (sort.order === 'ascend') {
    sort.order = 'asc';
  }
  if (sort.order === 'descend') {
    sort.order = 'desc';
  }
  const sortObj = {};
  if (!isEmpty(sort)) sortObj.sort = `${sort.field},${sort.order}`;
  let size = pageSize;
  const sourceSize = [...PAGE_SIZE_OPTIONS];
  if (!sourceSize.includes(`${pageSize}`)) {
    const sizes = sortBy(uniq([...sourceSize, `${pageSize}`]), i => +i);
    const index = sizes.findIndex(item => +item === pageSize);
    size = +sizes[index - 1];
  }
  return {
    size,
    page: current - 1,
    ...others,
    ...sortObj,
  };
}

/**
 * getCodeMeaning - 在值集中根据value获取对应的meaning
 * @param {any} value - 值集中某对象的value
 * @param {Array<Object>} [code=[]] - 值集集合
 * @returns {string}
 */
export function getCodeMeaning(value, code = []) {
  let result;
  if (value && !isEmpty(code)) {
    const codeList = code.filter(n => n.value === value);
    if (!isEmpty(codeList)) {
      result = codeList[0].meaning;
    }
  }
  return result;
}

/**
 * 得到get请求后面的参数部分,并去掉参数值为空的
 * @param param
 * @returns {String}
 */
export function getUrlParam(param) {
  let on = true;
  let result = '';
  for (const item in param) {
    if (on) {
      on = false;
      if (param[item] || param[item] === 0 || param[item] === false) {
        result = `?${item}=${param[item]}`;
      } else {
        result = '?';
      }
    } else if (param[item] || param[item] === 0 || param[item] === false) {
      result = `${result}&${item}=${param[item]}`;
    }
  }
  return result;
}

/**
 * 获取日期(date)格式化字符串
 *
 * @export
 * @returns
 */
export function getDateFormat() {
  const { dateFormat = DEFAULT_DATE_FORMAT } = getCurrentUser();
  return dateFormat;
}

/**
 * 获取日期(dateTime)格式化字符串
 * @export
 * @returns
 */
export function getDateTimeFormat() {
  const { dateTimeFormat = DEFAULT_DATETIME_FORMAT } = getCurrentUser();
  return dateTimeFormat;
}

/**
 * 获取时间(time)格式化字符串
 * @export
 * @returns
 */
export function getTimeFormat() {
  const { timeFormat = DEFAULT_TIME_FORMAT } = getCurrentUser();
  return timeFormat;
}

/**
 * 获取当前设置的时区
 */
export function getTimeZone() {
  const { timeZone } = getCurrentUser();
  return timeZone;
}

/**
 * 获取系统当前语言
 * @export
 * @returns
 */
export function getCurrentLanguage() {
  // eslint-disable-next-line no-underscore-dangle
  const state = window.dvaApp._store.getState();
  const { global = {} } = state;
  const { language } = global;
  return language;
}

/**
 * 获取行内编辑表格中的 form
 * @param {array} dataSource - 表格数据源
 */
export function getEditTableForm(dataSource) {
  const formList = [];
  const fetchForm = (source, list) => {
    if (Array.isArray(source)) {
      source.forEach(item => {
        if (item.$form) {
          list.push(item.$form);
        }
        if (item.children && Array.isArray(item.children)) {
          fetchForm(item.children, list);
        }
      });
    }
  };
  fetchForm(dataSource, formList);
  return formList;
}

/**
 * 获取行内编辑表格中的 form
 * @param {array} dataSource - 表格数据源
 * @param {array} filterList - 过滤新增操作中的属性字段，例如：['children', 'unitId']，默认过滤 $form
 * @param {object} scrollOptions - 配置form效验报错后的滚动行为，默认是基于页面滚动，如果需要基于表格内滚动，需要：{ container: document.querySelector('.ant-table-body') }
 */
export function getEditTableData(dataSource = [], filterList = [], scrollOptions = {}) {
  const paramsList = [];
  const errList = [];
  const fetchForm = (source, list) => {
    if (Array.isArray(source)) {
      for (let i = 0; i < source.length > 0; i++) {
        if (source[i].$form && source[i]._status) {
          source[i].$form.validateFieldsAndScroll(
            { scroll: { allowHorizontalScroll: true }, ...scrollOptions },
            (err, values) => {
              if (!err) {
                const { $form, ...otherProps } = source[i];
                if (Array.isArray(filterList) && filterList.length > 0) {
                  for (const name of filterList) {
                    // 如果record中存在需要过滤的值，且是新增操作，执行过滤，默认过滤$form
                    // eslint-disable-next-line
                    if (source[i][name] && source[i]._status === 'create') {
                      delete otherProps[name];
                    }
                  }
                }
                list.push({ ...otherProps, ...values });
              } else {
                // 捕获表单效验错误
                errList.push(err);
              }
              return err;
            }
          );
        }
        if (source[i].children && Array.isArray(source[i].children)) {
          fetchForm(source[i].children, list);
        }
      }
    }
  };
  fetchForm(dataSource, paramsList);
  return errList.length > 0 ? [] : paramsList;
}

/**
 * 通过文件服务器的接口获取可访问的文件URL
 *
 * @export
 * @param {String} url 上传接口返回的 Url
 * @param {String} bucketName 桶名
 * @param {Number} tenantId 租户Id
 * @param {String} bucketDirectory 文件目录
 */
export function getAttachmentUrl(url, bucketName, tenantId, bucketDirectory) {
  const accessToken = getAccessToken();
  const params = qs.stringify(
    filterNullValueObject({
      bucketName,
      access_token: accessToken,
      directory: bucketDirectory,
    })
  );
  const newUrl = !isTenantRoleLevel()
    ? `${HZERO_FILE}/v1/files/download?${params}&url=${url}`
    : `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download?${params}&url=${url}`;
  return newUrl;
}

/**
 * 根据起始值生成响应的数组
 * @param {Number} start - 开始值
 * @param {Number} end - 结束值
 */
function newArray(start, end) {
  const result = [];
  for (let i = start; i < end; i++) {
    result.push(i);
  }
  return result;
}

/**
 * 生成 antd 的时间禁用支持函数
 * @param {String|Moment} data - 时间日期字符串
 * @param {String} type - 类型，可选 start, end
 */
export function disabledTime(data, type = 'start') {
  const DATE_FORMAT = 'YYYY-MM-DD';
  const timepoint = moment(data);
  const hour = timepoint.hour();
  const minute = timepoint.minute();
  const second = timepoint.second();

  console.log(hour, minute, second);
  return _data => {
    const _hour = _data && _data.hour();
    const _minute = _data && _data.minute();

    if (_data && _data.format(DATE_FORMAT) === timepoint.format(DATE_FORMAT)) {
      return {
        disabledHours() {
          if (type === 'end') {
            if (minute === 0 && second === 0) {
              return newArray(hour, 24);
            }
            return newArray(hour + 1, 24);
          } else {
            if (minute === 59 && second === 59) {
              return newArray(0, hour + 1);
            }
            return newArray(0, hour);
          }
        },
        disabledMinutes() {
          if (_hour === hour) {
            if (type === 'end') {
              if (second === 0) {
                return newArray(minute, 60);
              }
              return newArray(minute + 1, 60);
            } else {
              if (second === 59) {
                return newArray(0, minute + 1);
              }
              return newArray(0, minute);
            }
          } else {
            return [];
          }
        },
        disabledSeconds() {
          if (_hour === hour && _minute === minute) {
            if (type === 'end') {
              return newArray(second, 60);
            } else {
              return newArray(0, second + 1);
            }
          } else {
            return [];
          }
        },
      };
    }
  };
}

/**
 * tableScrollWidth - 计算滚动表格的宽度
 * 如果 fixWidth 不传或者为0, 会将没有设置宽度的列 宽度假设为 200
 * @param {array} columns - 表格列
 * @param {number} fixWidth - 不固定宽度列需要补充的宽度
 * @return {number} - 返回计算过的 x 值
 */
export function tableScrollWidth(columns = [], fixWidth = 0) {
  let fillFixWidthCount = 0;
  const total = columns.reduce((prev, current) => {
    if (current.width) {
      return prev + current.width;
    }
    fillFixWidthCount += 1;
    return prev;
  }, 0);
  if (fixWidth) {
    return total + fixWidth + 1;
  }
  return total + fillFixWidthCount * 200 + 1;
}

/**
 * 获取平台版本API
 */

export function getPlatformVersionApi(api) {
  const tenantId = getCurrentOrganizationId();
  const isTenantLevel = isTenantRoleLevel();
  return isTenantLevel ? `${tenantId}/${api}` : `${api}`;
}
