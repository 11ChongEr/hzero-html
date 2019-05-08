import React from 'react';
import { Select } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { openTab } from 'utils/menuTab';
import intl from 'utils/intl';

import styles from './styles.less';

class HeaderSearch extends React.Component {
  state = {
    data: [], // 根据输入框过滤出符合的值
    value: undefined, // 搜索框中的值
  };

  render() {
    const { className = '', collapsed } = this.props;
    const { data = [], value, focus } = this.state;
    const options = data && data.map(d => <Select.Option key={d.path}>{d.title}</Select.Option>);
    const wrapClassNames = [className, styles.search];
    if (collapsed) {
      wrapClassNames.push(styles.collapsed);
    }
    if (focus) {
      wrapClassNames.push(styles.focus);
    }
    return (
      <div className={wrapClassNames.join(' ')}>
        <Select
          showSearch
          size="small"
          placeholder={intl.get('hzero.common.basicLayout.menuSelect').d('菜单搜索')}
          value={value}
          showArrow={false}
          className={styles.input}
          filterOption={false}
          onBlur={this.handleBlur}
          onFocus={this.handleFocus}
          onSearch={val => this.handleSearch(val)}
          onSelect={val => this.handleSelect(val)}
        >
          {options}
        </Select>
        <ul className={styles.history} />
      </div>
    );
  }

  /**
   * 文本框变化时回调
   * @param {string} value - 填写的标题
   */
  @Bind()
  handleSearch(value) {
    const { menuLeafNode } = this.props;
    let newData = [];
    if (!isEmpty(value)) {
      newData = menuLeafNode.filter(item => item.title.indexOf(value) >= 0);
    }
    this.setState({
      data: newData,
    });
  }

  /**
   * 下拉框选择值时变化
   * @param {string} value - 选中菜单的路径
   */
  @Bind()
  handleSelect(value) {
    const { menuLeafNode } = this.props;
    // 必定选中 且只能选中一个
    const selectMenu = menuLeafNode.filter(item => item.path === value)[0];
    if (!isEmpty(selectMenu)) {
      openTab({
        icon: selectMenu.icon,
        title: selectMenu.name,
        key: selectMenu.path,
        path: selectMenu.path,
        closable: true,
      });
      this.setState({
        data: [],
        value: undefined,
      });
    }
  }

  @Bind()
  handleFocus() {
    this.setState({
      focus: true,
    });
  }

  /**
   * 失去焦点
   */
  @Bind()
  handleBlur() {
    this.setState({
      focus: false,
      data: [],
      value: undefined,
    });
  }
}

export default connect(({ global = {} }) => ({
  menuLeafNode: global.menuLeafNode,
}))(HeaderSearch);
