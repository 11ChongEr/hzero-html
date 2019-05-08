/*
 * AuthenticationServiceModal - 认证弹窗
 * @date: 2018-10-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Input, Row, Col, Select } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const modelPrompt = 'hitf.services.model.services';
const viewMessagePrompt = 'hitf.services.view.message';
const commonPrompt = 'hzero.common';

@Form.create({ fieldNameProp: null })
export default class AuthenticationServiceModal extends PureComponent {
  constructor(props) {
    super(props);
    this.cancel = this.cancel.bind(this);
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  @Bind()
  ok() {
    const {
      onOk = e => e,
      form: { validateFields },
    } = this.props;
    validateFields((err, values) => {
      if (isEmpty(err)) {
        onOk(values);
      }
    });
    this.cancel();
  }

  @Bind()
  cancel() {
    const { onCancel = e => e } = this.props;
    onCancel();
  }

  @Bind()
  handleChangeAuthType() {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ grantType: undefined });
  }

  defaultRowkey = 'id';

  render() {
    const {
      title,
      visible,
      onCancel,
      onOk,
      dataSource,
      loading,
      defaultSelectedRow,
      form: { getFieldDecorator = e => e, getFieldValue },
      authTypes,
      grantTypes,
      ...others
    } = this.props;

    const {
      authType,
      grantType,
      authUsername,
      authPassword,
      clientSecret,
      clientId,
      accessTokenUrl,
    } = dataSource;
    // 因为不能清空, 所以如果表单有值 就是表单的值, 否则是 初始值
    const curAuthType = getFieldValue('authType') || authType;
    const curGrantType = getFieldValue('grantType') || grantType;
    const onlyNamePwd =
      curAuthType === 'BASIC' || (curAuthType === 'OAUTH2' && curGrantType === 'PASSWORD'); // 只能输用户名和密码的条件
    const onlyAuthClient = curAuthType === 'OAUTH2' && curGrantType === 'CLIENT'; // 只能填除用户名和密码的情况
    return (
      <Modal
        title={intl.get(`${viewMessagePrompt}.title.editor.authConfig`).d('服务认证配置')}
        visible={visible}
        onOk={this.ok.bind(this)}
        onCancel={this.cancel.bind(this)}
        destroyOnClose
        width={680}
        {...others}
      >
        <Form>
          <Row>
            <Col span={12}>
              <FormItem label={intl.get(`${modelPrompt}.authType`).d('认证模式')} {...formLayout}>
                {getFieldDecorator('authType', {
                  initialValue: authType || 'NONE',
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get(`${commonPrompt}.validation.requireSelect`, {
                          name: intl.get(`${modelPrompt}.authType`).d('认证模式'),
                        })
                        .d(`请选择${intl.get(`${modelPrompt}.authType`).d('认证模式')}`),
                    },
                  ],
                })(
                  <Select onChange={this.handleChangeAuthType}>
                    {authTypes.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            {getFieldValue('authType') === 'OAUTH2' && (
              <Col span={12}>
                <FormItem
                  label={intl.get(`${modelPrompt}.grantType`).d('授权模式')}
                  {...formLayout}
                >
                  {getFieldDecorator('grantType', {
                    initialValue: authType === 'OAUTH2' ? grantType : undefined,
                  })(
                    <Select>
                      {grantTypes.map(n => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            )}
          </Row>
          <Row>
            {onlyNamePwd && (
              <Col span={12}>
                <FormItem
                  label={intl.get(`${modelPrompt}.authUsername`).d('认证用户名')}
                  {...formLayout}
                >
                  {getFieldDecorator('authUsername', {
                    initialValue: authUsername,
                  })(<Input />)}
                </FormItem>
              </Col>
            )}
            {onlyNamePwd && (
              <Col span={12}>
                <FormItem
                  label={intl.get(`${modelPrompt}.authPassword`).d('认证密码')}
                  {...formLayout}
                >
                  {getFieldDecorator('authPassword', {
                    initialValue: authPassword,
                  })(<Input />)}
                </FormItem>
              </Col>
            )}
          </Row>
          <Row>
            {onlyAuthClient && (
              <Col span={12}>
                <FormItem label={intl.get(`${modelPrompt}.clientId`).d('客户端ID')} {...formLayout}>
                  {getFieldDecorator('clientId', {
                    initialValue: clientId,
                  })(<Input />)}
                </FormItem>
              </Col>
            )}
            {onlyAuthClient && (
              <Col span={12}>
                <FormItem
                  label={intl.get(`${modelPrompt}.clientSecret`).d('客户端密钥')}
                  {...formLayout}
                >
                  {getFieldDecorator('clientSecret', {
                    initialValue: clientSecret,
                  })(<Input />)}
                </FormItem>
              </Col>
            )}
          </Row>
          <Row>
            {onlyAuthClient && (
              <Col span={18}>
                <FormItem
                  label={intl.get(`${modelPrompt}.accessTokenUrl`).d('获取Token的URL')}
                  {...formLayout}
                >
                  {getFieldDecorator('accessTokenUrl', {
                    initialValue: accessTokenUrl,
                  })(<Input />)}
                </FormItem>
              </Col>
            )}
          </Row>
        </Form>
      </Modal>
    );
  }
}
