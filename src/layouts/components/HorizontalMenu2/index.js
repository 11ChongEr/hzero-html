import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'hzero-ui';

import intl from 'utils/intl';

import SubMenu from './SubMenu';

import styles from './styles.less';

class HorizontalMenu extends React.Component {
  static propTypes = {
    menus: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
      })
    ),
    theme: PropTypes.string,
  };

  static defaultProps = {
    menus: [],
    theme: 'default',
  };

  constructor(props) {
    super(props);
    this.state = {
      activeMainMenu: undefined,
    };
  }

  isMenuActive(menu) {
    if (!menu) {
      return false;
    }
    const { activeMainMenu } = this.state;
    return activeMainMenu === menu;
  }

  /**
   * 主菜单 点击
   * @param {object} menu - 菜单
   * @param {Event} e - 事件
   */
  handleMainMenuItemClick(menu, e) {
    e.preventDefault();
    const { activeMainMenu } = this.state;
    if (activeMainMenu !== menu) {
      this.setState({
        activeMainMenu: menu,
      });
    }
  }

  render() {
    const { theme, menus = [] } = this.props;
    const menuClassNames = [styles['horizontal-menu'], styles[`horizontal-menu-theme-${theme}`]];
    const mainMenus = [];
    const subMenus = [];

    menus.forEach(menu => {
      const isMainMenuActive = this.isMenuActive(menu);
      const mainMenuItemClassNames = [styles['main-menu-item']];
      if (isMainMenuActive) {
        mainMenuItemClassNames.push(styles['main-menu-item-active']);
      }
      mainMenus.push(
        <a
          key={`main-menu-item-${menu.id}`}
          className={mainMenuItemClassNames.join(' ')}
          onClick={this.handleMainMenuItemClick.bind(this, menu)}
        >
          <Icon type={menu.icon} />
          {menu.name && intl.get(menu.name)}
        </a>
      );

      subMenus.push(<SubMenu key={`sub-menu-${menu.id}`} menu={menu} active={isMainMenuActive} />);
    });

    return (
      <div className={menuClassNames.join(' ')}>
        <div className={styles['horizontal-menu-main']}>{mainMenus}</div>
        {subMenus}
      </div>
    );
  }
}

export default HorizontalMenu;
