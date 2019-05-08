import React from 'react';
import DocumentTitle from 'react-document-title';
import { Layout, Icon } from 'hzero-ui';
import { connect } from 'dva';
import dynamic from 'dva/dynamic';
import { Bind } from 'lodash-decorators';

import LoadingBar from 'components/NProgress/LoadingBar';
import { tabListen } from 'utils/menuTab';

import DefaultHeaderLogo from '../components/DefaultHeaderLogo';
import DefaultHeaderSearch from '../components/DefaultHeaderSearch';
import DefaultMenuTabs from '../components/DefaultMenuTabs';
import DefaultMenu from '../components/DefaultMenu';
import DefaultHeaderRight from '../components/DefaultHeaderRight';
import DefaultCheckUserSafe from '../components/DefaultCheckUserSafe';
import DefaultListenAccessToken from '../components/DefaultListenAccessToken';
import DefaultListenWebSocket from '../components/DefaultListenWebSocket';

import styles from './styles.less';

const { Header, Sider, Content } = Layout;

class DefaultLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
    };
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
    this.init();
  }

  init() {
    const { dispatch, language } = this.props;
    dispatch({
      type: 'global/baseLazyInit',
      payload: {
        language,
      },
    }).then(() => {
      this.updateFavicon();
      // 初始化菜单成功后 调用 tabListen 来触发手动输入的网址
      tabListen();
    });
  }

  @Bind()
  toggleCollapse() {
    const { collapsed = false } = this.state;
    this.setState({
      collapsed: !collapsed,
    });
  }

  render() {
    const { currentUser = {} } = this.props;
    return <DocumentTitle title={currentUser.title || ''}>{this.renderLayout()}</DocumentTitle>;
  }

  renderLayout() {
    const { currentUser = {} } = this.props;
    const { collapsed = false } = this.state;
    return (
      <Layout className={styles['default-layout']}>
        <Sider
          className={styles.menu}
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={collapsed ? 80 : 220}
        >
          <DefaultHeaderLogo
            key="logo"
            logo={currentUser.logo}
            collapsed={collapsed}
            title={currentUser.title}
            styles={styles}
          />
          <DefaultHeaderSearch key="search" collapsed={collapsed} className={styles.search} />
          <DefaultMenu key="menu" collapsed={collapsed} />
        </Sider>
        <Layout className={styles.content}>
          <Header className={styles.header}>
            <Icon
              className={styles['menu-trigger']}
              type={collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggleCollapse}
            />
          </Header>
          <Content className={styles.page}>
            <DefaultMenuTabs extraRight={<DefaultHeaderRight />} />
          </Content>
        </Layout>
        <DefaultCheckUserSafe />
        <DefaultListenAccessToken />
        <DefaultListenWebSocket />
      </Layout>
    );
  }

  /**
   * 更新 favicon
   */
  updateFavicon() {
    const { currentUser: { favicon } = {} } = this.props;
    if (favicon) {
      // FIXME: 需要检查 favicon 是否合法
      const img = new Image(favicon);
      img.onload = () => {
        document.querySelector('head > link[rel="shortcut icon"]').href = favicon;
      };
    }
  }
}

export default connect(({ user, global = {} }) => ({
  menu: global.menu, // 菜单
  routerData: global.routerData, // 路由配置
  currentUser: user.currentUser, // 当前用户
  activeTabKey: global.activeTabKey, // 当前路由
  tabs: global.tabs, // 所有 tab 页
  language: global.language, // 当前语言
  count: global.count, // 当前消息计数
}))(DefaultLayout);
