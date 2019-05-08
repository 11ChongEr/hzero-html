/**
 * MenuSelect - 菜单选择
 * @date: 2018-11-8
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Select } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import Bind from 'lodash-decorators/bind';
import intl from 'utils/intl';
import { openTab } from '../menuTab';

const { Option } = Select;

const menuSelectStyle = {
  width: '120px',
  marginRight: '10px',
  cursor: 'text',
};

@connect(({ global = {} }) => ({
  menuLeafNode: global.menuLeafNode,
}))
export default class MenuSelect extends Component {
  state = {
    data: [], // 根据输入框过滤出符合的值
    value: undefined, // 搜索框中的值
  };

  /**
   * 文本框变化时回调
   * @param {*} value
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
   * @param {*} value
   */
  @Bind()
  handleSelect(value) {
    const { menuLeafNode } = this.props;
    let params = {};
    const newMenuLeafNode = menuLeafNode.filter(item => item.path === value);
    newMenuLeafNode.forEach(element => {
      params = { ...params, ...element };
    });
    if (!isEmpty(params)) {
      openTab({
        icon: params.icon,
        title: params.name,
        key: params.path,
        path: params.path,
        closable: true,
      });
      this.setState({
        data: [],
        value: undefined,
      });
    }
  }

  /**
   * 失去焦点
   */
  @Bind()
  handleBlur() {
    this.setState({
      data: [],
      value: undefined,
    });
  }

  render() {
    const { data = [], value } = this.state;
    const options = data && data.map(d => <Option key={d.path}>{d.title}</Option>);
    return (
      <React.Fragment>
        <Select
          showSearch
          size="small"
          placeholder={intl.get('hzero.common.basicLayout.menuSelect').d('菜单搜索')}
          value={value}
          showArrow={false}
          style={menuSelectStyle}
          filterOption={false}
          onBlur={this.handleBlur}
          onSearch={val => this.handleSearch(val)}
          onSelect={val => this.handleSelect(val)}
        >
          {options}
        </Select>
      </React.Fragment>
    );
  }
}
