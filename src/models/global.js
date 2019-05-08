import pathToRegexp from 'path-to-regexp';
import { map, isBoolean, isNumber, forEach, isUndefined } from 'lodash';
import moment from 'moment';
import { isUrl, getResponse, getCurrentOrganizationId, getCurrentRole } from 'utils/utils';
import {
  tabListen,
  getInitialTabData,
  getInitialActiveTabKey,
  persistMenuTabs,
} from 'utils/menuTab';

import intl from 'utils/intl';
import { getRouterData } from 'utils/router';
import {
  queryNotices,
  queryMenu,
  queryPromptLocale,
  getAntdLocale,
  queryUnifyIdpValue,
  queryCount,
  updateDefaultLanguage,
} from '../services/api';

/**
 * 将原始的菜单数据转成 intl 的多语言格式
 * @param {object[]} menuData - 原始的请求菜单接口的数据
 * @param {object} menuLocaleIntl - 存储菜单的 localeIntl
 * @returns
 */
function parseMenuToLocaleIntl(menuData, menuLocaleIntl) {
  if (menuData) {
    menuData.forEach(menuItem => {
      // eslint-disable-next-line no-param-reassign
      menuLocaleIntl[menuItem.code] = menuItem.name;
      if (menuItem.subMenus) {
        parseMenuToLocaleIntl(menuItem.subMenus, menuLocaleIntl);
      }
    });
  }
}

function formatter(data, parentPath = '', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + path;
      path = path.replace('//', '/');
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      // result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
      result.children = formatter(item.children, path, item.authority);
    }
    return result;
  });
}

/**
 * 获取打平的菜单
 * @param {object[]} menus - 已经处理过的有层级的菜单
 */
function getFlatMenuData(menus) {
  let keys = {};
  menus.forEach(item => {
    if (item.children) {
      keys[item.path] = { ...item };
      keys = { ...keys, ...getFlatMenuData(item.children) };
    } else {
      keys[item.path] = { ...item };
    }
  });
  return keys;
}

function parseMenuData(menus, parent, menuData = []) {
  menuData.forEach(item => {
    const menuItem = {
      name: item.code, // 菜单的名字是多语言
      icon: item.icon,
      path: item.route || '', // oracle 数据库 没有返回 防止拼接时候 undefined
      id: item.id,
      parentId: item.parentId,
      // type: item.type,
    };
    if (parent) {
      parent.children = parent.children || []; // eslint-disable-line
      parent.children.push(menuItem);
    } else {
      menus.push(menuItem);
    }
    if (item.subMenus) {
      parseMenuData(menus, menuItem, item.subMenus);
    }
  });
}

async function querySupportLanguage() {
  return queryUnifyIdpValue('HPFM.LANGUAGE');
}

/**
 * 初始化 所有菜单的叶子节点
 * @param {Object} menu
 * @param {Object[]} queryMenus
 */
function getMenuNodeList(menu, queryMenus = []) {
  for (let i = 0; i < menu.length; i++) {
    if (isUndefined(menu[i].children)) {
      queryMenus.push({ ...menu[i], title: menu[i].name && intl.get(menu[i].name) });
    } else {
      getMenuNodeList(menu[i].children, queryMenus);
    }
  }
  return queryMenus;
}

// 存储 加载了哪些多语言, 还会存储 hzero-ui 的多语言
const localLangCache = {};

