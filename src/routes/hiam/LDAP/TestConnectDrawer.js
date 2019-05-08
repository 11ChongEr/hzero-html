import React from 'react';
import { Form, Icon, Spin, Input, Modal, Button, Tag, Divider } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import styles from './index.less';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
@Form.create({ fieldNameProp: null })
export default class TestConnectDrawer extends React.PureComponent {
  state = {
    isShowResult: false,
  };

  // 确认操作
  @Bind()
  handleOk() {
    const { showWhich, tenantId, ldapData, dispatch } = this.props;
    if (showWhich !== 'adminConnect') {
      this.props.form.validateFieldsAndScroll((err, value) => {
        if (!err) {
          this.setState({ isShowResult: true });
          const ldapDataT = Object.assign({}, ldapData);
          ldapDataT.account = value.ldapName;
          ldapDataT.password = value.ldapPwd;
          dispatch({
            type: 'ldap/testConnect',
            payload: {
              tenantId,
              ...ldapDataT,
            },
          });
        }
      });
    } else {
      dispatch({
        type: 'ldap/testConnect',
        payload: {
          tenantId,
          ...ldapData,
        },
      });
    }
  }

  // 渲染测试结果
  @Bind()
  getTestResult() {
    const { testData, ldapData } = this.props;
    const adminAccount = ldapData.account;
    const adminPassword = ldapData.password;
    const adminStatus = adminAccount && adminPassword;
    return (
      <div>
        <Divider orientation="left">
          {intl.get('hiam.ldap.view.message.test.result').d('测试结果')}
        </Divider>
        <div className={styles['result-container']}>
          <div className={styles['result-info']}>
            <div>
              <Icon
                type={testData.canLogin ? 'check_circle' : 'cancel'}
                className={testData.canLogin ? 'successIcon' : 'failedIcon'}
              />
              {intl.get('hiam.ldap.view.message.test.login').d('LDAP登录')}：
              {testData.canLogin ? (
                <Tag color="green">{intl.get('hiam.ldap.view.message.success').d('成功')}</Tag>
              ) : (
                <Tag color="red">{intl.get('hiam.ldap.view.message.error').d('失败')}</Tag>
              )}
            </div>
            <div>
              <Icon
                type={testData.canConnectServer ? 'check_circle' : 'cancel'}
                className={
                  testData.canConnectServer ? styles['success-icon'] : styles['failed-icon']
                }
              />
              {intl.get('hiam.ldap.view.message.test.connect').d('基础连接')}：
              {testData.canConnectServer ? (
                <Tag color="green">{intl.get('hiam.ldap.view.message.success').d('成功')}</Tag>
              ) : (
                <Tag color="red">{intl.get('hiam.ldap.view.message.error').d('失败')}</Tag>
              )}
            </div>
            <div>
              <Icon
                type={testData.matchAttribute ? 'check_circle' : 'cancel'}
                className={testData.matchAttribute ? styles['success-icon'] : styles['failed-icon']}
              />
              {intl.get('hiam.ldap.view.message.test.user').d('用户属性校验')}：
              {testData.matchAttribute ? (
                <Tag color="green">{intl.get('hiam.ldap.view.message.success').d('成功')}</Tag>
              ) : (
                <Tag color="red">{intl.get('hiam.ldap.view.message.error').d('失败')}</Tag>
              )}
            </div>
            <ul className={styles.info}>
              <li
                style={{ display: ldapData.loginNameField ? 'inline' : 'none' }}
                className={
                  ldapData.loginNameField === testData.loginNameField ? styles['to-red'] : ''
                }
              >
                {intl.get('hiam.ldap.view.message.loginName').d('登录名')}：
                <span>{ldapData.loginNameField}</span>
              </li>
              <li
                style={{ display: ldapData.realNameField && adminStatus ? 'inline' : 'none' }}
                className={
                  ldapData.realNameField === testData.realNameField ? styles['to-red'] : ''
                }
              >
                {intl.get('hiam.ldap.view.message.test.realName').d('用户名')}：
                <span>{ldapData.realNameField}</span>
              </li>
              <li
                style={{ display: ldapData.phoneField && adminStatus ? 'inline' : 'none' }}
                className={ldapData.phoneField === testData.phoneField ? styles['to-red'] : ''}
              >
                {intl.get('hiam.ldap.view.message.test.phone').d('手机号码')}：
                <span>{ldapData.phoneField}</span>
              </li>
              <li
                style={{ display: ldapData.emailField ? 'inline' : 'none' }}
                className={ldapData.emailField === testData.emailField ? styles['to-red'] : ''}
              >
                {intl.get('hiam.ldap.view.message.test.email').d('邮箱地址')}：
                <span>{ldapData.emailField}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // 渲染测试内容
  @Bind()
  renderTestContent() {
    const {
      form: { getFieldDecorator },
      showWhich,
      testLoading,
    } = this.props;
    const { isShowResult } = this.state;
    if (showWhich === 'adminConnect') {
      return testLoading ? this.renderLoading() : this.getTestResult();
    } else {
      return (
        <React.Fragment>
          <Form>
            <FormItem
              label={intl.get('hiam.ldap.model.ldap.ldapAccount').d('LDAP登录名')}
              {...formLayout}
            >
              {getFieldDecorator('ldapName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.ldap.model.ldap.ldapAccount').d('LDAP登录名'),
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
            <FormItem
              label={intl.get('hiam.ldap.model.ldap.ldapPassword').d('LDAP密码')}
              {...formLayout}
            >
              {getFieldDecorator('ldapPwd', {
                // initialValue: ldapData.password,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hiam.ldap.model.ldap.ldapPassword').d('LDAP密码'),
                    }),
                  },
                ],
              })(<Input type="password" />)}
            </FormItem>
          </Form>
          <div style={{ display: isShowResult ? 'block' : 'none' }}>
            {testLoading ? this.renderLoading() : this.getTestResult()}
          </div>
        </React.Fragment>
      );
    }
  }

  // 渲染测试中内容
  @Bind()
  renderLoading() {
    return (
      <div className={styles['loading-container']}>
        <div className={styles['connect-loader']}>
          <Spin size="large" />
        </div>
        <p className={styles['loading-text']}>
          {intl.get('hiam.ldap.view.message.test.loading').d('正在测试中')}
        </p>
      </div>
    );
  }

  render() {
    const { testConnectVisible, testLoading, onCancel } = this.props;
    return (
      <Modal
        destroyOnClose
        maskClosable={false}
        keyboard={false}
        closable={false}
        title={intl.get('hiam.ldap.view.option.testConnect').d('测试连接')}
        width={520}
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        visible={testConnectVisible}
        confirmLoading={testLoading}
        onCancel={onCancel}
        onOk={this.handleOk}
        footer={[
          <Button key="cancel" onClick={onCancel} disabled={testLoading}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>,
          <Button type="primary" key="save" onClick={this.handleOk}>
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>,
        ]}
      >
        {this.renderTestContent()}
      </Modal>
    );
  }
}
