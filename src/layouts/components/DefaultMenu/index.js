/**
 * @date 2019-03-05
 * @author WY yang.wang06@hand-china.com
 * @copyright ® HAND 2019
 */

import React from 'react';
import { isEmpty, omit } from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import MainMenuItem from './MainMenuItem';

import { computeActiveMenus, computeMenus, getMenuKey, MenuContext } from './utils';

import styles from './styles.less';

const omitProps = [
  'menus',
  'activeTabKey',
  'tabs',
  'collapsed',
  'className',
  'language',
  'dispatch',
];

class DefaultMenu extends React.PureComponent {
  constructor(props) {
    super(props);
    const { activeTabKey, menus } = props;
    const { leafMenus: computeLeafMenusRet, menus: computeMenusRet } = computeMenus(menus);
    this.state = {
      activeMenus: [], // 激活的 Tab 对应的菜单
      menus: computeMenusRet, // 菜单
      leafMenus: computeLeafMenusRet, // 三级菜单
      prevActiveTabKey: activeTabKey, // 存储上一次的 activeTabKey
      prevMenus: menus, // 存储上一次的 menus
      hoverMenu: null, // 当前激活的 一级菜单
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { activeTabKey, menus } = nextProps;
    const { prevActiveTabKey, prevMenus } = prevState;
    const nextState = {};
    if (prevMenus !== menus) {
      if (isEmpty(menus)) {
        nextState.leafMenus = [];
        nextState.menus = [];
      } else {
        // 还没有菜单
        const { leafMenus: computeLeafMenusRet, menus: computeMenusRet } = computeMenus(menus);
        // 叶子节点 和 新的菜单
        nextState.leafMenus = computeLeafMenusRet;
        nextState.menus = computeMenusRet;
      }
      nextState.prevMenus = menus;
    }
    if (activeTabKey !== prevActiveTabKey) {
      // 重新计算 激活的 menu
      nextState.activeTabKey = activeTabKey;
      nextState.activeMenus = computeActiveMenus(
        nextState.leafMenus || prevState.leafMenus,
        activeTabKey
      );
      nextState.prevActiveTabKey = activeTabKey;
    }
    if (!isEmpty(nextState)) {
      return nextState;
    }
    return null;
  }

  @Bind()
  handleMainMenuItemClick(e, hoverMenu) {
    e.stopPropagation();
    this.setState({
      hoverMenu,
    });
  }

  @Bind()
  handleCancelHoverMenu() {
    this.setState({
      hoverMenu: null,
    });
  }

  render() {
    const { collapsed, className, language } = this.props;
    const { menus, activeMenus, hoverMenu } = this.state;
    const passProps = omit(this.props, omitProps);
    const menuClassNames = [styles['main-menu']];
    if (collapsed) {
      menuClassNames.push(styles['main-menu-collapsed']);
    }
    const mainMenuWrapClassNames = [styles['main-menu-wrap'], className];
    return (
      <div {...passProps} className={mainMenuWrapClassNames.join(' ')}>
        <ul className={menuClassNames.join(' ')}>
          <MenuContext.Provider value={language}>
            {menus.map(mainMenu => (
              <MainMenuItem
                onClick={this.handleMainMenuItemClick}
                onSubMenuMaskClick={this.handleCancelHoverMenu}
                onLeafMenuClick={this.handleCancelHoverMenu}
                key={getMenuKey(mainMenu)}
                menu={mainMenu}
                activeMenus={activeMenus}
                hover={hoverMenu === mainMenu}
              />
            ))}
          </MenuContext.Provider>
        </ul>
      </div>
    );
  }
}

export default connect(({ global = {} }) => ({
  language: global.language,
  menus: global.menu,
  activeTabKey: global.activeTabKey,
  tabs: global.tabs,
}))(DefaultMenu);
