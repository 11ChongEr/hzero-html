import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'hzero-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import styles from './styles.less';

class SubMenuItem extends React.Component {
  static propTypes = {
    // 菜单
    menu: PropTypes.shape({
      id: PropTypes.number.isRequired,
    }).isRequired,
    // // 叶子菜单点击事件
    // onMenuClick: PropTypes.func.isRequired,
  };

  /**
   * 渲染菜单到节点
   * @param {object} menu - 菜单
   * @param {object[]} leafMenus - 已经渲染的菜单
   * @param {object[]} parentMenus - 父菜单
   */
  repeatRenderLastMenuTo(menu, leafMenus, parentMenus = []) {
    const isNoChildren = isEmpty(menu.children);
    const menuItem = !menu.path ? (
      <a>
        <Icon type={menu.icon} />
        {menu.name && intl.get(menu.name)}
      </a>
    ) : (
      <a>
        <Icon type={menu.icon} />
        {menu.name && intl.get(menu.name)}
      </a>
    );
    leafMenus.push(<li>{menuItem}</li>);
    if (!isNoChildren) {
      menu.children.forEach(sMenu => {
        this.repeatRenderLastMenuTo(sMenu, leafMenus, [...parentMenus]);
      });
    }
  }

  render() {
    const { menu } = this.props;
    const isNoChildren = isEmpty(menu.children);
    if (isNoChildren) {
      return (
        <li key={`sub-sub-menu-${menu.id}`} className={styles['sub-sub-menu-item']}>
          <nav>
            <a>
              <Icon type={menu.icon} />
              {menu.name && intl.get(menu.name)}
            </a>
          </nav>
        </li>
      );
    }
    const lis = [];
    menu.children.forEach(sMenu => {
      this.repeatRenderLastMenuTo(sMenu, lis);
    });
    return (
      <li key={`sub-sub-menu-${menu.id}`} className={styles['sub-sub-menu-item']}>
        <nav>
          <a>
            <Icon type={menu.icon} />
            {menu.name && intl.get(menu.name)}
          </a>
          <ul>{lis}</ul>
        </nav>
      </li>
    );
  }
}

export default SubMenuItem;
