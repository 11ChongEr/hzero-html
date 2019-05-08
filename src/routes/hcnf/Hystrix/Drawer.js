/**
 * Drawer - 新增熔断规则Form侧滑表单
 * @date: 2018-9-15
 * @author: LZH <zhaohui.liu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Select, Modal } from 'hzero-ui';
import PropTypes from 'prop-types';
import formatterCollections from 'utils/intl/formatterCollections';
import { Bind } from 'lodash-decorators';
import { map } from 'lodash';
import Switch from 'components/Switch';
import Lov from 'components/Lov';
import intl from 'utils/intl';

const promptCode = 'hsgp.hystrix';
const { TextArea } = Input;
const { Option } = Select;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hsgp.hystrix'] })
export default class Drawer extends PureComponent {
  state = {
    serviceName: '',
    confTypeCode: '',
  };

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
   * 选择Lov带出对应的名称
   * @param {string} rowKeys
   * @param {object} record
   */
  @Bind()
  onHandleSelectServiceName(rowKey) {
    const { serviceName } = this.state;
    if (serviceName === '' && rowKey) {
      this.props.form.setFieldsValue({ serviceName: rowKey });
      this.setState({ serviceName: rowKey });
    } else if (rowKey === null) {
      this.props.form.resetFields('serviceConfLabel', []);
      this.setState({ serviceName: '' });
    } else if (serviceName !== rowKey) {
      this.props.form.resetFields('serviceConfLabel', []);
      this.setState({ serviceName: rowKey });
    }
  }

  @Bind()
  onHandleSelectServiceConfLabel(rowKey, record) {
    this.props.form.setFieldsValue({ serviceConfLabel: record.name });
  }

  @Bind()
  saveBtn() {
    const { form, onOk } = this.props;
    if (onOk) {
      form.validateFields((err, values) => {
        if (!err) {
          onOk({ ...values });
        }
      });
    }
  }

  render() {
    const { form, enabledFlag, confTypeCodeList, anchor, visible, title, onCancel } = this.props;
    const { confTypeCode, serviceName } = this.state;
    return (
      <Modal
        title={title}
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
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            label={intl.get(`${promptCode}.model.hystrix.confTypeCode`).d('代码')}
          >
            {form.getFieldDecorator('confTypeCode', {
              initialValue: confTypeCode,
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.hystrix.confTypeCode`).d('代码'),
                  }),
                },
              ],
            })(<Input trim typeCase="upper" inputChinese={false} />)}
          </Form.Item>
          <Form.Item
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            label={intl.get(`${promptCode}.model.hystrix.confKey`).d('类型')}
          >
            {form.getFieldDecorator('confKey', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.hystrix.confKey`).d('类型'),
                  }),
                },
              ],
            })(
              <Select style={{ width: '100%' }} allowClear>
                {map(confTypeCodeList, e => {
                  return (
                    <Option value={e.value} key={e.value}>
                      {e.meaning}
                    </Option>
                  );
                })}
              </Select>
            )}
          </Form.Item>
          <Form.Item
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            label={intl.get(`${promptCode}.model.hystrix.serviceName`).d('服务')}
          >
            {form.getFieldDecorator('serviceName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.model.hystrix.serviceName`).d('服务'),
                  }),
                },
              ],
            })(<Lov onChange={this.onHandleSelectServiceName} code="HPFM.DATASOURCE.SERVICE" />)}
          </Form.Item>
          <Form.Item
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            label={intl.get(`${promptCode}.model.hystrix.serviceConfLabel`).d('服务配置标签')}
          >
            {form.getFieldDecorator('serviceConfLabel')(
              <Lov
                disabled={!serviceName}
                code="HSGP.ZUUL.SERVICE_CONFIG"
                onChange={this.onHandleSelectServiceConfLabel}
                queryParams={{ serviceName }}
              />
            )}
          </Form.Item>
          <Form.Item
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            label={intl.get(`${promptCode}.model.hystrix.serviceConfProfile`).d('服务配置Profile')}
          >
            {form.getFieldDecorator('serviceConfProfile')(<Input />)}
          </Form.Item>
          <Form.Item
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            label={intl.get(`${promptCode}.model.hystrix.enabledFlag`).d('启用状态')}
          >
            {form.getFieldDecorator('enabledFlag', {
              initialValue: enabledFlag === false ? 0 : 1,
            })(<Switch />)}
          </Form.Item>
          <Form.Item
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 15 }}
            label={intl.get(`${promptCode}.model.hystrix.remark`).d('描述')}
          >
            {form.getFieldDecorator('remark')(<TextArea style={{ height: 150 }} />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
