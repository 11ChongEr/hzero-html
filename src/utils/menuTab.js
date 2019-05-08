/**
 * @date 2018-07-15
 * @version 1.0.0
 * @author WY
 * @email  yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */
/* eslint no-underscore-dangle: ["error", { "allow": ["_store"] }] */

import { routerRedux } from 'dva/router';
import pathToRegexp from 'path-to-regexp';
import { forEach, findIndex, isString, split, slice, isEmpty, isArray } from 'lodash';
import EventEmitter from 'event-emitter';

import { getSession, setSession } from './utils';
// import intl from './intl';

export const menuTabEventManager = new EventEmitter();

const menuTabBeforeRemoveEvents = new Map();

/**
 * 添加对应 某个tab 的关闭前时间
 * @export
 * @param {string} tabKey
 * @param {() => boolean | Promise} onBeforeHandler - 返回 false 或 Promise.reject 不会关闭 tab
 */
export function onBeforeMenuTabRemove(tabKey, onBeforeHandler) {
  if (menuTabBeforeRemoveEvents.has(tabKey)) {
    console.warn('同一个tab关闭前事件只能有一个回调');
  } else {
    menuTabBeforeRemoveEvents.set(tabKey, onBeforeHandler);
  }
}

/**
 * 获取 某个tab的 onBefore 事件
 * @export
 * @param {string} tabKey
 * @returns {() => boolean | Promise} onBeforeHandler - 返回 false 或 Promise.reject 不会关闭 tab
 */
export function getBeforeMenuTabRemove(tabKey) {
  return menuTabBeforeRemoveEvents.get(tabKey);
}

/**
 * 移除 某个tab的 onBefore 事件
 * @export
 * @param {string} tabKey
 * @returns {boolean}
 */
export function deleteBeforeMenuTabRemove(tabKey) {
  return menuTabBeforeRemoveEvents.delete(tabKey);
}

// const menuItemType = {
//   root: 'root',
//   dir: 'dir',
//   menu: 'menu',
// };

/**
 * 用来在菜单还没有加载的时候保存 pathname
 */
const pathnameStack = [];
// 存储 tabs 的 key
const menuTabSessionKey = 'menuTabSessionKey';

// 工作台 tab
const workplaceTab = {
  title: 'hzero.common.title.workspace', // todo 可不可以使用编码, openTab 时 使用 title: intl.get(title).d(title),
  icon: 'home',
  closable: false,
  key: '/workplace',
  path: '/workplace',
};

/**
 * 获得tab的数据
 */
function getTabData() {
  const state = window.dvaApp._store.getState();
  const { global: { tabs = [] } = {} } = state;
  return tabs;
}

/**
 * 获得菜单的数据
 */
function getMenuData() {
  const state = window.dvaApp._store.getState();
  const { global: { menu = [] } = {} } = state;
  return menu;
}

/**
 * 判断菜单是否加载完毕
 */
function isMenuLoaded() {
  const state = window.dvaApp._store.getState();
  const { global: { menuLoad = false } = {} } = state;
  return menuLoad;
}

/**
 * 获取所有的路由信息
 */
function getRouterData() {
  const state = window.dvaApp._store.getState();
  const { global: { routerData = {} } = {} } = state;
  return routerData;
}

/**
 * 获取真正的 pathname 和 search
 * 有些 监听 到的 url 可能被 search 污染了, 需要把 search 剥离出去
 * 注意 有些 search 可能还是在 location 中，而不是在url， 所以 search 可能为空
 * @param {!String} pathname - url 地址
 */
function getLocation(pathname) {
  const [realPathname, search] = split(pathname, '?');
  return { pathname: realPathname, search };
}

/**
 * 判断是不是合法的tabPathname
 * '' / 登录,登出 其他的都认为合法的pathname
 * '' / /user/login /user/logout
 * @param {!String} pathname - 切换的pathname
 */
function isValidTabPathname(pathname) {
  return (
    isString(pathname) &&
    findIndex(
      ['', '/', '/user/login', '/user/logout'],
      invalidPathname => invalidPathname === pathname
    ) === -1
  );
}

/**
 * 从pathname中获取 tabKey
 * @param {!String} pathname - 切换的pathname
 */
function getTabKey(pathname) {
  return slice(split(pathname, '/'), 1);
}

