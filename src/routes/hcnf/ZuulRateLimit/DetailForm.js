/*
 * DetailForm - 限流明细表单
 * @date: 2018/10/13 11:08:03
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Form, Input, InputNumber, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Switch from 'components/Switch';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

const modelPrompt = 'hcnf.zuulRateLimit.model.zuulRateLimit';

/**
 * Zuul限流配置查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @reactProps {Function} toggleForm  展开查询条件
 * @reactProps {Function} renderAdvancedForm 渲染所有查询条件
 * @reactProps {Function} renderSimpleForm 渲染缩略查询条件
 * @return React.element
 */

const formLayout = {
  labelCol: { span: 5 },
  wrapperCol: { span: 15 },
};

@formatterCollections({
  code: 'hpfm.valueList',
})
@Form.create({ fieldNameProp: null })
export default class DetailForm extends React.Component {
  @Bind()
  handleOk() {
    const { onOk = e => e, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator },
      editValue,
      loading,
      headerInformation,
      title,
      modalVisible,
      onCancel,
    } = this.props;
    return (
      <Modal
        destroyOnClose
        title={title}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        confirmLoading={loading}
        visible={modalVisible}
        onOk={this.handleOk}
        onCancel={onCancel}
      >
        <Form>
          <Form.Item {...formLayout} label={intl.get(`${modelPrompt}.routeKey`).d('路由')}>
            {getFieldDecorator('routeKey', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${modelPrompt}.routeKey`).d('路由'),
                  }),
                },
              ],
              initialValue: editValue.routeKey,
            })(<Lov code="HCNF.ROUTE.SERVICE_PATH" textValue={editValue.routeKey} />)}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get(`${modelPrompt}.maxLimit`).d('请求数限制')}>
            {getFieldDecorator('maxLimit', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`${modelPrompt}.maxLimit`).d('请求数限制'),
                  }),
                },
              ],
              initialValue: editValue.maxLimit,
            })(<InputNumber min={0} />)}
          </Form.Item>
          {headerInformation.rateLimitType !== 'REDISBUCKET' && (
            <Form.Item {...formLayout} label={intl.get(`${modelPrompt}.quota`).d('请求时间限制')}>
              {getFieldDecorator('quota', {
                initialValue: editValue.quota,
              })(<InputNumber min={0} />)}
            </Form.Item>
          )}
          {headerInformation.rateLimitType !== 'REDISBUCKET' && (
            <Form.Item
              {...formLayout}
              label={intl.get(`${modelPrompt}.refreshInterval`).d('刷新窗口(秒)')}
            >
              {getFieldDecorator('refreshInterval', {
                initialValue: editValue.refreshInterval,
              })(<InputNumber min={0} />)}
            </Form.Item>
          )}
          {headerInformation.rateLimitType === 'REDISBUCKET' && (
            <Form.Item {...formLayout} label={intl.get(`${modelPrompt}.rate`).d('令牌产生速率')}>
              {getFieldDecorator('rate', {
                initialValue: editValue.rate,
              })(<InputNumber min={0} />)}
            </Form.Item>
          )}
          {headerInformation.rateLimitType === 'REDISBUCKET' && (
            <Form.Item
              {...formLayout}
              label={intl.get(`${modelPrompt}.consumeRate`).d('令牌消耗速率')}
            >
              {getFieldDecorator('consumeRate', {
                initialValue: editValue.consumeRate,
              })(<InputNumber min={0} />)}
            </Form.Item>
          )}
          <Form.Item {...formLayout} label={intl.get(`${modelPrompt}.user`).d('用户维度')}>
            {getFieldDecorator('user', {
              rules: [
                {
                  max: 360,
                  message: intl.get('hzero.common.validation.max', {
                    max: 360,
                  }),
                },
              ],
              initialValue: editValue.user,
            })(<Input />)}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get(`${modelPrompt}.tenant`).d('租户维度')}>
            {getFieldDecorator('tenant', {
              rules: [
                {
                  max: 360,
                  message: intl.get('hzero.common.validation.max', {
                    max: 360,
                  }),
                },
              ],
              initialValue: editValue.tenant,
            })(<Input />)}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get(`${modelPrompt}.origin`).d('源请求地址维度')}>
            {getFieldDecorator('origin', {
              rules: [
                {
                  max: 360,
                  message: intl.get('hzero.common.validation.max', {
                    max: 360,
                  }),
                },
              ],
              initialValue: editValue.origin,
            })(<Input />)}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get(`${modelPrompt}.url`).d('URL维度')}>
            {getFieldDecorator('url', {
              rules: [
                {
                  max: 360,
                  message: intl.get('hzero.common.validation.max', {
                    max: 360,
                  }),
                },
              ],
              initialValue: editValue.url,
            })(<Input />)}
          </Form.Item>
          <Form.Item {...formLayout} label={intl.get(`${modelPrompt}.enabledFlag`).d('是否启用')}>
            {getFieldDecorator('enabledFlag', {
              initialValue: editValue.enabledFlag === 0 ? 0 : 1,
            })(<Switch />)}
          </Form.Item>
        </Form>
      </Modal>
    );
  }
}
