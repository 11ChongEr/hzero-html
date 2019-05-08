/**
 * SubMenu
 * 整个二级菜单
 * @date 2019-03-05
 * @author WY yang.wang06@hand-china.com
 * @copyright ® HAND 2019
 */

import React from 'react';

import styles from './styles.less';

class SubMenuWrap extends React.Component {
  constructor(props) {
    super(props);
    const { forceRender = false } = props;
    this.state = {
      loaded: forceRender,
    };
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { loaded } = prevState;
    const { show = false } = nextProps;
    if (!loaded && show) {
      // 当没有加载, 且变为显示时 loaded 变为 true
      return {
        loaded: true,
      };
    }
    return null;
  }

  renderChildren() {
    const { children } = this.props;
    const { loaded } = this.state;
    return loaded ? children : null;
  }

  render() {
    const { menu } = this.props;
    return (
      <ul key={menu.path} className={styles['sub-menu']}>
        {this.renderChildren()}
      </ul>
    );
  }
}

export default SubMenuWrap;
