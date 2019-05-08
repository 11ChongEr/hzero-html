/**
 * Event - 事件规则维护界面
 * @date: 2018-6-20
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Form, Input, InputNumber, Select } from 'hzero-ui';

import Switch from 'components/Switch';
import ModalForm from 'components/Modal/ModalForm';

import intl from 'utils/intl';

const { Option } = Select;

@Form.create({ fieldNameProp: null })
export default class EventRuleForm extends ModalForm {
  renderForm() {
    const { form, eventRule = {} } = this.props;
    const {
      matchingRule,
      beanName,
      methodName,
      apiUrl,
      apiMethod = 'GET',
      enabledFlag = 1,
      resultFlag = 0,
      syncFlag = 0,
      orderSeq = 1,
      callType = 'M',
    } = eventRule;
    return (
      <React.Fragment>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('hpfm.event.model.eventRule.rule').d('匹配规则')}
        >
          {form.getFieldDecorator('matchingRule', {
            initialValue: matchingRule,
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.event.model.eventRule.rule').d('匹配规则'),
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('hpfm.event.model.eventRule.callType').d('调用类型')}
        >
          {form.getFieldDecorator('callType', {
            initialValue: callType,
          })(
            <Select style={{ width: '100%' }}>
              <Option value="M">方法</Option>
              <Option value="A">API</Option>
            </Select>
          )}
        </Form.Item>
        {form.getFieldValue('callType') === 'M' ? (
          <React.Fragment>
            <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="BeanName">
              {form.getFieldDecorator('beanName', {
                initialValue: beanName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', { name: 'BeanName' }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
            <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="MethodName">
              {form.getFieldDecorator('methodName', {
                initialValue: methodName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', { name: 'MethodName' }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="API URL">
              {form.getFieldDecorator('apiUrl', {
                initialValue: apiUrl,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', { name: 'API URL' }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
            <Form.Item labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} label="API Method">
              {form.getFieldDecorator('apiMethod', {
                initialValue: apiMethod,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', { name: 'API Method' }),
                  },
                ],
              })(
                <Select style={{ width: '100%' }}>
                  <Option value="GET">GET</Option>
                  <Option value="POST">POST</Option>
                  <Option value="PUT">PUT</Option>
                  <Option value="DELETE">DELETE</Option>
                </Select>
              )}
            </Form.Item>
          </React.Fragment>
        )}

        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('hpfm.event.model.eventRule.orderSeq').d('顺序')}
        >
          {form.getFieldDecorator('orderSeq', {
            initialValue: orderSeq,
          })(<InputNumber min={1} max={100} />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('hpfm.event.model.eventRule.syncFlag').d('是否同步')}
        >
          {form.getFieldDecorator('syncFlag', {
            initialValue: syncFlag,
          })(<Switch />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('hpfm.event.model.eventRule.resultFlag').d('返回结果')}
        >
          {form.getFieldDecorator('resultFlag', {
            initialValue: resultFlag,
          })(<Switch />)}
        </Form.Item>
        <Form.Item
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 16 }}
          label={intl.get('hzero.common.status.enable').d('启用')}
        >
          {form.getFieldDecorator('enabledFlag', {
            initialValue: enabledFlag,
          })(<Switch />)}
        </Form.Item>
      </React.Fragment>
    );
  }
}