/**
 *  判断新的tabKey 与 之前的 tabKey 的区别
 * @param {!String[]} newTabKey - 新的页面的 tabKey
 * @param {String[]} [oldTabKey=[]] - tab的 tabKey
 * @return {Number} 0: 不是同一个tab,1: 是同一个tab
 */
function diffTabKey(newTabKey, oldTabKey = []) {
  const nLen = newTabKey.length;
  const oLen = oldTabKey.length;
  const maxLen = Math.max(oLen, nLen);
  const minLen = Math.min(oLen, nLen);
  let index = 0;
  for (; index < maxLen; index++) {
    if (newTabKey[index] !== oldTabKey[index]) {
      break;
    }
  }
  if (minLen === index) {
    // 从列表到详情
    return 1;
  }
  return 0;
}

/**
 * 替换原先的tab 同时 更新 activeKey
 * @param {!Object} tab - 需要替换的
 * @param {!String} pathname - 新的页面path
 * @param {String|Object} search - search
 */
function replaceTabPath(tab, pathname, search) {
  const newTab = {
    ...tab,
    path: pathname,
    search,
  };
  window.dvaApp._store.dispatch({
    type: 'global/replaceTab',
    payload: {
      tab,
      newTab,
    },
  });
}

// /**
//  * 获取离匹配 tabKey 最深的menu信息
//  * @param {!String[]} tabKey - tabKey
//  * @param {!Object[]} menuData - 菜单的信息
//  * @return {deepestMenuPathTabKey,deepestMenu} - 返回的数据结构
//  */
// function getTabDeepestMenuInfo(tabKey, menuData) {
//   let path = '';
//   let deepestMenuPathKey;
//   let deepestMenu = { children: menuData };
//   forEach(tabKey, key => {
//     path += `/${key}`;
//     forEach(deepestMenu.children, menu => {
//       if (menu.path === path) {
//         deepestMenuPathKey = path;
//         deepestMenu = menu;
//         return false;
//       }
//     });
//   });
//   // 菜单中 没有最近的菜单, tabKey 是非法的
//   return deepestMenu.children === menuData
//     ? null
//     : {
//         deepestMenuPathTabKey: getTabKey(deepestMenuPathKey),
//         deepestMenu,
//       };
// }

/**
 * 获取菜单
 * warn 会修改 menuData 菜单对象, 加上 pathRegexp
 */
function getMenuInfoByRoute(route, menuData) {
  // menuData 是数组
  if (isArray(menuData)) {
    for (let i = 0; i < menuData.length; i++) {
      const menu = getMenuInfoByRoute(route, menuData[i]);
      if (menu) {
        return menu;
      }
    }
  } else if (isArray(menuData.children)) {
    // menuData 是 目录
    const menu = getMenuInfoByRoute(route, menuData.children);
    if (menu) {
      return menu;
    }
  } else if (menuData.path) {
    if (!menuData.pathRegexp) {
      menuData.pathRegexp = pathToRegexp(menuData.path, [], { end: false }); // eslint-disable-line
    }
    if (menuData.pathRegexp.test(route.path)) {
      return menuData; // 找到 菜单
    }
  }
  return null;
}

/**
 * 通过 key 获取 tab
 * 如果没有找到 返回 默认 tab
 * @param {!String} key - tab 的 key
 */
export function getTabFromKey(key) {
  const tabData = getTabData();
  let findTab = workplaceTab;
  forEach(tabData, tab => {
    if (tab.key === key) {
      findTab = tab;
      return false;
    }
  });
  return findTab;
}

/**
 * 获取初始化的tab
 */
export function getInitialTabData() {
  const prevTabs = getSession(menuTabSessionKey);
  if (isEmpty(prevTabs.tabs)) {
    return [workplaceTab];
  } else {
    return prevTabs.tabs;
  }
}

/**
 * 获取初始化的 activeKey
 * @returns {*}
 */
export function getInitialActiveTabKey() {
  const prevTabs = getSession(menuTabSessionKey);
  if (isEmpty(prevTabs.activeTabKey)) {
    return '/workplace';
  } else {
    return prevTabs.activeTabKey;
  }
}

/**
 * 通过 tabKey 查找 tab
 * 如果没有找到 返回 null
 * @param {!String} key
 * @returns
 */
function findTabFromKey(key) {
  const tabData = getTabData();
  let findTab = null;
  forEach(tabData, tab => {
    if (tab.key === key) {
      findTab = tab;
      return false;
    }
  });
  return findTab;
}

