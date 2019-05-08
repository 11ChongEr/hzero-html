import React from 'react';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import SubMenu from './SubMenu';
import LeafMenu from './LeafMenu';

import styles from './styles.less';
import { getMenuKey } from './utils';

class SubMenuWrap extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      hoverSubMenu: null,
    };
  }

  cacheStyle = {};

  // componentWillUnmount() {
  //   this.cacheStyle = null;
  // }

  /**
   * 获取三级菜单的高度, 二级菜单的高度需要和三级菜单对齐
   */
  @Bind()
  getSubMenuItemStyle(subMenu, isLast) {
    const cacheKey = `${getMenuKey(subMenu)}-${isLast}`;
    if (!this.cacheStyle[cacheKey]) {
      const height = Math.ceil(subMenu.children.length / 3);
      this.cacheStyle[cacheKey] = {
        height: 42 * height + (isLast ? 0 : 25),
      };
    }
    return this.cacheStyle[cacheKey];
  }

  @Bind()
  getSubMenuStyle(menu) {
    const cacheKey = `sub-menu-${getMenuKey(menu)}`;
    if (!this.cacheStyle[cacheKey]) {
      let subMenuHeight = 42;
      menu.children.forEach((subMenu, index) => {
        subMenuHeight += this.getSubMenuItemStyle(subMenu, index >= menu.children.length - 1)
          .height;
      });
      this.cacheStyle[cacheKey] = {
        height: subMenuHeight,
      };
    }
    return this.cacheStyle[cacheKey];
  }

  @Bind()
  handleLeafMenuClick(leafMenu, subMenu) {
    const { onLeafMenuClick, menu } = this.props;
    if (isFunction(onLeafMenuClick)) {
      onLeafMenuClick(leafMenu, subMenu, menu);
    }
  }

  @Bind()
  handleLeafMenuMouseEnter(subMenu) {
    this.setState({
      hoverSubMenu: subMenu,
    });
  }

  @Bind()
  handleLeafMenuMouseLeave(subMenu) {
    const { hoverSubMenu } = this.state;
    if (hoverSubMenu === subMenu) {
      this.setState({
        hoverSubMenu: null,
      });
    }
  }

  render() {
    const { menu, activeMenus, style } = this.props;
    const { hoverSubMenu } = this.state;
    return (
      <div className={styles['sub-menu-wrap']} style={style}>
        <SubMenu
          menu={menu}
          activeMenus={activeMenus}
          hoverSubMenu={hoverSubMenu}
          minHeight={style.minHeight}
          getSubMenuStyle={this.getSubMenuStyle}
          getSubMenuItemStyle={this.getSubMenuItemStyle}
        />
        <LeafMenu
          menu={menu}
          activeMenus={activeMenus}
          onClick={this.handleLeafMenuClick}
          onMouseEnter={this.handleLeafMenuMouseEnter}
          onMouseLeave={this.handleLeafMenuMouseLeave}
          minHeight={style.minHeight}
          getSubMenuStyle={this.getSubMenuStyle}
        />
      </div>
    );
  }
}

export default SubMenuWrap;
