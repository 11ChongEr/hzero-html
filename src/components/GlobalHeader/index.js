import React, { PureComponent } from 'react';
import { Icon, Divider } from 'hzero-ui';
import { connect } from 'dva';
import Debounce from 'lodash-decorators/debounce';
import { Link, withRouter } from 'dva/router';

import { getTabFromKey } from 'utils/menuTab';

import styles from './index.less';

@connect(({ global = {} }) => ({
  collapsed: global.collapsed,
  routerData: global.routerData,
  activeTabKey: global.activeTabKey,
  menu: global.menu,
  tabs: global.tabs,
}))
@withRouter
export default class GlobalHeader extends PureComponent {
  onChange = activeKey => {
    const { history } = this.props;

    history.push(getTabFromKey(activeKey).path);
  };

  handleMenuCollapse = collapsed => {
    this.props.dispatch({
      type: 'global/changeLayoutCollapsed',
      payload: collapsed,
    });
  };

  onEdit = (targetKey, action) => {
    this[action](targetKey);
  };

  remove = targetKey => {
    const { dispatch, history } = this.props;
    dispatch({
      type: 'global/removeTab',
      payload: targetKey,
    }).then(key => {
      history.push(key);
    });
  };

  static unListen = null;

  componentWillUnmount() {
    this.triggerResizeEvent.cancel();
  }

  toggle = () => {
    const { collapsed } = this.props;
    this.handleMenuCollapse(!collapsed);
    this.triggerResizeEvent();
  };

  /* eslint-disable*/
  @Debounce(600)
  triggerResizeEvent() {
    const event = document.createEvent('HTMLEvents');
    event.initEvent('resize', true, false);
    window.dispatchEvent(event);
  }
  render() {
    const { collapsed, isMobile, logo, onMenuClick } = this.props;

    return (
      <div className={styles.header}>
        {isMobile && [
          <Link to="/" className={styles.logo} key="logo">
            <img src={logo} alt="logo" width="32" />
          </Link>,
          <Divider type="vertical" key="line" />,
        ]}
        <Icon
          className={styles.trigger}
          type={collapsed ? 'menu-unfold' : 'menu-fold'}
          onClick={this.toggle}
        />
      </div>
    );
  }
}
