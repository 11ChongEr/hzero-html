import React, { cloneElement, isValidElement } from 'react';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';

import { PENDING, SUCCESS, FAILURE } from 'components/Permission/Status';

export default class Permission extends React.Component {
  // 获取传递的context
  static contextTypes = {
    permission: PropTypes.object,
  };

  state = {
    status: PENDING,
    controllerType: 'disabled',
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

  /**
   * 检查权限后的回调函数
   * @param {number} status - 权限状态
   * @param {string} controllerType - 权限的控制类型
   */
  @Bind()
  handlePermission(status, controllerType = 'disabled') {
    this.setState({
      status,
      controllerType,
    });
  }

  @Bind()
  extendProps() {
    const { code, children } = this.props;
    const { status, controllerType } = this.state;
    if (!code || status === SUCCESS) {
      return children;
    }
    if (status === FAILURE) {
      if (controllerType === 'disabled') {
        return React.Children.map(children, child => {
          const itemChild = child.props.children;
          const newChild = cloneElement(itemChild, { disabled: true });
          if (isValidElement(itemChild)) {
            return cloneElement(child, { children: newChild });
          } else {
            return null;
          }
        });
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
