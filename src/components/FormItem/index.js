import React, { cloneElement } from 'react';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import { Form } from 'hzero-ui';

import { PENDING, SUCCESS, FAILURE } from 'components/Permission/Status';

const FormItems = Form.Item;

export default class FormItem extends React.Component {
  // 获取传递的context
  static contextTypes = {
    permission: PropTypes.object,
  };

  state = {
    status: PENDING,
    controllerType: 'hidden',
  };

  // 在 render 之前检查权限
  componentWillMount() {
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
  handlePermission(status, controllerType = 'hidden') {
    this.setState({
      status,
      controllerType,
    });
  }

  @Bind
  extendProps() {
    const { code, children, ...otherProps } = this.props;
    const { status, controllerType } = this.state;
    if (code === undefined || status === SUCCESS) {
      return <FormItems {...otherProps}>{children}</FormItems>;
    }
    if (status === FAILURE) {
      if (controllerType === 'disabled') {
        return <FormItems {...otherProps}>{cloneElement(children, { disabled: true })}</FormItems>;
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
