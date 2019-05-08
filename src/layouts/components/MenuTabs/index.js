import React from 'react';
import { Tabs, Icon, Layout } from 'hzero-ui';
import { map, isFunction } from 'lodash';
import { connect } from 'dva';
import { Link, Switch, Redirect, Route } from 'dva/router';

import getTabRoutes from 'components/Router';
import Exception from 'components/Exception';
import { cleanCache } from 'components/CacheComponent';

import intl from 'utils/intl';
import { isPromise } from 'utils/utils';
import { getTabFromKey, openTab, closeTab, getBeforeMenuTabRemove } from 'utils/menuTab';

const { Content } = Layout;
const { TabPane } = Tabs;
const DefaultNotFound = () => (
  <Exception type="404" style={{ minHeight: 500, height: '80%' }} linkElement={Link} />
);
const EMPTY_ROUTE = () => {
  return null;
};

/**
 * 菜单数据结构改变 只有菜单有path,目录没有path
 * 所有的菜单必须有 服务前缀 `/服务前缀/...功能集合/功能/...子功能`
 * 根据菜单取得重定向地址.
 */
const getRedirect = (item, redirectData = []) => {
  if (item && item.children) {
    // 目录
    for (let i = 0; i < item.children.length; i++) {
      getRedirect(item.children[i], redirectData);
    }
    return redirectData;
  } else if (item && item.path) {
    // 菜单
    let menuPaths = item.path.split('/');
    if (!menuPaths[0]) {
      menuPaths = menuPaths.slice(1, menuPaths.length);
    }
    let menuPath = '';
    for (let i = 0; i < menuPaths.length - 1; i++) {
      menuPath += `/${menuPaths[i]}`;
      const from = menuPath;
      const to = `${menuPath}/${menuPaths[i + 1]}`;
      const exist = redirectData.some(route => route.from === from);
      if (!exist) {
        redirectData.push({ from, to });
      }
    }
  }
};

class MenuTabs extends React.Component {
  render() {
    const {
      activeTabKey, // 当前激活的 Tab 的 key
      language, // 当前的语言
      NotFound = DefaultNotFound, // 当找不到路由时返回的路由
      tabs = [], // 所有打开的 tabs
      menu = [], // 所有的菜单
      routerData = {}, // 所有的路由
      extraRight = null, // 右侧额外的组件
    } = this.props;

    const redirectData = [{ from: '/', to: '/workplace' }]; // 根目录需要跳转到工作台
    menu.forEach(item => {
      getRedirect(item, redirectData);
    });
    const bashRedirect = this.getBaseRedirect();

    return (
      <React.Fragment>
        <Switch>
          {map(redirectData, item => (
            <Redirect key={item.from} exact from={item.from} to={item.to} />
          ))}
          {bashRedirect ? <Redirect exact from="/" to={bashRedirect} /> : null}
          {menu.length === 0 ? null : <Route render={EMPTY_ROUTE} />}
        </Switch>
        <Tabs
          hideAdd
          onChange={this.onTabChange}
          activeKey={activeTabKey}
          type="editable-card"
          onEdit={this.onTabEdit}
          tabBarExtraContent={extraRight}
        >
          {map(tabs, pane => (
            <TabPane
              closable={pane.closable}
              tab={
                <span>
                  {pane.path === '/workplace' ? <Icon type={pane.icon} key="icon" /> : null}
                  {language ? pane.title && intl.get(pane.title).d(pane.title) : '...'}
                </span>
              }
              key={pane.key}
            >
              <Content className="page-container">
                {getTabRoutes({
                  pane,
                  routerData,
                  NotFound,
                  menu,
                  activeTabKey,
                })}
              </Content>
            </TabPane>
          ))}
        </Tabs>
      </React.Fragment>
    );
  }

  /**
   * 切换 tab
   * @param {string} activeKey - menuTab 的 key
   */
  onTabChange(activeKey) {
    // const { history } = this.props;
    openTab(getTabFromKey(activeKey));
  }

  onTabEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  /**
   * 关闭 tab
   */
  remove(targetKey) {
    const onBeforeHandler = getBeforeMenuTabRemove(targetKey);
    if (isFunction(onBeforeHandler)) {
      const isShouldDelete = onBeforeHandler();
      if (isPromise(isShouldDelete)) {
        isShouldDelete.then(
          // 关闭tab
          () => {
            cleanCache(targetKey);
            closeTab(targetKey);
          }
        );
      } else if (isShouldDelete !== false) {
        cleanCache(targetKey);
        closeTab(targetKey);
      }
    } else {
      cleanCache(targetKey);
      closeTab(targetKey);
    }
  }

  getBaseRedirect() {
    // According to the url parameter to redirect
    // 这里是重定向的,重定向到 url 的 redirect 参数所示地址
    const urlParams = new URL(window.location.href);

    const redirect = urlParams.searchParams.get('redirect');
    // Remove the parameters in the url
    if (redirect) {
      urlParams.searchParams.delete('redirect');
      window.history.replaceState(null, 'redirect', urlParams.href);
    } else {
      const { routerData = {} } = this.props;
      // get the first authorized route path in routerData
      // const authorizedPath = Object.keys(routerData).find(
      //   item => check(routerData[item].authority, item) && item !== '/'
      // );
      const authorizedPath = Object.keys(routerData).find(item => item !== '/');
      return authorizedPath;
    }
    return redirect;
  }
}

export default connect(({ global = {} }) => ({
  activeTabKey: global.activeTabKey,
  tabs: global.tabs,
  menu: global.menu,
  routerData: global.routerData,
  language: global.language,
}))(MenuTabs);
