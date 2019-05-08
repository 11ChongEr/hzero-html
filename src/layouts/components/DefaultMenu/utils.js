import React from 'react';
import pathToRegexp from 'path-to-regexp';
import { isEmpty } from 'lodash';

import LazyLoadMenuIcon from 'components/LazyLoadMenuIcon';

import intl from 'utils/intl';

import styles from './styles.less';

/**
 * 深度遍历, 计算一次
 * 计算激活的 菜单
 * @param {object[]} leafMenus - 所有的三级菜单
 * @param {string} activeTabKey - 激活的 tab 的key
 * @return {[object, object, object]} 激活的菜单
 */
export function computeActiveMenus(leafMenus = [], activeTabKey) {
  for (let i = 0; i < leafMenus.length; i++) {
    const leafMenu = leafMenus[i];
    if (leafMenu.__pathExp.test(activeTabKey)) {
      return [leafMenu.subMenu.mainMenu, leafMenu.subMenu, leafMenu];
    }
  }
  return [];
}

/**
 * 将菜单转成 合适 的结构
 * @param {object[]} menus - 菜单
 * @return {{ leafMenus: [{ subMenu: { mainMenu: {} } }], menus: [ {children: [ children: [] ]} ] } ] }}
 * - leafMenus 从三级菜单到 一级菜单(用来计算激活的菜单)
 * - menus: 不够三级菜单的 由上级菜单补全, 超过三级菜单的 变为三级菜单
 */
export function computeMenus(menus = []) {
  const retLeafMenus = [];
  const retMenus = menus.map(mainMenu => {
    const { children, ...mM } = mainMenu;
    const subMenus = [];
    if (isLeafMenu(mainMenu)) {
      subMenus.push({ ...mM });
    } else {
      subMenus.push(...children);
    }
    mM.children = subMenus.map(subMenu => {
      const { children: subMenuChildren, ...sM } = subMenu;
      const sMChildren = [];
      sM.mainMenu = mM;
      const leafMenus = [];
      if (isLeafMenu(subMenu)) {
        leafMenus.push({ ...subMenu });
      } else {
        leafMenus.push(...subMenuChildren);
      }
      repeatCollectLeafMenus(leafMenus, sMChildren, sM, false);
      retLeafMenus.push(...sMChildren);
      sM.children = sMChildren;
      return sM;
    });
    return mM;
  });
  return {
    leafMenus: retLeafMenus,
    menus: retMenus,
  };
}

/**
 * @param {!object[]} children - 所有的子菜单
 * @param {object[]} collect - 已经存放的子菜单
 * @param {object} subMenu - 二级菜单
 * @param {boolean} isRepeat - 是否是四级及以下菜单
 */
// eslint-disable-next-line no-unused-vars
function repeatCollectLeafMenus(children = [], collect = [], subMenu, isRepeat) {
  for (let i = 0; i < children.length; i++) {
    const { children: lC, ...lM } = children[i];
    if (isLeafMenu(lM)) {
      // 三级菜单必定是 叶子菜单 否则 可能是一个非法的菜单
      lM.subMenu = subMenu;
      lM.__pathExp = pathToRegexp(lM.path, [], { end: false });
      collect.push(lM);
    }
    if (!isEmpty(lC)) {
      repeatCollectLeafMenus(lC, collect, subMenu, true);
    }
  }
  return collect;
}

/**
 * 判断是否是叶子菜单
 * @param {object} menu - 菜单
 */
export function isLeafMenu(menu = {}) {
  return !!menu.path && isEmpty(menu.children);
  // return isEmpty(menu.children);
}

/**
 * 渲染一级菜单的icon
 * @param {string} icon - icon 或者图标
 * @param {string} classPrefix - 样式前缀
 * @param {boolean} isHover - 时候hover
 */
export function renderIcon(icon, classPrefix = '', isHover) {
  const classNames = [styles[`${classPrefix}-icon`]];
  classNames.push(styles[`${classPrefix}-icon-img`]);
  return <LazyLoadMenuIcon code={icon} alt="" isHover={isHover} className={classNames.join(' ')} />;
}

/**
 * 获取菜单的标题
 * @param {object} menu -菜单标题
 */
export function renderMenuTitle(menu) {
  return (menu.name && intl.get(menu.name)) || '...';
}

/**
 * 获取菜单对应的 key
 * @param {!object} menu - 菜单
 */
export function getMenuKey(menu) {
  return menu.id;
}

export const MenuContext = React.createContext(undefined, (prev, next) => {
  // FIXME: 看子状态是否更新到底怎么判断
  return prev === next ? 0 : 1;
});
