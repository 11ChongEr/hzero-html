import React from 'react';
import { Link } from 'dva/router';
import { Layout, Modal, Icon } from 'hzero-ui';
import { Debounce, Bind } from 'lodash-decorators';

import GlobalHeader from 'components/GlobalHeader';

import { DEBOUNCE_TIME } from 'utils/constants';

import styles from './styles.less';
import HeaderRight from '../HeaderRight';
import HorizontalMenu from '../HorizontalMenu';

const { Header } = Layout;
const menuTriggerStyle = {
  cursor: 'pointer',
};
const menuModalStyle = {
  top: '0px',
};
const menuModalBodyStyle = {
  padding: '0px',
  backgroundColor: '#001529',
};

class TopNavHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      menuModalVisible: false,
    };
  }

  render() {
    const { layoutMode, layoutTheme, logo, isMobile, loginName, title, menuData } = this.props;
    const { menuModalVisible = false } = this.state;
    return (
      <Header style={{ padding: 0, width: '100%' }} className={this.getHeaderClassName()}>
        {layoutMode === 'horizontal' && !isMobile ? (
          <React.Fragment>
            <div key="logo" className={styles.logo}>
              <Link to="/" className={styles.logo} key="logo">
                <img src={logo} alt="logo" width="32" />
                <h1 title={title}>{title}</h1>
              </Link>
            </div>
            <div key="menu" className={styles.menu}>
              <span key="menu-trigger" style={menuTriggerStyle}>
                <Icon type="bars" onClick={this.toggleMenuClick} />
              </span>
            </div>
            <div key="extra" className={styles.extra}>
              <HeaderRight loginName={loginName} />
            </div>
            <Modal
              visible={menuModalVisible}
              width="100vw"
              style={menuModalStyle}
              bodyStyle={menuModalBodyStyle}
              footer={null}
              onCancel={this.handleMenuModalCancel}
            >
              <HorizontalMenu menus={menuData} layoutTheme={layoutTheme} />
            </Modal>
          </React.Fragment>
        ) : (
          <GlobalHeader logo={logo} isMobile={isMobile} />
        )}
      </Header>
    );
  }

  getHeaderClassName() {
    const { layoutMode, isMobile } = this.props;
    if (!isMobile && layoutMode === 'horizontal') {
      return styles['header-horizontal'];
    } else {
      return styles['header-inline'];
    }
  }

  @Bind()
  toggleMenuClick() {
    this.toggleMenu();
  }

  @Debounce(DEBOUNCE_TIME)
  toggleMenu() {
    const { menuModalVisible = false } = this.state;
    this.setState({
      menuModalVisible: !menuModalVisible,
    });
  }

  @Bind()
  handleMenuModalCancel() {
    this.setState({
      menuModalVisible: false,
    });
  }
}

export default TopNavHeader;