/**
 * 通过 路径 获取 路由
 * @param {*} pathname
 * @returns
 */
function findRouteFromPathname(pathname) {
  const routerData = getRouterData();
  let findRoute;
  forEach(routerData, route => {
    if (route && route.pathRegexp && route.pathRegexp.test(pathname)) {
      findRoute = route;
      return false;
    }
  });
  return findRoute;
}

/**
 * 获取当前激活的 tab Key
 */
export function getActiveTabKey() {
  const state = window.dvaApp._store.getState();
  const { global: { activeTabKey } = {} } = state;
  return activeTabKey;
}

/**
 * 添加 tab 并且 切换路由
 */
function addTabAndPush(tab) {
  createTab(tab);
  push(tab.path, tab.search);
}

/**
 * 激活tab 并且 切换路由
 * @param {*} tab
 */
function activeTabAndPush(tab) {
  activeTab(tab);
  push(tab.path, tab.search);
}

/**
 * @param {!String} path - 将要跳转的path
 * @param {!String} search - history 的search信息
 */
function push(path, search) {
  if (isString(path)) {
    window.dvaApp._store.dispatch(
      routerRedux.push({
        pathname: path,
        search,
      })
    );
  }
}

/**
 * 创建 tab
 * @param {!Object} tab - tab数据
 * @param {!String} tab.key - 打开 tab 的 key
 * @param {String} [tab.path=key] - 打开页面的path
 * @param {String} [tab.title='NewTab'] - tab的标题
 * @param {String} [tab.icon=null] - icon的值,antd 的 Icon
 * @param {Boolean} [tab.closable=true] - tab 是否可以关闭
 */
function createTab(tab) {
  window.dvaApp._store.dispatch({
    type: 'global/addTab',
    payload: {
      newTab: tab,
    },
  });
}

/**
 *
 * @param {!Object} tab - tab数据
 * @param {!String} tab.key - 打开 tab 的 key
 * @param {String} [tab.path=key] - 打开页面的path
 * @param {String} [tab.title='NewTab'] - tab的标题
 * @param {String} [tab.icon=null] - icon的值,antd 的 Icon
 * @param {Boolean} [tab.closable=true] - tab 是否可以关闭
 */
function activeTab(tab) {
  window.dvaApp._store.dispatch({
    type: 'global/replaceTab',
    payload: {
      newTab: tab,
      tab,
    },
  });
}

/**
 * 更新对应key的tab 做 {...oldTab, ...updateTab} 操作
 * @param {Object} tab - 更新的tab
 */
export function updateTab(tab) {
  window.dvaApp._store.dispatch({
    type: 'global/updateTab',
    payload: tab,
  });
}

/**
 * 入口, 切换或者新建 tab
 * @todo 不能在同tab 打开同tab
 * @param {!String} key - 打开 tab 的 key
 * @param {String} [path=key] - 打开页面的path
 * @param {String} [title='NewTab'] - tab的标题
 * @param {String} [icon=null] - icon的值,antd 的 Icon
 * @param {Boolean} [closable=true] - tab 是否可以关闭
 * @param {String} [search] - history 的 search 值
 */
export function openTab(newTab) {
  const { key, path = key, title, icon = null, closable = true, search } = newTab;
  const oldTab = findTabFromKey(key);
  const activeTabKey = getActiveTabKey();
  if (oldTab === null) {
    addTabAndPush({ key, path, title, icon, closable, search });
  } else if (activeTabKey === oldTab.key) {
    activeTab(oldTab);
  } else {
    activeTabAndPush({ ...oldTab, ...newTab });
  }
}

/**
 * 关闭 tab
 * @param {!String} key - tab 的key
 */
export function closeTab(key) {
  if (isString(key)) {
    // window.dvaApp._store
    //   .dispatch({
    //     type: 'global/getRemoveTabInfo',
    //     payload: key,
    //   })
    //   .then(removeTabInfo => {
    //     // 如果是关闭当前tab,需要打开新的Tab
    //     if (removeTabInfo.nextActiveTabKey) {
    //       openTab(removeTabInfo.nextTab);
    //     }
    //     // 设置新的tabs
    //     window.dvaApp._store.dispatch({
    //       type: 'global/updateState',
    //       payload: {
    //         tabs: removeTabInfo.nextTabs,
    //       },
    //     });
    //   });
    window.dvaApp._store
      .dispatch({
        type: 'global/removeTab',
        payload: key,
      })
      .then(nextKey => {
        menuTabEventManager.emit('close', { tabKey: key });
        openTab({ key: nextKey });
      });
  }
}

