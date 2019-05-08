/**
 * passwordPolicy - 密码策略
 * @date: 2018-11-6
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Form, Input, InputNumber, Collapse, Switch, Spin, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';

const FormItem = Form.Item;
const { Panel } = Collapse;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@connect(({ passwordPolicy, loading }) => ({
  passwordPolicy,
  fetchTableListLoading: loading.effects['passwordPolicy/fetchPasswordPolicyList'],
  saving: loading.effects['passwordPolicy/updatePasswordPolicy'],
  organizationId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hiam.passwordPolicy'] })
export default class PasswordPolicy extends PureComponent {
  componentDidMount() {
    this.fetchPasswordPolicyList();
  }

  /**
   * 获取表单数据
   */
  @Bind()
  fetchPasswordPolicyList() {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'passwordPolicy/fetchPasswordPolicyList',
      payload: organizationId,
    });
  }

  /**
   * 更新密码策略
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      form,
      passwordPolicy: { passwordPolicyList = {} },
    } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        dispatch({
          type: 'passwordPolicy/updatePasswordPolicy',
          payload: { ...passwordPolicyList, ...values },
        }).then(res => {
          if (res) {
            notification.success();
            dispatch({
              type: 'passwordPolicy/updateState',
              payload: { passwordPolicyList: res },
            });
          }
        });
      }
    });
  }

  /**
   * 密码安全策略表单
   */
  renderPasswordForm() {
    const {
      form: { getFieldDecorator },
      passwordPolicy: { passwordPolicyList = {} },
    } = this.props;
    return (
      <Form>
        <Row>
          <Col span={10}>
            <FormItem
              label={intl
                .get('hiam.passwordPolicy.model.passwordPolicy.originalPassword')
                .d('新用户默认密码')}
              {...formLayout}
            >
              {getFieldDecorator('originalPassword', {
                initialValue: passwordPolicyList.originalPassword,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem
              label={intl
                .get('hiam.passwordPolicy.model.passwordPolicy.digitsCount')
                .d('最少数字数')}
              {...formLayout}
            >
              {getFieldDecorator('digitsCount', { initialValue: passwordPolicyList.digitsCount })(
                <InputNumber style={{ width: '100%' }} min={0} />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem
              label={intl
                .get('hiam.passwordPolicy.model.passwordPolicy.minLength')
                .d('最小密码长度')}
              {...formLayout}
            >
              {getFieldDecorator('minLength', { initialValue: passwordPolicyList.minLength })(
                <InputNumber style={{ width: '100%' }} min={0} />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem
              label={intl
                .get('hiam.passwordPolicy.model.passwordPolicy.maxLength')
                .d('最大密码长度')}
              {...formLayout}
            >
              {getFieldDecorator('maxLength', { initialValue: passwordPolicyList.maxLength })(
                <InputNumber style={{ width: '100%' }} min={0} />
              )}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem
              label={intl
                .get('hiam.passwordPolicy.model.passwordPolicy.lowercaseCount')
                .d('最少小写字母数')}
              {...formLayout}
            >
              {getFieldDecorator('lowercaseCount', {
                initialValue: passwordPolicyList.lowercaseCount,
              })(<InputNumber style={{ width: '100%' }} min={0} />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem
              label={intl
                .get('hiam.passwordPolicy.model.passwordPolicy.uppercaseCount')
                .d('最少大写字母数')}
              {...formLayout}
            >
              {getFieldDecorator('uppercaseCount', {
                initialValue: passwordPolicyList.uppercaseCount,
              })(<InputNumber style={{ width: '100%' }} min={0} />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem
              label={intl
                .get('hiam.passwordPolicy.model.passwordPolicy.specialCharCount')
                .d('最少特殊字符数')}
              {...formLayout}
            >
              {getFieldDecorator('specialCharCount', {
                initialValue: passwordPolicyList.specialCharCount,
              })(<InputNumber style={{ width: '100%' }} min={0} />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem
              label={intl
                .get('hiam.passwordPolicy.model.passwordPolicy.notRecentCount')
                .d('最大近期密码数')}
              {...formLayout}
            >
              {getFieldDecorator('notRecentCount', {
                initialValue: passwordPolicyList.notRecentCount,
              })(<InputNumber style={{ width: '100%' }} min={0} />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem
              label={intl
                .get('hiam.passwordPolicy.model.passwordPolicy.regularExpression')
                .d('密码正则')}
              {...formLayout}
            >
              {getFieldDecorator('regularExpression', {
                initialValue: passwordPolicyList.regularExpression,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
              {getFieldDecorator('enablePassword', {
                initialValue: passwordPolicyList.enablePassword,
              })(<Switch />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem
              label={intl
                .get('hiam.passwordPolicy.model.passwordPolicy.notUsername')
                .d('允许与登录名相同')}
              {...formLayout}
            >
              {getFieldDecorator('notUsername', { initialValue: passwordPolicyList.notUsername })(
                <Switch />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 登录安全策略表单
   */
  renderLoginForm() {
    const {
      form: { getFieldDecorator },
      passwordPolicy: { passwordPolicyList = {} },
    } = this.props;
    return (
      <Form>
        <Row>
          <Col span={10}>
            <FormItem label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
              {getFieldDecorator('enableSecurity', {
                initialValue: passwordPolicyList.enableSecurity,
              })(<Switch />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem
              label={intl
                .get('hiam.passwordPolicy.model.passwordPolicy.enableCaptcha')
                .d('开启验证码')}
              {...formLayout}
            >
              {getFieldDecorator('enableCaptcha', {
                initialValue: passwordPolicyList.enableCaptcha,
              })(<Switch />)}
            </FormItem>
          </Col>
          <Col span={10}>
            <FormItem
              label={intl.get('hiam.passwordPolicy.model.passwordPolicy.enableLock').d('开启锁定')}
              {...formLayout}
            >
              {getFieldDecorator('enableLock', { initialValue: passwordPolicyList.enableLock })(
                <Switch />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const { saving, fetchTableListLoading } = this.props;
    const customPanelStyle = {
      background: '#f7f7f7',
      borderRadius: 4,
      marginBottom: 24,
      border: 0,
      overflow: 'hidden',
      fontSize: 15,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hiam.passwordPolicy.view.message.title').d('密码策略')}>
          <Button type="primary" icon="save" onClick={this.handleSave} loading={saving}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="sync" onClick={this.fetchPasswordPolicyList}>
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={fetchTableListLoading}>
            <Collapse bordered={false} defaultActiveKey={['passwordPolicy', 'loginPolicy']}>
              <Panel
                header={intl
                  .get('hiam.passwordPolicy.view.message.subTitle.passwordPolicy')
                  .d('密码安全策略')}
                key="passwordPolicy"
                style={customPanelStyle}
              >
                {this.renderPasswordForm()}
              </Panel>
              <Panel
                header={intl
                  .get('hiam.passwordPolicy.view.message.subTitle.loginPolicy')
                  .d('登录安全策略')}
                key="loginPolicy"
                style={customPanelStyle}
              >
                {this.renderLoginForm()}
              </Panel>
            </Collapse>
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
