/**
 * StaticTextEditor.js
 * 本质上 TinymceEditor 是不受控的, 之前这里写错了, 一直没有更新 content 但是 编辑器里面还是有值
 * @date 2018-12-25
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import TinymceEditor from 'components/TinymceEditor';

@Form.create({ fieldNameProp: null })
export default class StaticTextEditor extends React.Component {
  state = {
    content: '', // 编辑器内容
    // prevContent: '', // 保存用来比较编辑内容是否改变
  };

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { content } = nextProps;
    if (content !== prevState.prevContent) {
      return {
        content: content || '',
        prevContent: content,
      };
    }
    return null;
  }

  render() {
    const { content } = this.state;
    return <TinymceEditor content={content} onChange={this.handleEditChange} />;
  }

  @Bind()
  handleEditChange(dataSource) {
    this.setState({
      content: dataSource,
    });
  }
}
