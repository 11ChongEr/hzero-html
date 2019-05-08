import React from 'react';
import { Icon, Divider } from 'hzero-ui';
import { isEmpty, isFunction } from 'lodash';

import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';

import styles from './styles.less';

const subMainMenuDividerStyle = {
  width: '60px',
  marginTop: '6px',
  marginBottom: '0px',
};

class SubMenu extends React.Component {
  render() {
    const { menu, active } = this.props;
    const menus = menu.children;
    if (menus) {
      const ms = menus.map(m => {
        return renderMenu(m, 1);
      });
      return (
        <section
          key={`sub-${menu.id}`}
          className={`${styles['horizontal-menu-sub']}${
            active ? ` ${styles['horizontal-menu-sub-active']}` : ''
          }`}
        >
          {ms}
        </section>
      );
    }
    return null;
  }
}

function renderMenu(menu, level, path) {
  if (!menu) {
    return null;
  }
  const hComponent = `h${level}`;
  const classNames = [styles.hgroup];
  classNames.push(styles[`hgroup-${level}`]);
  const isLeafMenu = isEmpty(menu.children);
  if (isLeafMenu) {
    classNames.push(styles['menu-leaf']);
    return (
      <nav className={classNames.join(' ')} key={`sub-${level}-${menu.id}`}>
        {React.createElement(
          hComponent,
          {
            key: `menu-link-${menu.id}`,
            onClick: e => {
              if (isFunction(e && e.preventDefault)) {
                e.preventDefault();
              }
              // 打开菜单
              openTab({
                icon: menu.icon,
                title: menu.name,
                key: menu.path,
                closable: true,
                search: menu.search,
              });
            },
          },
          <React.Fragment>
            <Icon type={menu.icon} className={styles['menu-icon']} />
            {menu.name && intl.get(menu.name)}
          </React.Fragment>
        )}
      </nav>
    );
  } else {
    return (
      <nav key={`sub-${level}-${menu.id}`} className={classNames.join(' ')}>
        {React.createElement(
          hComponent,
          {
            key: `menu-link-${menu.id}`,
          },
          <React.Fragment>
            <Icon type={menu.icon} className={styles['menu-icon']} />
            {menu.name && intl.get(menu.name)}
          </React.Fragment>
        )}
        {level === 1 && <Divider style={subMainMenuDividerStyle} />}
        <ul key={`menu-nav-${menu.id}`}>
          {menu.children.map(m => {
            // 菜单最大嵌套深度为 3 层
            return <li key={m.id}>{renderMenu(m, level > 4 ? 4 : level + 1, path)}</li>;
          })}
        </ul>
      </nav>
    );
  }
}

export default SubMenu;
