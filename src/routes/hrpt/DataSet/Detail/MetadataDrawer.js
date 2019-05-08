import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form, Input, InputNumber } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
/**
 * 跳转条件-数据修改滑窗(抽屉)
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
    if (onOk) {
      form.validateFields((err, values) => {
        if (isEmpty(err)) {
          // 校验通过，进行保存操作
          if (isEmpty(itemData)) {
            onOk(values);
          } else {
            onEditOk(values);
          }
        }
      });
    }
  }

  /**
   * 元数据-序号唯一性校验
   */
  @Bind()
  checkUnique(rule, value, callback) {
    const { onCheckUnique } = this.props;
    if (!isEmpty(value)) {
      onCheckUnique(rule, value, callback);
    } else {
      callback();
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { anchor, visible, metadataTitle, form, itemData, onCancel } = this.props;
    const { getFieldDecorator } = form;
    const ordinalRules = [
      {
        required: true,
        message: intl.get('hzero.common.validation.notNull', {
          name: intl.get('hrpt.reportDataSet.model.reportDataSet.ordinal').d('序号'),
        }),
      },
    ];
    const checkUniqueRule = {
      validator: this.checkUnique,
    };
    if (isEmpty(itemData)) {
      ordinalRules.push(checkUniqueRule);
    }
    return (
      <Modal
        destroyOnClose
        title={metadataTitle}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.saveBtn}
        onCancel={onCancel}
      >
        <Form>
          <Form.Item
            label={intl.get('hrpt.reportDataSet.model.reportDataSet.ordinal').d('序号')}
            {...formLayout}
          >
            {getFieldDecorator('ordinal', {
              rules: ordinalRules,
              validateTrigger: 'onBlur',
              initialValue: itemData.ordinal,
            })(<InputNumber disabled={!isEmpty(itemData)} style={{ width: '100%' }} />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hrpt.reportDataSet.model.reportDataSet.name').d('列名')}
            {...formLayout}
          >
            {getFieldDecorator('name', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hrpt.reportDataSet.model.reportDataSet.name').d('列名'),
                  }),
                },
              ],
              initialValue: itemData.name,
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hrpt.reportDataSet.model.reportDataSet.text').d('标题')}
            {...formLayout}
          >
            {getFieldDecorator('text', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hrpt.reportDataSet.model.reportDataSet.text').d('标题'),
                  }),
                },
              ],
              initialValue: itemData.text,
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hrpt.reportDataSet.model.reportDataSet.dataType').d('数据类型')}
            {...formLayout}
          >
            {getFieldDecorator('dataType', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hrpt.reportDataSet.model.reportDataSet.dataType').d('数据类型'),
                  }),
                },
              ],
              initialValue: itemData.dataType,
            })(<Input />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hrpt.reportDataSet.model.reportDataSet.decimals').d('精度')}
            {...formLayout}
          >
            {getFieldDecorator('decimals', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hrpt.reportDataSet.model.reportDataSet.decimals').d('精度'),
                  }),
                },
              ],
              initialValue: itemData.decimals,
            })(<InputNumber min={0} style={{ width: '50%' }} />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
