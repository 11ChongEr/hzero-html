import React from 'react';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import LeafMenuItemWrap from './LeafMenuItemWrap';

import { getMenuKey } from './utils';

import styles from './styles.less';

class LeafMenu extends React.PureComponent {
  @Bind()
  handleLeafMenuClick(leafMenu, subMenu) {
    const { onClick } = this.props;
    if (isFunction(onClick)) {
      onClick(leafMenu, subMenu);
    }
  }

  @Bind()
  handleLeafMenuMouseEnter(subMenu) {
    const { onMouseEnter } = this.props;
    if (isFunction(onMouseEnter)) {
      onMouseEnter(subMenu);
    }
  }

  @Bind()
  handleLeafMenuMouseLeave(subMenu) {
    const { onMouseLeave } = this.props;
    if (isFunction(onMouseLeave)) {
      onMouseLeave(subMenu);
    }
  }

  render() {
    const { menu, activeMenus, getSubMenuStyle, minHeight } = this.props;
    const lineLen = menu.children.length - 1;
    return (
      <div
        className={styles['leaf-menu']}
        style={{
          ...getSubMenuStyle(menu),
          minHeight,
        }}
      >
        {menu.children.map((subMenu, index) => (
          <React.Fragment key={getMenuKey(subMenu)}>
            <LeafMenuItemWrap
              subMenu={subMenu}
              activeMenus={activeMenus}
              onClick={this.handleLeafMenuClick}
              onMouseEnter={this.handleLeafMenuMouseEnter}
              onMouseLeave={this.handleLeafMenuMouseLeave}
            />
            {index < lineLen && <div className={styles['leaf-menu-item-wrap-line']} />}
          </React.Fragment>
        ))}
      </div>
    );
  }
}

export default LeafMenu;