/**
 * tabListen - 对tab进行切换,或者替换操作
 * 切换tab的入口方法
 * @param {!String} [pathname=''] - 切换的pathname
 */
export function tabListen(pathname = '') {
  const menuData = getMenuData();
  if (!isMenuLoaded()) {
    if (isValidTabPathname(pathname)) {
      pathnameStack.push(pathname);
    }
    return;
  } else {
    // 在菜单和路由加载完成后 tabListen
    while (pathnameStack.length) {
      const lPathname = pathnameStack.pop();
      tabListen(lPathname);
    }
  }
  const { _history: { location: { search } = {} } = {} } = window.dvaApp;
  const { pathname: realPathname, search: realSearch = search } = getLocation(pathname);

  if (isValidTabPathname(realPathname)) {
    // 从 tabs 中拿到 对应path 的 tab 和 activeKey
    const state = window.dvaApp._store.getState();
    const { global: { tabs = [], activeTabKey } = {} } = state;
    let listenTab;
    forEach(tabs, tab => {
      if (tab.path === realPathname) {
        listenTab = tab;
        return false;
      }
    });
    if (isEmpty(listenTab)) {
      // 打开新的 tab 或者 切换tab
      const route = findRouteFromPathname(realPathname);
      // eslint-disable-next-line
      if (isEmpty(route)) {
        // 非法的路径,在router中不存在
        // todo 打开 404 页面 而不是在工作台 404
      } else if (route.authorized) {
        // 打开新的 tab
        // openTab 也可以打开新的tab
        const routeTabKey = route.key || realPathname;
        let routeTab;
        forEach(tabs, tab => {
          if (tab.key === routeTabKey) {
            routeTab = tab;
            return false;
          }
        });
        const newRouteTab = {
          key: route.key || realPathname,
          path: realPathname,
          title: route.title,
          icon: route.icon,
          closable: true,
          search: realSearch,
        };
        if (routeTab) {
          updateTab(newRouteTab);
        } else {
          createTab(newRouteTab);
        }
      } else {
        // 查询 tabKey 是否在 tab 中存在
        // 查找菜单中最深的 菜单
        const tabData = getTabData();
        const newTabKey = getTabKey(realPathname);
        let hasUpdate = false;
        const menu = getMenuInfoByRoute(route, menuData);
        // const deepestMenuInfo = getMenuInfoByTabKey(newTabKey, menuData);
        if (menu !== null) {
          forEach(tabData, tab => {
            switch (diffTabKey(newTabKey, getTabKey(tab.key))) {
              case 0:
                break;
              case 1:
                // 存在, 切换 activeTab 并更新 path
                hasUpdate = true;
                replaceTabPath(tab, realPathname, realSearch);
                return false;
              default:
                break;
            }
          });
          if (!hasUpdate) {
            // 不存在, 打开新的 tab
            createTab({
              path: realPathname,
              title: menu.name,
              icon: menu.icon,
              closable: true,
              key: menu.path,
              search: realSearch,
            });
          }
        } else {
          // warn 菜单中没有对应的 tab, 404
          // todo 打开 404 页面 而不是在工作台 404
        }
      }
    } else if (listenTab.key !== activeTabKey) {
      // 切换 activeTab, pathname === listenTab.path
      replaceTabPath(listenTab, realPathname, realSearch);
    }
  }
}

export function persistMenuTabs() {
  const { tabs = [], activeTabKey = '/workplace' } = window.dvaApp._store.getState().global || {};
  const persistenceTabs = { tabs, activeTabKey };
  setSession(menuTabSessionKey, persistenceTabs);
}

/**
 * 清空 menuTabs 的缓存
 * warn 要注意调用顺序, 先清除 sessionStorage 里面的数据, 再清空 redux 里面的数据
 */
export function cleanMenuTabs() {
  setSession(menuTabSessionKey, {});
  openTab(workplaceTab); // 先打开工作台 再清空数据 注意顺序
  window.dvaApp._store.dispatch({
    type: 'global/cleanTabs',
  });
}

window.openTab = openTab; // 需要暴露到 window 下，消息那里有调用 openTab 的地方

// TODO 在完成 测试后 要删除
window.closeTab = closeTab;
