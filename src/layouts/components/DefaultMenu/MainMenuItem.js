import React from 'react';
import { Bind } from 'lodash-decorators';

import SubMenuWrap from './SubMenuWrap';

import { renderIcon, renderMenuTitle, MenuContext } from './utils';
import styles from './styles.less';

class MainMenuItem extends React.PureComponent {
  constructor(props) {
    super(props);
    const { forceRender = false } = props;
    this.state = {
      loaded: forceRender,
      subMenuWrapStyle: {}, // 默认为控对象
    };

    this.cacheSubMenuWrapStyle = new Map();
    this.mainMenuItemRef = React.createRef();
  }

  @Bind()
  renderMainMenuItemTitle() {
    const { menu } = this.props;
    return renderMenuTitle(menu);
  }

  // TODO: 只能cache本一级菜单的样式, 需要提升到 Menu 中
  getSubMenuWrapStyle(mouseTop = 48) {
    let totalHeight;
    if (document.compatMode === 'BackCompat') {
      totalHeight = document.body.clientHeight;
    } else {
      totalHeight = document.documentElement.clientHeight;
    }
    const cacheKey = `${totalHeight}---${mouseTop}`;
    let subMenuWrapStyle;
    if (!this.cacheSubMenuWrapStyle.has(cacheKey)) {
      const max = totalHeight - 48;
      const min = Math.min(totalHeight - mouseTop + 23, max);
      subMenuWrapStyle = {
        minHeight: min,
        maxHeight: max,
      };
      this.cacheSubMenuWrapStyle.set(cacheKey, subMenuWrapStyle);
    }
    return subMenuWrapStyle || this.cacheSubMenuWrapStyle.get(cacheKey);
  }

  @Bind()
  handleMainMenuItemClick(e) {
    const { onClick, menu } = this.props;
    const { loaded } = this.state;
    const nextPartialState = {
      subMenuWrapStyle: this.getSubMenuWrapStyle(
        // FIXME: 如何获取元素相对于屏幕的高度距离
        this.mainMenuItemRef.current.offsetTop -
          this.mainMenuItemRef.current.parentElement.parentElement.scrollTop
        // e.clientY
      ),
    };
    if (!loaded) {
      nextPartialState.loaded = true;
    }
    this.setState(nextPartialState);
    onClick(e, menu);
  }

  render() {
    const { menu, activeMenus, hover } = this.props;
    const { loaded, subMenuWrapStyle } = this.state;
    const classNames = [styles['main-menu-item']];
    const active = menu === activeMenus[0];
    if (active) {
      classNames.push(styles['main-menu-item-active']);
    }
    if (hover) {
      classNames.push(styles['main-menu-item-hover']);
    }
    return (
      <li
        className={classNames.join(' ')}
        onClick={this.handleMainMenuItemClick}
        ref={this.mainMenuItemRef}
      >
        <div className={styles['main-menu-item-content']} key="main-menu-content">
          {renderIcon(menu.icon, 'main-menu-item', hover || active)}
          <span className={styles['main-menu-item-title']}>
            <MenuContext.Consumer>{this.renderMainMenuItemTitle}</MenuContext.Consumer>
          </span>
        </div>
        {loaded && (
          <SubMenuWrap
            key="sub-menu-wrap"
            style={subMenuWrapStyle}
            menu={menu}
            activeMenus={activeMenus}
            onLeafMenuClick={this.handleLeafMenuClick}
          />
        )}
        {loaded && (
          <div className={styles['sub-menu-mask']} onClick={this.handleSubMenuMaskClick} />
        )}
      </li>
    );
  }

  /**
   * 菜单右侧mask点击事件
   */
  @Bind()
  handleSubMenuMaskClick(e) {
    e.stopPropagation();
    const { onSubMenuMaskClick } = this.props;
    onSubMenuMaskClick();
  }

  @Bind()
  handleLeafMenuClick() {
    const { onLeafMenuClick } = this.props;
    onLeafMenuClick();
  }
}

export default MainMenuItem;
