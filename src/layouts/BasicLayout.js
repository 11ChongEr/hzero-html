import React from 'react';
import PropTypes from 'prop-types';
import { Layout, Tabs, Icon, Modal, Button } from 'hzero-ui';
import { isEmpty, map, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import DocumentTitle from 'react-document-title';
import { connect } from 'dva';
import { Switch, Route, Redirect } from 'dva/router';
import { enquireScreen, unenquireScreen } from 'enquire-js';
import dynamic from 'dva/dynamic';
import LoadingBar from 'components/NProgress/LoadingBar';

import webSocketManagener from 'utils/webSoket';

import { cleanCache } from 'components/CacheComponent';
import SiderMenu from 'components/SiderMenu';
import getTabRoutes from 'components/Router';

import intl from 'utils/intl';
import {
  getSession,
  setSession,
  getAccessToken,
  isPromise,
  getResponse,
  getCurrentOrganizationId,
  getCurrentRole,
} from 'utils/utils';
import { getTabFromKey, openTab, tabListen, closeTab, getBeforeMenuTabRemove } from 'utils/menuTab';
import Authorized from 'utils/Authorized';
import headerStyles from '../components/GlobalHeader/index.less';

import toastImg from '../assets/illustrate-toast.png';
// import './BasicLayout.less';

import NotFound from '../routes/Exception/404';

import './BasicLayout.less';
import { queryStaticText } from '../services/api';
import TopNavHeader from './components/TopNavHeader';
import HeaderRight from './components/HeaderRight';

const { Content } = Layout;
const { TabPane } = Tabs;

const EMPTY_ROUTE = () => {
  return null;
};

// tabBar 的 字体为 13px
const tabBarStyle = { fontSize: '13px' };

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

/**
 * 获取面包屑映射
 * @param {Object} menuData 菜单配置
 * @param {Object} routerData 路由配置
 */
const getBreadcrumbNameMap = (menuData = {}, routerData) => {
  const result = {};
  const childResult = {};
  Object.keys(menuData).forEach(n => {
    const i = menuData[n];
    if (!isEmpty(routerData[i.path])) {
      result[i.path] = i;
    }
    if (i.children) {
      Object.assign(childResult, getBreadcrumbNameMap(i.children, routerData));
    }
  });
  return Object.assign({}, routerData, result, childResult);
};

let isMobile;
enquireScreen(b => {
  isMobile = b;
});

/**
 * 默认是 左右 所以 与 上下比较
 * inline     左 右
 * horizontal 上 下
 */
// let layoutMode;

// layoutMode = 'inline';
// layoutMode = 'horizontal';

class BasicLayout extends React.Component {
  static childContextTypes = {
    location: PropTypes.object,
    breadcrumbNameMap: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      isMobile,
      selfModalVisible: false, // 验证提示modal控制
      // selfModalDangerouslySetInnerHTML: undefined, // 显示的内容
      passwordResetFlag: 0, // 密码已重置
      emailCheckFlag: 0, // 邮箱经过校验
      phoneCheckFlag: 0, // 手机号经过校验
    };
  }

  onTabChange = activeKey => {
    // const { history } = this.props;
    openTab(getTabFromKey(activeKey));
  };

  onTabEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  remove = targetKey => {
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
          // // 不要关闭tab
          // () => {
          // }
        );
      } else if (isShouldDelete !== false) {
        cleanCache(targetKey);
        closeTab(targetKey);
      }
    } else {
      cleanCache(targetKey);
      closeTab(targetKey);
    }
    // // const { dispatch } = this.props;
    // cleanCache(targetKey);
    // closeTab(targetKey);
    // // dispatch({
    // //   type: 'global/removeTab',
    // //   payload: targetKey,
    // // }).then(key => {
    // //   openTab(getTabFromKey(key));
    // // });
  };

  getChildContext() {
    const { location, routerData, menu } = this.props;
    return {
      location,
      breadcrumbNameMap: getBreadcrumbNameMap(menu, routerData),
    };
  }

  init() {
    const { dispatch, currentUser, language } = this.props;
    if (currentUser) {
      const { emailCheckFlag, phoneCheckFlag, passwordResetFlag } = currentUser;
      const infoCheckFlag = getSession('infoCheckFlag');
      if (
        (emailCheckFlag === 0 || phoneCheckFlag === 0 || passwordResetFlag === 0) &&
        !infoCheckFlag
      ) {
        const nextState = {
          selfModalVisible: true,
          passwordResetFlag,
          emailCheckFlag,
          phoneCheckFlag,
        };
        queryStaticText('USER_PROMPT')
          .then(res => {
            const staticRes = getResponse(res);
            // info 如果 没有模版， 那么不需要弹出提示
            if (staticRes && staticRes.text) {
              nextState.selfModalDangerouslySetInnerHTML = {
                __html: staticRes.text,
              };
            }
          })
          .finally(() => {
            this.setState(nextState);
            setSession('infoCheckFlag', true);
          });
      }
      dispatch({
        type: 'global/lazyInit',
        payload: {
          organizationId: getCurrentOrganizationId(),
          language,
          roleId: getCurrentRole().id,
        },
      }).then(() => {
        // 初始化菜单成功后 调用 tabListen 来触发手动输入的网址
        tabListen();
      });
    }
    dispatch({
      type: 'global/fetchCount',
    });
  }

  componentDidMount() {
    // 清除首屏loading
    const loader = document.querySelector('#loader-wrapper');
    if (loader) {
      document.body.removeChild(loader);
      // 设置默认页面加载动画
      dynamic.setDefaultLoadingComponent(() => {
        return <LoadingBar />;
      });
    }
    this.enquireHandler = enquireScreen(mobile => {
      this.setState({
        isMobile: mobile,
      });
    });

    this.init();
    // eslint-disable-next-line
    window.accessToken = window.accessToken || getAccessToken('access_token');
    this.refreshTimer = setInterval(() => {
      const accessToken = getAccessToken('access_token');
      const windowToken = window.accessToken;
      if (accessToken && windowToken && windowToken !== accessToken) {
        window.location.reload();
      }
    }, 3000);

    this.receiveWebSocketMsg();
  }

  @Bind()
  receiveWebSocketMsg() {
    webSocketManagener.initWebSocket();
    webSocketManagener.addListener('client', messageData => {
      const { dispatch, count } = this.props;
      const { message } = messageData;
      const messageJson = isEmpty(message) ? undefined : JSON.parse(message);
      if (!isEmpty(messageJson)) {
        const { number } = messageJson;
        let newCount = count;
        newCount = Number(count) + Number(number);
        dispatch({
          type: 'global/saveNotices',
          payload: { count: newCount },
        });
      }
    });
  }

  componentWillUnmount() {
    unenquireScreen(this.enquireHandler);
    clearInterval(this.refreshTimer);
    // 关闭 webSocket 连接
    webSocketManagener.destroyWebSocket();
  }

  // getPageTitle() {
  //   const { routerData = {}, location } = this.props;
  //   const { pathname } = location;
  //   let title = 'HZero';
  //   let currRouterData = null;
  //   // match params path
  //   Object.keys(routerData).forEach(key => {
  //     if (pathToRegexp(key).test(pathname)) {
  //       currRouterData = routerData[key];
  //     }
  //   });
  //   if (currRouterData && currRouterData.name) {
  //     title = `${currRouterData.name} - HZero`;
  //   }
  //   return title;
  // }

  getBashRedirect = () => {
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
  };

  render() {
    const {
      currentUser,
      // collapsed,
      routerData,
      menu = [],
      activeTabKey,
      tabs,
      // match,
      history,
      language,
    } = this.props;
    const {
      selfModalDangerouslySetInnerHTML,
      selfModalVisible,
      phoneCheckFlag,
      emailCheckFlag,
      passwordResetFlag,
    } = this.state;
    const redirectData = [{ from: '/', to: '/workplace' }]; // 根目录需要跳转到工作台
    menu.forEach(item => {
      getRedirect(item, redirectData);
    });
    const bashRedirect = this.getBashRedirect();
    // Dropdown

    const { menuLayout = 'inline', menuLayoutTheme = 'default' } = currentUser;

    const layout = (
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        {menuLayout === 'horizontal' || menu.length === 0 ? null : (
          <SiderMenu
            logo={currentUser.logo}
            title={currentUser.title}
            // 不带Authorized参数的情况下如果没有权限,会强制跳到403界面
            // If you do not have the Authorized parameter
            // you will be forced to jump to the 403 interface without permission
            menuData={menu}
            Authorized={Authorized}
            isMobile={this.state.isMobile}
          />
        )}
        <Layout>
          <TopNavHeader
            loginName={currentUser.loginName}
            logo={currentUser.logo}
            title={currentUser.title}
            isMobile={this.state.isMobile}
            layoutMode={menuLayout}
            layoutTheme={menuLayoutTheme}
            menuData={menu}
            Authorized={Authorized}
          />
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
            className="menu-tabs"
            style={{
              // 在 上下布局的 情况下 tabs 不需要和 Header 重叠
              marginTop: menuLayout === 'horizontal' ? '0' : '-41px',
            }}
            tabBarStyle={{
              // 在 上下布局的 情况下 tab-bar 不需要左间距
              paddingLeft: menuLayout === 'horizontal' ? '20px' : '64px',
            }}
            tabBarExtraContent={
              menuLayout === 'horizontal' && !this.state.isMobile ? null : (
                <div className={headerStyles.right}>
                  <HeaderRight loginName={currentUser.loginName} />
                </div>
              )
            }
          >
            {map(tabs, pane => (
              <TabPane
                closable={pane.closable}
                tab={
                  <span style={tabBarStyle}>
                    <Icon type={pane.icon} />
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
          {/* style={{ height: 'calc(100vh - 48px)', overflowY:'auto' }} */}
        </Layout>
        <Modal
          visible={selfModalVisible}
          wrapClassName="self-modal"
          footer={null}
          width={456}
          onCancel={() => this.setState({ selfModalVisible: false })}
        >
          <div className="self-modal-header">
            <img src={toastImg} alt="toast-img" />
          </div>
          <div className="self-modal-content">
            {selfModalDangerouslySetInnerHTML ? (
              <div dangerouslySetInnerHTML={selfModalDangerouslySetInnerHTML} />
            ) : (
              <div>
                <p>{intl.get('hzero.common.basicLayout.greetMessage').d('尊敬的用户您好')}，</p>
                <p>
                  {intl
                    .get('hzero.common.basicLayout.accountNoBind')
                    .d('系统检测到您的账号尚未绑定')}
                  {phoneCheckFlag === 0 && intl.get('hzero.common.phone').d('手机')}
                  {emailCheckFlag === 0 &&
                    `${phoneCheckFlag === 0 ? '、' : ''}${intl
                      .get('hzero.common.email')
                      .d('邮箱')}`}
                  {passwordResetFlag === 0 &&
                    intl.get('hzero.common.basicLayout.passwordReset').d('、系统密码为初始密码，')}
                  {intl
                    .get('hzero.common.basicLayout.safeMessage1')
                    .d('为保证消息的正常接收及您的账户安全，请前往')}
                  <span className="user-info">
                    {intl.get('hzero.common.basicLayout.userInfo').d('个人中心')}
                  </span>
                  {intl.get('hzero.common.basicLayout.safeMessage2').d('进行修改。')}
                </p>
              </div>
            )}
          </div>
          <div className="self-modal-footer">
            <Button
              type="primary"
              className="go-info"
              onClick={() => {
                history.push('/hiam/user/info');
                this.setState({ selfModalVisible: false });
              }}
            >
              {intl.get('hzero.common.basicLayout.userInfo').d('个人中心')}
            </Button>
          </div>
        </Modal>
      </Layout>
    );

    return (
      <DocumentTitle title={currentUser.title || ''}>
        {/* <ContainerQuery query={query}>
          {params => <div className={classNames(params)}>{layout}</div>}
        </ContainerQuery> */}
        {layout}
      </DocumentTitle>
    );
  }
}

export default connect(({ user, global = {} }) => ({
  menu: global.menu,
  routerData: global.routerData,
  currentUser: user.currentUser,
  activeTabKey: global.activeTabKey,
  tabs: global.tabs,
  language: global.language,
  count: global.count,
}))(BasicLayout);
