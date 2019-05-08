import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Modal, Form } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import Switch from 'components/Switch';
import Lov from 'components/Lov';

import intl from 'utils/intl';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
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
    const { messageEventId } = itemData;
    if (onOk) {
      form.validateFields((err, values) => {
        if (isEmpty(err)) {
          // 校验通过，进行保存操作
          if (isEmpty(itemData)) {
            onOk(values);
          } else {
            onEditOk({ ...values, messageEventId });
          }
        }
      });
    }
  }

  /**
   * 改变消息模板，获取消息类型
   *
   * @param {*} val
   * @param {*} record
   * @memberof Drawer
   */
  @Bind()
  changeTemplateCode(val, record) {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({ templateTypeCode: record.templateTypeCode });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      anchor,
      messageVisible,
      form,
      itemData,
      onCancel,
      // messageTypeCode = [],
      saving,
    } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Modal
        destroyOnClose
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={messageVisible}
        onOk={this.saveBtn}
        onCancel={onCancel}
        confirmLoading={saving}
        title={
          isEmpty(itemData)
            ? intl.get('hpfm.event.view.message.create').d('新建事件消息')
            : intl.get('hpfm.event.view.message.edit').d('编辑事件消息')
        }
      >
        <Form>
          <Form.Item
            label={intl.get('hpfm.event.model.eventMessage.receiverTypeId').d('接收者类型')}
            {...formLayout}
          >
            {getFieldDecorator('receiverTypeId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.event.model.eventMessage.receiverTypeId').d('接收者类型'),
                  }),
                },
              ],
              initialValue: itemData.receiverTypeId,
            })(<Lov code="HMSG.RECEIVER" textValue={itemData.receiverTypeName} />)}
          </Form.Item>
          <Form.Item
            label={intl.get('hpfm.event.model.eventMessage.tempServerId').d('消息模板账户')}
            {...formLayout}
          >
            {getFieldDecorator('tempServerId', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.event.model.eventMessage.tempServerId').d('消息模板账户'),
                  }),
                },
              ],
              initialValue: itemData.tempServerId,
            })(
              <Lov
                code="HMSG.TEMPLATE_SERVER"
                textValue={itemData.messageName}
                // onChange={this.changeTemplateCode}
              />
            )}
          </Form.Item>
          {/* <Form.Item
            label={intl.get('hpfm.event.model.eventMessage.templateTypeCode').d('消息类型')}
            {...formLayout}
          >
            {getFieldDecorator('templateTypeCode', {
              rules: [
                {
                  required: false,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.event.model.eventMessage.templateTypeCode').d('消息类型'),
                  }),
                },
              ],
              initialValue: itemData.templateTypeCode,
            })(
              <Select disabled>
                {messageTypeCode &&
                  messageTypeCode.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
              </Select>
            )}
          </Form.Item> */}
          <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
            {getFieldDecorator('enabledFlag', {
              initialValue: isEmpty(itemData) ? 1 : itemData.enabledFlag,
            })(<Switch />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
