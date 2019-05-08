import React from 'react';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import LeafMenuItem from './LeafMenuItem';

import styles from './styles.less';
import { getMenuKey } from './utils';

class LeafMenuItemWrap extends React.PureComponent {
  @Bind()
  handleLeafMenuClick(leafMenu) {
    const { subMenu, onClick } = this.props;
    if (isFunction(onClick)) {
      onClick(leafMenu, subMenu);
    }
  }

  @Bind()
  handleLeafMenuMouseEnter() {
    const { subMenu, onMouseEnter } = this.props;
    if (isFunction(onMouseEnter)) {
      onMouseEnter(subMenu);
    }
  }

  @Bind()
  handleLeafMenuMouseLeave() {
    const { subMenu, onMouseLeave } = this.props;
    if (isFunction(onMouseLeave)) {
      onMouseLeave(subMenu);
    }
  }

  render() {
    const { subMenu, activeMenus } = this.props;
    return (
      <div
        className={styles['leaf-menu-item-wrap']}
        onMouseEnter={this.handleLeafMenuMouseEnter}
        onMouseLeave={this.handleLeafMenuMouseLeave}
      >
        {subMenu.children.map(leafMenu => (
          <LeafMenuItem
            key={getMenuKey(leafMenu)}
            leafMenu={leafMenu}
            active={activeMenus[2] === leafMenu}
            onClick={this.handleLeafMenuClick}
          />
        ))}
      </div>
    );
  }
}

export default LeafMenuItemWrap;