function getGlobalModalConfig({ app, getWrapperRouterData = e => e }) {
  return {
    namespace: 'global',

    state: {
      collapsed: false,
      menu: [],
      language: '', // 当前语言
      // language: 'zh_CN',
      antdLocale: {}, // 组件的国际化
      supportLanguage: [],
      routerData: {},
      notices: [],
      count: 0,
      menuLeafNode: [],
      tabs: getInitialTabData(),
      activeTabKey: getInitialActiveTabKey(),
    },

    effects: {
      /**
       * 首屏 预加载内容
       * 初始化语言和菜单数据
       */ *init(
        {
          payload: { language, organizationId },
        },
        { call, put, all }
      ) {
        // 第一次加载肯定是没有切换语言的
        localLangCache[language] = {};
        const promiseAllLocale = [
          call(getAntdLocale, language),
          call(queryPromptLocale, organizationId, language, 'hzero.common'),
        ];
        const [antdLocale, promptLocale] = yield all(promiseAllLocale);
        const safePromptLocale = getResponse(promptLocale);
        const loadLocales = intl.options.locales; // 设置或切换 当前intl的语言
        intl.init({
          currentLocale: language,
          locales: loadLocales,
          warningHandler: (/* e */) => {
            // todo
            // console.warn(e);
          },
        });
        intl.load({
          [language]: safePromptLocale,
        });
        moment.locale(antdLocale.locale); // TODO: LocaleProvider 中会设置 moment.locale，为何突然不起作用了?
        localLangCache[language].antdLocale = antdLocale;
        // const unreadMessageList = yield call(queryUnreadMessage);

        yield put({
          type: 'updateState',
          payload: {
            // messageList: unreadMessageList.content,
            antdLocale,
            language,
          },
        });
      },
      *lazyInit(
        {
          payload: { organizationId, language },
        },
        { call, put, all }
      ) {
        const [supportLanguage] = yield all([
          call(querySupportLanguage),
          // 获取角色列表, 角色切换用到
          put({ type: 'user/fetchRoleList', payload: { organizationId } }),
        ]);
        const safeSupportLanguage = getResponse(supportLanguage);
        const list = [];
        const menuListRes = yield call(queryMenu, { lang: language });
        const menuList = getResponse(menuListRes);
        const menuLocaleIntl = {};
        parseMenuToLocaleIntl(menuList, menuLocaleIntl);
        parseMenuData(list, null, menuList || []);
        const menus = formatter(list);
        parseMenuToLocaleIntl(menuList, menuLocaleIntl);
        intl.load({
          [language]: menuLocaleIntl,
        });
        const menuData = getFlatMenuData(menus);

        const routerConfig = getWrapperRouterData(app || window.dvaApp);
        const routerData = {};
        // The route matches the menu
        Object.keys(routerConfig).forEach(path => {
          // Regular match item name
          // eg.  router /user/:id === /user/chen
          const pathRegexp = pathToRegexp(path);
          const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
          let menuItem = {};
          // If menuKey is not empty
          if (menuKey) {
            menuItem = menuData[menuKey];
          }
          let router = routerConfig[path];
          // If you need to configure complex parameter routing,
          // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
          // eg . /list/:type/user/info/:id
          router = {
            ...router,
            name: router.name || menuItem.name,
            // tab 用到的数据
            pathRegexp,
            title: router.title || menuItem.name,
            icon: router.icon || menuItem.icon,
            closable: isBoolean(router.closable) ? router.closable : true,
            path,
            // tab 用到的数据
            authority: router.authority || menuItem.authority,
            hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
          };
          routerData[path] = router;
        });
        const queryMenus = getMenuNodeList(menus, []);
        yield put({
          type: 'updateState',
          payload: {
            routerData,
            menu: menus,
            menuLeafNode: queryMenus,
            supportLanguage: safeSupportLanguage,
            // 菜单加载完毕
            menuLoad: true,
          },
        });
      },
      *fetchNotices(_, { call, put }) {
        const data = yield call(queryNotices);
        yield put({
          type: 'saveNotices',
          payload: { notices: data },
        });
      },
      *fetchCount(_, { call, put }) {
        const data = yield call(queryCount);
        if (data && isNumber(data.unreadMessageCount)) {
          const { unreadMessageCount } = data;
          yield put({
            type: 'saveNotices',
            payload: { count: unreadMessageCount },
          });
        }
      },
      *changeLanguage({ payload }, { put }) {
        const language = payload;
        const organizationId = getCurrentOrganizationId();
        const roleId = getCurrentRole().id;
        yield put({
          type: 'updateLocale',
          payload: {
            language,
            roleId,
            organizationId,
          },
        });
      },
      /**
       * 更新国际化
       * antdLocale, commonLocale, menuLocale
       */ *updateLocale({ payload }, { call, put, all }) {
        // 角色id是必须的
        const { language, organizationId } = payload;
        if (!localLangCache[language]) {
          localLangCache[language] = {};
          const [antdLocale, promptLocale, menuData] = yield all([
            call(getAntdLocale, language),
            call(queryPromptLocale, organizationId, language, 'hzero.common'),
            call(queryMenu, { lang: language }),
          ]);
          const safePromptLocale = getResponse(promptLocale);
          const safeMenuData = getResponse(menuData);
          const safeMenuLocale = {};
          parseMenuToLocaleIntl(safeMenuData, safeMenuLocale);

          // 设置或切换 当前intl的语言
          const loadLocales = intl.options.locales;
          intl.init({
            currentLocale: language,
            locales: loadLocales,
            warningHandler: (/* e */) => {
              // todo
              // console.warn(e);
            },
          });

          intl.load({
            [language]: { ...safePromptLocale, ...safeMenuLocale },
          });
          localLangCache[language].antdLocale = antdLocale;
          moment.locale(antdLocale.locale); // TODO: LocaleProvider 中会设置 moment.locale，为何突然不起作用了?
          yield put({
            type: 'updateState',
            payload: {
              antdLocale,
              language,
            },
          });
        } else {
          const { [language]: { antdLocale = {} } = {} } = localLangCache;

          // 设置或切换 当前intl的语言
          const loadLocales = intl.options.locales;
          intl.init({
            currentLocale: language,
            locales: loadLocales,
            warningHandler: (/* e */) => {
              // todo
              // console.warn(e);
            },
          });

          const updateState = { language };
          if (antdLocale) {
            // 保证一定有antd的语言，没有可能是调用了多次 updateLocale
            updateState.antdLocale = antdLocale;
            moment.locale(antdLocale.locale); // TODO: LocaleProvider 中会设置 moment.locale，为何突然不起作用了?
          }
          yield put({
            type: 'updateState',
            payload: updateState,
          });
        }
      },
      *updateDefaultLanguage({ payload }, { call }) {
        const res = yield call(updateDefaultLanguage, payload);
        return getResponse(res);
      },

      *clearNotices({ payload }, { put, select }) {
        yield put({
          type: 'saveClearedNotices',
          payload,
        });
        const count = yield select(state => state.global.notices.length);
        yield put({
          type: 'user/changeNotifyCount',
          payload: count,
        });
      },
      *removeTab({ payload }, { put, select }) {
        const state = yield select(st => st.global);
        const { tabs, activeTabKey } = state;
        let activeKey = activeTabKey;
        let lastIndex;
        tabs.forEach((pane, i) => {
          if (pane.key === payload) {
            lastIndex = i - 1;
          }
        });
        const panes = tabs.filter(pane => pane.key !== payload);
        if (lastIndex >= 0 && activeTabKey === payload) {
          activeKey = panes[lastIndex].key;
        }
        yield put({
          type: 'updateState',
          payload: {
            // openTab 会更新 activeTabKey, 并且需要用到之前的 activeTabKey 来判断需不需要 push。
            // activeTabKey: activeKey,
            tabs: [...panes],
          },
        });
        return activeKey;
      },
      *getRemoveTabInfo({ payload }, { select }) {
        const state = yield select(st => st.global);
        const { tabs, activeTabKey } = state;
        const closeTabKey = payload;
        const removeTabInfo = {
          nextTabs: [],
          nextActiveTabKey: '',
        };
        let isNextTabKeyNeedSet = activeTabKey === closeTabKey;
        forEach(tabs, tab => {
          if (tab.key !== closeTabKey) {
            removeTabInfo.nextTabs.push(tab);
            if (isNextTabKeyNeedSet) {
              removeTabInfo.nextActiveTabKey = tab.key;
              removeTabInfo.nextTab = tab;
            }
          } else {
            isNextTabKeyNeedSet = false;
          }
        });
        return removeTabInfo;
      },

      // 查询语言值集
      *querySupportLanguage(_, { call, put }) {
        const supportLanguage = getResponse(yield call(querySupportLanguage));
        if (supportLanguage) {
          yield put({
            type: 'updateState',
            payload: { supportLanguage },
          });
        }
      },

      // // 获取站内消息
      // *getUnreadMessage({ payload }, { call, put }) {
      //   const response = yield call(queryUnreadMessage, payload);
      //   const unreadMessageList = getResponse(response);
      //   if (unreadMessageList) {
      //     yield put({
      //       type: 'updateState',
      //       payload: {
      //         messageList: unreadMessageList.content,
      //       },
      //     });
      //   }
      // },

      /**
       * pubLayout 预加载
       * 首屏 预加载内容
       * 初始化语言和菜单数据
       */ *pubInit(
        {
          payload: { language, organizationId },
        },
        { call, put, all }
      ) {
        // 第一次加载肯定是没有切换语言的
        localLangCache[language] = {};
        const promiseAllLocale = [
          call(getAntdLocale, language),
          call(queryPromptLocale, organizationId, language, 'hzero.common'),
        ];
        const [antdLocale, promptLocale] = yield all(promiseAllLocale);
        const safePromptLocale = getResponse(promptLocale);
        const loadLocales = intl.options.locales; // 设置或切换 当前intl的语言
        intl.init({
          currentLocale: language,
          locales: loadLocales,
          warningHandler: e => {
            console.warn(e);
          },
        });
        intl.load({
          [language]: safePromptLocale,
        });
        moment.locale(antdLocale.locale); // TODO: LocaleProvider 中会设置 moment.locale，为何突然不起作用了?
        localLangCache[language].antdLocale = antdLocale;

        yield put({
          type: 'updateState',
          payload: {
            antdLocale,
            language,
          },
        });
      },
      /**
       * 用于 pubLayout 的懒加载
       */ *pubLazyInit(_, { put }) {
        const routerConfig = getWrapperRouterData(app || window.dvaApp);
        const routerData = {};
        // The route matches the menu
        Object.keys(routerConfig).forEach(path => {
          // Regular match item name
          // eg.  router /user/:id === /user/chen
          const pathRegexp = pathToRegexp(path);
          let router = routerConfig[path];
          // If you need to configure complex parameter routing,
          // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
          // eg . /list/:type/user/info/:id
          router = {
            ...router,
            name: router.name,
            // tab 用到的数据
            pathRegexp,
            title: router.title,
            icon: router.icon,
            closable: isBoolean(router.closable) ? router.closable : true,
            path,
            // tab 用到的数据
            authority: router.authority,
          };
          routerData[path] = router;
        });
        yield put({
          type: 'updateState',
          payload: {
            routerData,
            // TabListen 监听
            menuLoad: true,
          },
        });
      },

      /**
       * 首屏 预加载内容
       * 初始化语言和菜单数据
       */ *baseInit(
        {
          payload: { language, organizationId },
        },
        { call, put, all }
      ) {
        // 第一次加载肯定是没有切换语言的
        localLangCache[language] = {};
        const promiseAllLocale = [
          call(getAntdLocale, language),
          call(queryPromptLocale, organizationId, language, 'hzero.common'),
        ];
        const [antdLocale, promptLocale] = yield all(promiseAllLocale);
        const safePromptLocale = getResponse(promptLocale);
        const loadLocales = intl.options.locales; // 设置或切换 当前intl的语言
        intl.init({
          currentLocale: language,
          locales: loadLocales,
          warningHandler: (/* e */) => {
            // todo
            // console.warn(e);
          },
        });
        intl.load({
          [language]: safePromptLocale,
        });
        moment.locale(antdLocale.locale);
        localLangCache[language].antdLocale = antdLocale;

        yield put({
          type: 'updateState',
          payload: {
            antdLocale,
            language,
          },
        });
      },
      *baseLazyInit(
        {
          payload: { language },
        },
        { call, put }
      ) {
        const list = [];
        const menuListRes = yield call(queryMenu, { lang: language });
        const menuList = getResponse(menuListRes);
        // TODO: 接口完成后 通过菜单来获取 菜单的国际化
        // const menuLocale = {};
        parseMenuData(list, null, menuList || []);
        const menus = formatter(list);
        const menuLocaleIntl = {};
        parseMenuToLocaleIntl(menuList, menuLocaleIntl);

        const menuData = getFlatMenuData(menus);
        intl.load({
          [language]: menuLocaleIntl,
        });
        const routerConfig = getWrapperRouterData(app || window.dvaApp);
        const routerData = {};
        // The route matches the menu
        Object.keys(routerConfig).forEach(path => {
          // Regular match item name
          // eg.  router /user/:id === /user/chen
          const pathRegexp = pathToRegexp(path);
          const menuKey = Object.keys(menuData).find(key => pathRegexp.test(`${key}`));
          let menuItem = {};
          // If menuKey is not empty
          if (menuKey) {
            menuItem = menuData[menuKey];
          }
          let router = routerConfig[path];
          // If you need to configure complex parameter routing,
          // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
          // eg . /list/:type/user/info/:id
          router = {
            ...router,
            name: router.name || menuItem.name,
            // tab 用到的数据
            pathRegexp,
            title: router.title || menuItem.name,
            icon: router.icon || menuItem.icon,
            closable: isBoolean(router.closable) ? router.closable : true,
            path,
            // tab 用到的数据
            authority: router.authority || menuItem.authority,
            hideInBreadcrumb: router.hideInBreadcrumb || menuItem.hideInBreadcrumb,
          };
          routerData[path] = router;
        });
        const queryMenus = getMenuNodeList(menus, []);
        yield put({
          type: 'updateState',
          payload: {
            routerData,
            menu: menus,
            menuLeafNode: queryMenus,
            // 菜单加载完毕
            menuLoad: true,
          },
        });
      },
    },

    reducers: {
      updateState(state, { payload }) {
        return {
          ...state,
          ...payload,
        };
      },
      changeLayoutCollapsed(state, { payload }) {
        return {
          ...state,
          collapsed: payload,
        };
      },
      saveNotices(state, { payload }) {
        return {
          ...state,
          ...payload,
        };
      },
      saveClearedNotices(state, { payload }) {
        return {
          ...state,
          notices: state.notices.filter(item => item.type !== payload),
        };
      },
      addTab(state, { payload }) {
        const { newTab } = payload;
        const { tabs } = state;
        return {
          ...state,
          activeTabKey: newTab.key,
          tabs: [...tabs, newTab],
        };
      },
      /**
       * 使用新的 tab 替换掉原先的tab
       * @param {Object} state - 之前的state
       * @param {Object} payload
       * @param {Object} payload.tab 需要被替换的tab
       * @param {String!} payload.tab.key 需要被替换的tab的key
       * @param {Object!} payload.newTab 新的tab
       */
      replaceTab(state, { payload }) {
        const { tab, newTab } = payload;
        const { tabs } = state;
        const newTabs = map(tabs, lTab => {
          if (lTab.key === tab.key) {
            return newTab;
          } else {
            return lTab;
          }
        });
        return {
          ...state,
          activeTabKey: newTab.key,
          tabs: newTabs,
        };
      },
      /**
       *
       * 更新 tabs 中对应key的tab, 不激活更新的tab
       * @param {Object} state - 之前的state
       * @param {Object} updateTab - 更新的 tab patch
       * @param {Object} updateTab.key - 更新的 tab 的key
       * @returns {{activeTabKey: *, tabs: *}}
       */
      updateTab(state, { payload: updateTab }) {
        const { tabs } = state;
        const newTabs = map(tabs, lTab => {
          if (lTab.key === updateTab.key) {
            return {
              ...lTab,
              ...updateTab,
            };
          } else {
            return lTab;
          }
        });
        return {
          ...state,
          tabs: newTabs,
        };
      },
      cleanTabs(state) {
        return {
          ...state,
          tabs: getInitialTabData(),
          activeTabKey: getInitialActiveTabKey(),
        };
      },
      updateMenuLeafNode(state) {
        return {
          ...state,
          menuLeafNode: state.menuLeafNode.map(menu => ({
            ...menu,
            title: menu.name && intl.get(menu.name).d(menu.name),
          })),
        };
      },
    },
    subscriptions: {
      setup({ history }) {
        // Subscribe history(url) change, trigger `load` action if pathname is `/`
        const unListen = history.listen(({ pathname, search }) => {
          tabListen(pathname);
          if (typeof window.ga !== 'undefined') {
            window.ga('send', 'pageview', pathname + search);
          }
        });
        const unload = () => {
          unListen();
          persistMenuTabs();
        };
        return unload;
      },
    },
  };
}

export { getGlobalModalConfig };

export default getGlobalModalConfig({ getWrapperRouterData: getRouterData });
