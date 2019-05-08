import React from 'react';
import { Modal, Input, Form } from 'hzero-ui';

import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { PASSWORD } from 'utils/regExp';

const { Item: FormItem } = Form;

@Form.create({ fieldNameProp: null })
export default class EditPasswordModal extends React.Component {
  @Bind()
  saveBtnClick() {
    const { onOk, form } = this.props;
    if (!isFunction(onOk)) {
      return;
    }
    form.validateFields((err, values) => {
      if (!err) {
        // todo
        onOk(values);
      }
    });
  }

  /**
   * 检查 确认密码是否与密码一致
   * @param {String} rule
   * @param {String} value
   * @param {Function} callback
   */
  @Bind()
  validatePasswordRepeat(rule, value, callback) {
    const { form } = this.props;
    if (value && value !== form.getFieldValue('password')) {
      callback(
        intl.get('hiam.subAccount.view.validation.passwordSame').d('确认密码必须与密码一致')
      );
    } else {
      callback();
    }
  }

  /**
   * 检查 确认密码是否与密码一致
   */
  @Bind()
  validatePasswordRepeatForPassword(e) {
    const { form } = this.props;
    const anotherPassword = form.getFieldValue('anotherPassword');
    const anotherPasswordField = {
      value: anotherPassword,
    };
    if (e.target.value) {
      if (e.target.value === anotherPassword) {
        anotherPasswordField.errors = null;
      } else {
        anotherPasswordField.errors = [
          intl.get('hiam.subAccount.view.validation.passwordSame').d('确认密码必须与密码一致'),
        ];
      }
    } else {
      anotherPasswordField.errors = null;
    }
    form.setFields({
      anotherPassword: anotherPasswordField,
    });
  }

  /**
   * 检查 新密码与原密码不能相同
   * @param {String} rule
   * @param {String} value
   * @param {Function} callback
   */
  @Bind()
  validateNewPasswordNotSame(rule, value, callback) {
    const { form } = this.props;
    if (value && value === form.getFieldValue('originalPassword')) {
      callback(
        intl.get('hiam.subAccount.view.validation.passwordNoSame').d('新密码不能与原密码相同')
      );
    } else {
      callback();
    }
  }

  render() {
    const { form, visible, onCancel, confirmLoading, isSameUser } = this.props;
    const { getFieldDecorator } = form;
    const labelCol = { md: 6 };
    const wrapperCol = { md: 12 };
    return (
      <Modal
        destroyOnClose
        confirmLoading={confirmLoading}
        width={500}
        visible={visible}
        onOk={this.saveBtnClick}
        onCancel={onCancel}
        title={intl.get('hiam.subAccount.view.option.passwordUpdate').d('修改密码')}
      >
        {isSameUser && (
          <FormItem
            key="originalPassword"
            required
            labelCol={labelCol}
            wrapperCol={wrapperCol}
            label={intl.get('hiam.subAccount.model.user.originalPassword').d('原密码')}
          >
            {getFieldDecorator('originalPassword', {
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.subAccount.model.user.originalPassword').d('原密码'),
                    })
                    .d('原密码不能为空'),
                },
              ],
            })(<Input type="password" />)}
          </FormItem>
        )}
        <FormItem
          required
          key="password"
          labelCol={labelCol}
          wrapperCol={wrapperCol}
          label={intl.get('hiam.subAccount.model.user.password').d('密码')}
        >
          {getFieldDecorator('password', {
            rules: [
              {
                required: true,
                message: intl
                  .get('hzero.common.validation.notNull', {
                    name: intl.get('hiam.subAccount.model.user.password').d('密码'),
                  })
                  .d('密码不能为空'),
              },
              {
                validator: this.validateNewPasswordNotSame,
              },
              {
                pattern: PASSWORD,
                message: intl
                  .get('hzero.common.validation.password')
                  .d('至少包含数字/字母/字符2种组合,长度为6-30个字符'),
              },
            ],
          })(<Input type="password" onChange={this.validatePasswordRepeatForPassword} />)}
        </FormItem>
        <FormItem
          required
          labelCol={labelCol}
          wrapperCol={wrapperCol}
          key="anotherPassword"
          label={intl.get('hiam.subAccount.model.user.anotherPassword').d('确认密码')}
        >
          {getFieldDecorator('anotherPassword', {
            rules: [
              {
                required: true,
                message: intl
                  .get('hzero.common.validation.notNull', {
                    name: intl.get('hiam.subAccount.model.user.anotherPassword').d('确认密码'),
                  })
                  .d('确认密码不能为空'),
              },
              {
                validator: this.validatePasswordRepeat,
              },
            ],
          })(<Input type="password" />)}
        </FormItem>
      </Modal>
    );
  }
}
