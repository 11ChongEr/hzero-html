/*
 * ListForm - 限流设置列表表单
 * @date: 2018/08/07 14:42:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, isEmpty } from 'lodash';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import Switch from 'components/Switch';

const promptCode = 'hsgp.zuulRateLimit.model.zuulRateLimit';
const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 17 },
};
/**
 * 限流设置列表表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onHandleSelect // lov设置名称
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class ListForm extends PureComponent {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) props.onRef(this);
    this.state = {
      serviceName: null,
    };
  }

  @Bind()
  handleChangeServiceName(value, record) {
    const {
      form: { resetFields },
    } = this.props;
    resetFields(['serviceConfLabel']);
    this.setState({
      serviceName: record.serviceName,
    });
  }

  // 保存
  @Bind()
  saveBtn() {
    const { form, onHandleAdd } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onHandleAdd(values);
      }
    });
  }

  render() {
    const { form, title, anchor, visible, onCancel, confirmLoading } = this.props;
    const { serviceName } = this.state;
    return (
      <Modal
        destroyOnClose
        title={title}
        width={520}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        onOk={this.saveBtn}
        onCancel={onCancel}
        confirmLoading={confirmLoading}
        okText={intl.get('hzero.common.button.sure').d('确定')}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        <Form>
          <Form.Item {...formLayout} label={intl.get(`${promptCode}.rateLimitKey`).d('代码')}>
            {form.getFieldDecorator('rateLimitKey', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.uomTypeCode`).d('代码'),
                  }),
                },
                {
                  max: 80,
                  message: intl.get('hzero.common.validation.max', {
                    max: 80,
                  }),
                },
              ],
            })(<Input typeCase="upper" inputChinese={false} />)}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get(`${promptCode}.rateLimitType`).d('限流方式')}>
            {form.getFieldDecorator('rateLimitType', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.rateLimitType`).d('限流方式'),
                  }),
                },
              ],
            })(<Lov code="HSGP.ZULL.ZULL_LIMIT_TYPE" />)}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get(`${promptCode}.remark`).d('说明')}>
            {form.getFieldDecorator('remark', {})(<Input />)}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get(`${promptCode}.serviceName`).d('网关服务')}>
            {form.getFieldDecorator('serviceName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${promptCode}.serviceName`).d('网关服务'),
                  }),
                },
              ],
            })(<Lov code="HPFM.DATASOURCE.SERVICE" onChange={this.handleChangeServiceName} />)}
          </Form.Item>
          <Form.Item
            {...formLayout}
            label={intl.get(`${promptCode}.serviceConfLabel`).d('服务配置标签')}
          >
            {form.getFieldDecorator('serviceConfLabel', {})(
              <Lov
                code="HSGP.ZUUL.SERVICE_CONFIG"
                disabled={!serviceName}
                queryParams={{ serviceName }}
              />
            )}
          </Form.Item>
          <Form.Item
            {...formLayout}
            label={intl.get(`${promptCode}.serviceConfProfile`).d('服务配置Profile')}
          >
            {form.getFieldDecorator('serviceConfProfile', {
              rules: [
                {
                  max: 240,
                  message: intl.get('hzero.common.validation.max', {
                    max: 240,
                  }),
                },
              ],
            })(<Input />)}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get(`${promptCode}.enabledFlag`).d('是否启用')}>
            {form.getFieldDecorator('enabledFlag', {
              initialValue: 1,
            })(<Switch />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
