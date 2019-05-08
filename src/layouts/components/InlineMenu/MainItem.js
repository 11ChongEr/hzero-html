/**
 * @date 2019-03-05
 */
import React from 'react';
import { Bind } from 'lodash-decorators';

import styles from './styles.less';

import { renderIcon, renderMenuTitle } from './utils';

class MainItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showChildren: false,
    };
  }

  @Bind()
  handleMouseEnter() {
    this.setState({
      showChildren: true,
    });
  }

  @Bind()
  handleMouseLeave() {
    this.setState({
      showChildren: false,
    });
  }

  renderChildren() {
    const { children = null } = this.props;
    const { showChildren } = this.state;
    return React.cloneElement(children, { show: showChildren });
  }

  render() {
    const { active = false, menu } = this.props;
    const { showChildren = false } = this.state;
    const classNames = [styles['main-menu']];
    if (active || showChildren) {
      classNames.push(styles['main-menu-active']);
    }
    return (
      <li
        className={classNames.join(' ')}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
      >
        <div className={styles['main-menu-item']}>
          {renderIcon(menu.icon)}
          {<span className={styles['main-menu-title']}>{renderMenuTitle(menu)}</span>}
        </div>
        {this.renderChildren()}
      </li>
    );
  }
}

export default MainItem;
