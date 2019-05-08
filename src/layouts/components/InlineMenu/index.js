/**
 * @date 2019-03-02
 * @author WY yang.wang06@hand-china.com
 * @copyright ® HAND 2019
 */
import React from 'react';
import { isEmpty } from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import { openTab } from 'utils/menuTab';

import MainItem from './MainItem';
import SubMenuWrap from './SubMenuWrap';
import SubItem from './SubItem';

import { isLeafMenu } from './utils';

import styles from './styles.less';
import LeafItem from './LeafItem';

class InlineMenu extends React.Component {
  /**
   * 菜单点击
   * @param {object} menu - 菜单
   * @param {Event} e - 事件
   */
  @Bind()
  handleLeafMenuClick(menu, e) {
    e.preventDefault();
    e.stopPropagation();
    // e.stopImmediatePropagation();
    // 打开菜单
    openTab({
      icon: menu.icon,
      title: menu.name,
      key: menu.path,
      closable: true,
      // search: menu.search,
    });
  }

  /**
   * @param {object[]} children - 所有的子菜单
   * @param {object[]} collect - 已经存放的子菜单
   * @param {boolean} isRepeat - 四级及一下菜单
   */
  // eslint-disable-next-line no-unused-vars
  repeatCollectChildren(children = [], collect = [], isRepeat) {
    if (!isEmpty(children)) {
      for (let i = 0; i < children.length; i++) {
        collect.push(children[i]);
        this.repeatCollectChildren(children[i].children, collect, true);
      }
    }
    return collect;
  }

  /**
   * 获取 二级菜单下的 所有三级菜单
   * @param {object} menu - 二级菜单
   */
  getLeafMenusOfMenu(menu = {}) {
    if (menu.__collectLeafMenus) {
      return menu.__collectLeafMenus;
    } else {
      this.__collectLeafMenus = [];
      if (isLeafMenu(menu)) {
        // 只有 二级菜单
        this.__collectLeafMenus.push(menu);
      } else {
        // 有 三级菜单
        this.repeatCollectChildren(menu.children, this.__collectLeafMenus);
      }
    }
    return this.__collectLeafMenus;
  }

  /**
   * 渲染叶子菜单
   * @param {object} subMenu - 二级菜单
   */
  renderLeafMenus(subMenu) {
    return this.getLeafMenusOfMenu(subMenu).map(leafMenu => {
      return (
        <LeafItem key={leafMenu.path} leafMenu={leafMenu} onClick={this.handleLeafMenuClick} />
      );
    });
  }

  /**
   * 渲染对应 一级菜单的展开菜单
   * @param {object} menu - 一级菜单
   */
  renderSubMenus(menu = {}) {
    let subMenus = [];
    if (isLeafMenu(menu)) {
      subMenus.push(menu);
      // 没有二级菜单
    } else {
      subMenus = menu.children;
    }
    return (
      <SubMenuWrap menu={menu}>
        {subMenus.map(subMenu => {
          return <SubItem subMenu={subMenu}>{this.renderLeafMenus(subMenu)}</SubItem>;
        })}
      </SubMenuWrap>
    );
  }

  /**
   * 渲染一级菜单
   * @param {object} menu - 一级菜单
   */
  renderMainMenu(menu = {}) {
    return <MainItem menu={menu}>{this.renderSubMenus(menu)}</MainItem>;
  }

  render() {
    const { menus = [], className = '' } = this.props;
    const wrapClassName = `${className} ${styles['menu-wrap']}`;
    const mainMenus = [];
    menus.forEach(menu => {
      mainMenus.push(this.renderMainMenu(menu));
    });
    return (
      <div className={wrapClassName}>
        <ul className={styles.menu}>{mainMenus}</ul>
      </div>
    );
  }
}

export default connect(({ global }) => ({
  menus: global.menu,
}))(InlineMenu);
