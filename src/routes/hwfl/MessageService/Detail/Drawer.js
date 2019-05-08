import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, Select } from 'hzero-ui';
import { isUndefined, isEmpty, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';

import Switch from 'components/Switch';

import intl from 'utils/intl';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
/**
 * 消息服务-参数维护滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {string} anchor - 抽屉滑动位置
 * @reactProps {string} title - 抽屉标题
 * @reactProps {boolean} visible - 抽屉是否可见
 * @reactProps {Function} onOk - 抽屉确定操作
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} itemData - 操作对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Drawer extends PureComponent {
  /**
   * state初始化
   */
  state = {};

  /**
   * 组件属性定义
   */
  static propTypes = {
    anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    title: PropTypes.string,
    visible: PropTypes.bool,
    onOk: PropTypes.func,
    onCancel: PropTypes.func,
  };

  /**
   * 组件属性默认值设置
   */
  static defaultProps = {
    anchor: 'right',
    title: '',
    visible: false,
    onOk: e => e,
    onCancel: e => e,
  };

  /**
   * 确定操作
   */
  @Bind()
  saveBtn() {
    const { form, onOk, onEditOk, itemData } = this.props;
    const { parameterId } = itemData;
    if (onOk) {
      form.validateFields((err, values) => {
        if (isEmpty(err)) {
          // 校验通过，进行保存操作
          if (isEmpty(itemData)) {
            onOk(values);
          } else {
            onEditOk({ ...values, parameterId });
          }
        }
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { anchor, visible, title, form, itemData, onCancel, paramsType } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        title={title}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.saveBtn}
        okText={intl.get('hzero.common.button.sure').d('确定')}
        onCancel={onCancel}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
        destroyOnClose
      >
        <Form>
          <Form.Item label={intl.get('hwfl.common.model.param.name').d('参数名称')} {...formLayout}>
            {getFieldDecorator('parameterName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.common.model.param.name').d('参数名称'),
                  }),
                },
              ],
              initialValue: itemData.parameterName,
            })(<Input disabled={isNumber(itemData.parameterId)} />)}
          </Form.Item>
          <Form.Item label={intl.get('hwfl.common.model.param.type').d('参数类型')} {...formLayout}>
            {getFieldDecorator('parameterType', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.common.model.param.type').d('参数类型'),
                  }),
                },
              ],
              initialValue: itemData.parameterType,
            })(
              <Select>
                {paramsType.map(item => (
                  <Select.Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Select.Option>
                ))}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.common.model.common.description').d('描述')}
            {...formLayout}
          >
            {getFieldDecorator('description', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hwfl.common.model.common.description').d('描述'),
                  }),
                },
              ],
              initialValue: itemData.description,
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.common.view.message.defaultValue').d('默认值')}
            {...formLayout}
          >
            {getFieldDecorator('defaultValue', {
              initialValue: itemData.defaultValue,
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.common.view.message.parameterOrigin').d('页面地址')}
            {...formLayout}
          >
            {getFieldDecorator('parameterOrigin', {
              initialValue: itemData.parameterOrigin,
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.common.view.message.editAble').d('是否可编辑')}
            {...formLayout}
          >
            {getFieldDecorator('editAble', {
              initialValue: isUndefined(itemData.editAble) ? 1 : itemData.editAble,
            })(<Switch />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hwfl.common.view.message.isUriVariable').d('是否为URL参数')}
            {...formLayout}
          >
            {getFieldDecorator('isUriVariable', {
              initialValue: isUndefined(itemData.isUriVariable) ? 0 : itemData.isUriVariable,
            })(<Switch />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
