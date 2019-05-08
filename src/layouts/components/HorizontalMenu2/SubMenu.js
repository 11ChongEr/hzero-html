import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'hzero-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import styles from './styles.less';
import SubMenuItem from './SubMenuItem';

class SubMenu extends React.Component {
  static propTypes = {
    // 菜单
    menu: PropTypes.shape({
      id: PropTypes.number.isRequired,
    }).isRequired,
    // 叶子菜单点击事件
    onMenuClick: PropTypes.func.isRequired,
    active: PropTypes.bool.isRequired,
  };

  render() {
    const { menu } = this.props;

    const subMenuClassNames = [styles['horizontal-menu-sub']];
    const subMenuChildren = [];
    const isSubMenuActive = this.isActive();
    const isNoChildren = isEmpty(menu.children);
    const menuTitle = menu.name && intl.get(menu.name);
    if (isSubMenuActive) {
      subMenuClassNames.push(styles['horizontal-menu-sub-active']);
    }
    if (isNoChildren) {
      subMenuChildren.push(
        <nav className={styles['horizontal-menu-sub-hgroup']} key={menu.id}>
          <a className={styles['horizontal-menu-sub-hgroup-title']}>
            <Icon type={menu.icon} />
            {menuTitle}
          </a>
          <div className={styles['horizontal-menu-sub-hgroup-divider']} />
          <div className={styles['horizontal-menu-sub-hgroup-content']}>
            <ul>
              <li>
                <nav className={styles['menu-leaf']}>
                  <a>
                    <Icon type={menu.icon} />
                    {menuTitle}
                  </a>
                </nav>
              </li>
            </ul>
          </div>
        </nav>
      );
    } else {
      // 如果由二级菜单, 则交给 二级菜单的生成方法
      this.renderSubMenusTo(subMenuChildren);
    }

    return <div className={subMenuClassNames.join(' ')}>{subMenuChildren}</div>;
  }

  isActive() {
    const { active } = this.props;
    return active;
  }

  /**
   * 将二级菜单 放到 subMenuChildren 中
   * 由调用方保证 有多个 二级菜单
   * @param {object[]} subMenuChildren - 存储二级菜单的element
   */
  renderSubMenusTo(subMenuChildren) {
    const { menu } = this.props;
    menu.children.forEach(subMenu => {
      subMenuChildren.push(this.renderSubMenu(subMenu));
    });
  }

  /**
   * 渲染二级菜单
   * @param {object} menu - 将要渲染的二级菜单
   */
  renderSubMenu(menu) {
    const menuItem = (
      <a className={styles['horizontal-menu-sub-hgroup-title']}>
        <Icon type={menu.icon} />
        {menu.name && intl.get(menu.name)}
      </a>
    );
    const isNoChildren = isEmpty(menu.children);
    if (isNoChildren) {
      return (
        <nav key={`sub-menu-${menu.id}`} className="horizontal-menu-sub-hgroup">
          {menuItem}
          <div className={styles['horizontal-menu-sub-hgroup-divider']} />
          <div className={styles['horizontal-menu-sub-hgroup-content']}>
            <ul>
              <li>
                <nav className="menu-leaf">
                  <a onClick={this.handleMenuLeafClick.bind(this, menu)}>
                    <Icon type={menu.icon} />
                    {menu.name && intl.get(menu.name)}
                  </a>
                </nav>
              </li>
            </ul>
          </div>
        </nav>
      );
    }
    const subSubMenusElement = [];
    let subSubMenuElement = [];
    menu.children.forEach((subSubMenu, index) => {
      if (index % 5 === 0) {
        subSubMenuElement = [];
        subSubMenusElement.push(subSubMenuElement);
      }
      subSubMenuElement.push(
        <SubMenuItem key={`sub-menu-item-${subSubMenu.id}`} menu={subSubMenu} />
      );
    });
    return (
      <nav
        className={styles['horizontal-menu-sub-hgroup']}
        style={{ width: 200 * subSubMenusElement.length }}
      >
        {menuItem}
        <div className={styles['horizontal-menu-sub-hgroup-divider']} />
        <div className={styles['horizontal-menu-sub-hgroup-content']}>
          {subSubMenusElement.map((lis, index) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <ul key={`sub-menu-wrap-${index}`}>{lis}</ul>
            );
          })}
        </div>
        <div className={styles['horizontal-menu-sub-hgroup-border']} />
      </nav>
    );
  }

  /**
   * 菜单点击事件
   * 在使用时绑定 this 和 menu
   * @param {object} menu -菜单
   * @param {Event} e - 事件
   */
  handleMenuLeafClick(menu, e) {
    e.preventDefault();
    const { onMenuClick } = this.props;
    onMenuClick(menu);
  }
}

export default SubMenu;
