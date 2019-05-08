/**
 * SearchForm.js
 * @date 2018/11/12
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Icon } from 'hzero-ui';

import intl from 'utils/intl';

export default class SearchForm extends React.Component {
  static defaultProps = {
    children: [],
    labelWidth: 75,
    inputWidth: undefined,
    column: 3,
    showAdvance: false,
    className: '',
    align: 'left',
  };

  static propTypes = {
    showAdvance: PropTypes.bool,
    children: PropTypes.element,
    labelWidth: PropTypes.number,
    inputWidth: PropTypes.number,
    column: PropTypes.number,
    className: PropTypes.string,
    align: PropTypes.oneOf('left', 'right', 'center'),
  };

  state = {
    expandForm: false,
  };

  constructor(props) {
    super(props);
    this.toggleAdvanceForm = this.toggleAdvanceForm.bind(this);
  }

  toggleAdvanceForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  renderSearchForm() {
    const {
      labelWidth,
      inputWidth,
      children,
      column,
      showAdvance,
      onSubmit,
      onReset,
      align,
    } = this.props;
    const { expandForm } = this.state;
    const trElements = [];
    let trElement = [];
    let trIndex = 0;
    let travers = true;
    React.Children.forEach(children, child => {
      if (travers) {
        trIndex += child.props.colSpan;
        trElement.push(
          React.cloneElement(child, { labelWidth, inputWidth, align, ...child.props })
        );
        if (trIndex >= column) {
          trElements.push(trElement);
          trElement = [];
          trIndex = 0;
          if (showAdvance && !expandForm) {
            travers = false;
          }
        }
      }
    });
    if (trIndex !== 0) {
      trElements.push(trElement);
    }
    if (trElements[0]) {
      trElements[0].push(
        <td key="searchForm">
          <Button type="primary" htmlType="submit" className="search-btn-more" onClick={onSubmit}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={onReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
          {expandForm ? (
            <a style={{ marginLeft: 8 }} onClick={this.toggleAdvanceForm}>
              {intl.get(`hzero.common.button.up`).d('收起')} <Icon type="up" />
            </a>
          ) : (
            <a style={{ marginLeft: 8 }} onClick={this.toggleAdvanceForm}>
              {intl.get('hzero.common.button.expand').d('展开')} <Icon type="down" />
            </a>
          )}
        </td>
      );
    }
    return trElements.map(tds => <tr>{tds}</tr>);
  }

  render() {
    const { className } = this.props;
    return (
      <table className={className}>
        <tbody>{this.renderSearchForm()}</tbody>
      </table>
    );
  }
}
