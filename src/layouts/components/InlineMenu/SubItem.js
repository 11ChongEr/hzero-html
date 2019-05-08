/**
 * @date 2019-03-05
 * @author WY yang.wang06@hand-china.com
 * @copyright ® HAND 2019
 */
import React from 'react';

import { renderMenuTitle } from './utils';

import styles from './styles.less';

class SubItem extends React.Component {
  render() {
    const { subMenu, children } = this.props;
    return (
      <li key={subMenu.path} className={styles['sub-menu-item']}>
        <span className={styles['sub-menu-item-title']}>{renderMenuTitle(subMenu)}</span>
        <div className={styles['sub-menu-item-content']}>
          <ul className={styles['sub-menu-item-content-wrap']}>
            {children}
            <li className={styles['sub-menu-item-content-line']} />
          </ul>
        </div>
      </li>
    );
  }
}

export default SubItem;
