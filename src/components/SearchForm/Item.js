/**
 * Item.js
 * @date 2018/11/12
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import styles from './styles.less';

export default class Item extends React.Component {
  static defaultProps = {
    label: '',
    colSpan: 1,
    colon: true,
    align: 'left',
  };

  static propTypes = {
    label: PropTypes.string,
    name: PropTypes.string.isRequired,
    colSpan: PropTypes.number,
    colon: PropTypes.bool,
    labelWidth: PropTypes.number.isRequired,
    inputWidth: PropTypes.number.isRequired,
    children: PropTypes.element.isRequired,
    align: PropTypes.oneOf('left', 'right', 'center'),
  };

  render() {
    const { label, children, colSpan, colon, name, labelWidth, inputWidth, align } = this.props;

    const labelClassName = classnames({
      [styles.colon]: colon,
      [styles.label]: true,
    });
    if (label) {
      return (
        <React.Fragment>
          <td className={labelClassName} key={`label${name}`} align={align} width={labelWidth}>
            {label}
          </td>
          <td key={`input${name}`} colSpan={colSpan * 2 - 1} width={inputWidth}>
            {children}
          </td>
        </React.Fragment>
      );
    }
    return (
      <td key={name} colSpan={colSpan + 1}>
        {children}
      </td>
    );
  }
}
