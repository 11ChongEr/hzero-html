/**
 * 菜单叶子节点
 */

import React from 'react';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import { renderMenuTitle } from './utils';

import styles from './styles.less';

class LeafItem extends React.Component {
  @Bind()
  handleLeafMenuClick(e) {
    const { onClick, leafMenu } = this.props;
    if (isFunction(onClick)) {
      onClick(leafMenu, e);
    }
  }

  render() {
    const { leafMenu } = this.props;
    return (
      <li key={leafMenu.path} className={styles['leaf-menu']} onClick={this.handleLeafMenuClick}>
        <a>{renderMenuTitle(leafMenu)}</a>
      </li>
    );
  }
}

export default LeafItem;
