/**
 * 搜索框
 */
import React from 'react';
import { Select } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, uniqBy } from 'lodash';

import { openTab } from 'utils/menuTab';
import { setSession, getSession } from 'utils/utils';
import intl from 'utils/intl';

import styles from './styles.less';

const menuHistorySessionKey = 'menuHistoryKey';

class DefaultHeaderSearch extends React.Component {
  state = {
    data: [], // 根据输入框过滤出符合的值
    value: undefined, // 搜索框中的值
    history: getSession(menuHistorySessionKey) || [],
  };

  handleGotoHistory(tab) {
    openTab(tab);
    this.addHistory(tab);
  }

  componentWillUnmount() {
    const { history = [] } = this.state;
    setSession(menuHistorySessionKey, history);
  }

  addHistory(tab) {
    const { history = [] } = this.state;
    const newHistory = uniqBy([tab, ...history], t => t.key);
    if (newHistory.length > 8) {
      newHistory.pop();
    }
    setSession(menuHistorySessionKey, history);
    this.setState({
      history: newHistory,
    });
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
    const selectMenu = menuLeafNode.filter(item => item.id === value)[0];
    if (!isEmpty(selectMenu)) {
      const newTab = {
        icon: selectMenu.icon,
        title: selectMenu.name,
        key: selectMenu.path,
        path: selectMenu.path,
        closable: true,
        id: selectMenu.id,
      };
      openTab(newTab);
      this.addHistory(newTab);
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

  renderHistory() {
    const { history = [] } = this.state;
    return (
      history &&
      history.length > 0 && (
        <div className={styles.history}>
          <span className={styles['history-title']}>搜索历史:</span>
          <ul className={styles['history-content']}>
            {history &&
              history
                .filter(tab => (tab.title ? intl.get(tab.title) : ''))
                .map(tab => {
                  return (
                    <li key={tab.key}>
                      <a
                        title={tab.title ? intl.get(tab.title) : ''}
                        // href={}
                        onClick={this.handleGotoHistory.bind(this, tab)}
                      >
                        {tab.title ? intl.get(tab.title) : ''}
                      </a>
                    </li>
                  );
                })}
          </ul>
        </div>
      )
    );
  }

  render() {
    const { className = '', collapsed } = this.props;
    const { data = [], value, focus } = this.state;
    const options =
      data &&
      data.map(d => (
        <Select.Option key={d.id} value={d.id}>
          {d.title}
        </Select.Option>
      ));
    const wrapClassNames = [className, styles.search];
    const iconClassNames = [styles.icon];
    if (collapsed) {
      wrapClassNames.push(styles.collapsed);
    }
    if (focus) {
      wrapClassNames.push(styles.focus);
      iconClassNames.push(styles.active);
    }
    return (
      <div className={wrapClassNames.join(' ')}>
        <span className={iconClassNames.join(' ')} />
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
          onSearch={this.handleSearch}
          onSelect={this.handleSelect}
        >
          {options}
        </Select>
        {this.renderHistory()}
      </div>
    );
  }
}

export default connect(({ global = {} }) => ({
  menuLeafNode: global.menuLeafNode,
}))(DefaultHeaderSearch);
