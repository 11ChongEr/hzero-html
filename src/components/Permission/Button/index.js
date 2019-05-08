import React from 'react';
import PropTypes from 'prop-types';
import { Button as HzeroButton } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { PENDING, SUCCESS, FAILURE } from 'components/Permission/Status';

export default class Button extends React.Component {
  // 获取传递的context
  static contextTypes = {
    permission: PropTypes.object,
  };

  state = {
    status: PENDING,
    controllerType: 'hidden',
  };

  // 在 render 之前检查权限
  // eslint-disable-next-line
  UNSAFE_componentWillMount() {
    const { code } = this.props;
    if (code !== undefined) {
      this.check(this.props, this.context);
    }
  }

  /**
   * 调用 context 的 check
   * @param {object} props - 检查所需参数
   * @param {object} context - 上下文
   */
  @Bind()
  check(props, context) {
    const { code } = props;
    if (context.permission) {
      context.permission.check({ code }, this.handlePermission);
    }
  }

  @Bind()
  handlePermission(status, controllerType = 'disabled') {
    this.setState({
      status,
      controllerType,
    });
  }

  @Bind()
  extendProps() {
    const { code, ...otherProps } = this.props;
    const { type = '', children, onClick = e => e } = otherProps;
    const { status, controllerType } = this.state;
    // 普通按钮不做限制
    if (code === undefined) {
      return <HzeroButton {...otherProps} />;
    }
    if (status === SUCCESS) {
      return type !== 'text' ? (
        <HzeroButton {...otherProps} />
      ) : (
        <a onClick={onClick}>{children}</a>
      );
    } else if (status === FAILURE) {
      if (controllerType === 'disabled') {
        return type !== 'text' ? (
          <HzeroButton {...otherProps} disabled />
        ) : (
          <a style={{ cursor: 'not-allowed', color: 'rgba(0,0,0,0.25)' }}>{children}</a>
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  render() {
    return this.extendProps();
  }
}
