import React from 'react';
import { Bind } from 'lodash-decorators';

import styles from './styles.less';
import { renderMenuTitle, MenuContext } from './utils';

class SubMenuItem extends React.PureComponent {
  @Bind()
  renderSubMenuItemTitle() {
    const { subMenu } = this.props;
    return renderMenuTitle(subMenu);
  }

  render() {
    const { active, hover, style } = this.props;
    const classNames = [styles['sub-menu-item']];
    if (active) {
      classNames.push(styles['sub-menu-item-active']);
    }
    if (hover) {
      classNames.push(styles['sub-menu-item-hover']);
    }
    return (
      <div className={classNames.join(' ')} style={style}>
        <div className={styles['sub-menu-item-content']}>
          <div className={styles['sub-menu-item-title']}>
            <MenuContext.Consumer>{this.renderSubMenuItemTitle}</MenuContext.Consumer>
          </div>
        </div>
      </div>
    );
  }
}

export default SubMenuItem;
