import React from 'react';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import { openTab } from 'utils/menuTab';

import { renderMenuTitle, MenuContext } from './utils';

import styles from './styles.less';

class LeafMenuItem extends React.PureComponent {
  @Bind()
  renderLeafMenuItemTitle() {
    const { leafMenu } = this.props;
    return renderMenuTitle(leafMenu);
  }

  @Bind()
  handleLeafMenuClick(e) {
    e.preventDefault();
    e.stopPropagation();
    const { leafMenu, onClick } = this.props;
    // TODO: 直接在 LeafMenu 处理点击事件
    // 打开菜单
    openTab({
      icon: leafMenu.icon,
      title: leafMenu.name,
      key: leafMenu.path,
      closable: true,
      search: leafMenu.search,
    });
    if (isFunction(onClick)) {
      onClick(leafMenu);
    }
  }

  render() {
    const { leafMenu, active } = this.props;
    const classNames = [styles['leaf-menu-item']];
    if (active) {
      classNames.push(styles['leaf-menu-item-active']);
    }
    return (
      <a
        title={renderMenuTitle(leafMenu)}
        className={classNames.join(' ')}
        onClick={this.handleLeafMenuClick}
      >
        <MenuContext.Consumer>{this.renderLeafMenuItemTitle}</MenuContext.Consumer>
      </a>
    );
  }
}

export default LeafMenuItem;
