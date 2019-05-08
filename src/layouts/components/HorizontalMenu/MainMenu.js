import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'hzero-ui';

import intl from 'utils/intl';

import SubMenu from './SubMenu';

import styles from './styles.less';

class MainMenu extends React.Component {
  static propTypes = {
    menus: PropTypes.array.isRequired,
    layoutTheme: PropTypes.string,
  };

  static defaultProps = {
    layoutTheme: 'default',
  };

  constructor(props) {
    super(props);
    this.state = {
      // activeMenu: undefined,
    };
  }

  render() {
    const { menus = [], layoutTheme } = this.props;
    const mainMenu = [];
    const subMenu = [];
    menus.forEach(menu => {
      const isActive = this.isActive(menu);
      const mainMenuClassName = isActive ? styles['menu-active'] : '';
      mainMenu.push(
        <a
          key={`main-${menu.id}`}
          className={mainMenuClassName}
          onClick={this.handleActiveMainMenu.bind(this, menu)}
        >
          <h1>
            <Icon type={menu.icon} className={styles['menu-icon']} />
            {menu.name && intl.get(menu.name)}
          </h1>
        </a>
      );
      if (menu.children) {
        subMenu.push(<SubMenu key={`sub-${menu.id}`} menu={menu} active={isActive} />);
      }
    });
    const classNames = [styles['horizontal-menu'], styles[`horizontal-menu-theme-${layoutTheme}`]];
    return (
      <section className={classNames.join(' ')}>
        <div className={styles[['horizontal-menu-main']]}>{mainMenu}</div>
        {subMenu}
      </section>
    );
  }

  /**
   * 激活主菜单
   */
  handleActiveMainMenu(menu) {
    const { activeMenu } = this.state;
    if (activeMenu !== menu) {
      this.setState({
        activeMenu: menu,
      });
    }
  }

  /**
   * 判断是否是激活的菜单
   */
  isActive(menu) {
    const { activeMenu } = this.state;
    return menu === activeMenu;
  }
}

export default MainMenu;
