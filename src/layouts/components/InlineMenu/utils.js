import React from 'react';
import { Icon } from 'hzero-ui';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';

import styles from './styles.less';

/**
 * 渲染一级菜单的icon
 * @param {string} icon - icon 或者图标
 */
export function renderIcon(icon) {
  const classNames = [styles['main-menu-icon']];
  if (typeof icon === 'string' && icon.indexOf('http') === 0) {
    classNames.push(styles['main-menu-icon-img']);
    return <img src={icon} alt="" className={classNames.join(' ')} />;
  }
  if (typeof icon === 'string') {
    classNames.push(styles['main-menu-icon-icon']);
    return <Icon type={icon} className={classNames.join(' ')} />;
  }
  return icon;
}

/**
 * 获取菜单的标题
 * @param {object} menu -菜单标题
 */
export function renderMenuTitle(menu) {
  return menu.name && intl.get(menu.name);
}

/**
 * 判断是否是叶子菜单
 * @param {object} menu - 菜单
 */
export function isLeafMenu(menu = {}) {
  return isEmpty(menu.children);
}

/**
 * 获取菜单对应的 key
 * @param {!object} menu - 菜单
 */
export function getMenuKey(menu) {
  // TODO 是不是需要换成 菜单的 id
  return menu.path;
}
