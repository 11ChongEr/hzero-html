import React, { PureComponent } from 'react';
import { Modal, Form, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import PropTypes from 'prop-types';
import { isEmpty, isNumber } from 'lodash';

import Lov from 'components/Lov';

import intl from 'utils/intl';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
/**
 * 发送配置-数据修改滑窗(抽屉)
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
    const { tempServerLineId } = itemData;
    if (onOk) {
      form.validateFields((err, values) => {
        if (isEmpty(err)) {
          // 校验通过，进行保存操作
          if (isEmpty(itemData)) {
            onOk(values);
          } else {
            onEditOk({ ...values, tempServerLineId });
          }
        }
      });
    }
  }

  /**
   * 改变消息类型，重置服务代码
   *
   * @memberof DetailModal
   */
  @Bind()
  changeTypeCode() {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({ serverId: undefined, serverName: undefined });
  }

  @Bind()
  getServerName(value, record) {
    const { setFieldsValue } = this.props.form;
    setFieldsValue({ serverName: record.serverName, serverCode: record.serverCode });
  }

  @Bind()
  onChangeTemplate(value, record) {
    const { setFieldsValue, registerField } = this.props.form;
    registerField('templateName');
    setFieldsValue({ templateName: record.templateName });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      anchor,
      visible,
      title,
      form,
      itemData,
      onCancel,
      messageType = [],
      tenantId,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
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
          <Form.Item
            label={intl.get('hmsg.sendConfig.model.sendConfig.templateId').d('模板代码')}
            {...formLayout}
          >
            {getFieldDecorator('templateCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hmsg.sendConfig.model.sendConfig.templateCode').d('模板代码'),
                  }),
                },
              ],
              initialValue: itemData.templateCode,
            })(
              <Lov
                code="HMSG.TEMP_SERVER.MESSAGE_TEMP"
                textValue={itemData.templateCode}
                disabled={!isNumber(tenantId)}
                queryParams={{
                  tenantId,
                }}
                onChange={this.onChangeTemplate}
              />
            )}
          </Form.Item>
          <FormItem
            label={intl.get('hmsg.sendConfig.model.sendConfig.typeCode').d('消息类型')}
            {...formLayout}
          >
            {getFieldDecorator('typeCode', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hmsg.sendConfig.model.sendConfig.typeCode').d('消息类型'),
                  }),
                },
              ],
              initialValue: itemData.typeCode,
            })(
              <Select allowClear onChange={this.changeTypeCode}>
                {messageType &&
                  messageType.map(item => (
                    <Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
              </Select>
            )}
          </FormItem>
          <Form.Item
            label={intl.get('hmsg.sendConfig.model.sendConfig.serverId').d('服务代码')}
            {...formLayout}
          >
            {getFieldDecorator('serverId', {
              rules: [
                {
                  required: getFieldValue('typeCode') !== 'WEB',
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hmsg.sendConfig.model.sendConfig.serverId').d('服务代码'),
                  }),
                },
              ],
              initialValue: itemData.serverId,
            })(
              <Lov
                code="HMSG.SERVER"
                textValue={itemData.serverCode}
                disabled={
                  !getFieldValue('typeCode') ||
                  !isNumber(tenantId) ||
                  getFieldValue('typeCode') === 'WEB'
                }
                queryParams={{
                  typeCode: getFieldValue('typeCode'),
                  tenantId,
                }}
                onChange={this.getServerName}
              />
            )}
          </Form.Item>
          <Form.Item
            label={intl.get('hmsg.sendConfig.model.sendConfig.serverName').d('服务名称')}
            {...formLayout}
          >
            {getFieldDecorator('serverName', {
              rules: [
                {
                  required: false,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hmsg.sendConfig.model.sendConfig.serverName').d('服务名称'),
                  }),
                },
              ],
              initialValue: itemData.serverName,
            })(<Input disabled />)}
          </Form.Item>
          <Form.Item label={intl.get('hzero.common.remark').d('备注')} {...formLayout}>
            {getFieldDecorator('remark', {
              rules: [
                {
                  required: false,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hzero.common.remark').d('备注'),
                  }),
                },
              ],
              initialValue: itemData.remark,
            })(<Input />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('serverCode', {
              initialValue: itemData.serverCode,
            })(<div />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
