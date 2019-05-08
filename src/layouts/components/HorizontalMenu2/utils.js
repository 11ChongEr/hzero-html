/**
 * 只有当菜单有 path 属性且不为空时 才认为时菜单节点
 * @param {object} - menu 菜单
 */
export function isLeafMenu(menu) {
  if (menu && menu.path) {
    return true;
  }
  return false;
}
