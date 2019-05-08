import React, { PureComponent } from 'react';
import { Form, Collapse, Input, Button, Radio, Select, Row, Col, Tooltip, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;
const { Panel } = Collapse;
const RadioGroup = Radio.Group;

const customPanelStyle = {
  background: '#f7f7f7',
  borderRadius: 4,
  marginBottom: 24,
  border: 0,
  overflow: 'hidden',
};
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
/**
 * 新建或编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleAdd - 添加确定的回调函数
 * @reactProps {Function} handleEdit - 编辑确定的回调函数
 * @reactProps {Object} tableRecord - 表格中信息的一条记录
 * @reactProps {Boolean} isCreate - 是否为新建账户
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class LDAPForm extends PureComponent {
  /* ssl修改状态默认端口号更改 */
  @Bind()
  handleSSLChange() {
    const { setFieldsValue, getFieldValue } = this.props.form;
    setFieldsValue({
      port: getFieldValue('useSSL') === 'Y' ? '389' : '636',
    });
  }

  // 保存并测试
  @Bind()
  handleSave() {
    const { form, onSaveAndTest } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        onSaveAndTest(values);
      }
    });
  }

  // 取消
  @Bind()
  handleCancel() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { ldapData, updateLoading, directoryTypeList = [] } = this.props;
    const {
      form: { getFieldDecorator },
    } = this.props;

    return (
      <Form>
        <Collapse bordered={false} defaultActiveKey={['service', 'userInfo']}>
          <Panel
            header={intl.get('hiam.ldap.view.message.serviceSet').d('服务器设置')}
            key="service"
            style={customPanelStyle}
          >
            <Row>
              <Col span={10}>
                <FormItem
                  label={intl.get('hiam.ldap.model.ldap.directoryType').d('目录类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('directoryType', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hiam.ldap.model.ldap.directoryType').d('目录类型'),
                        }),
                      },
                    ],
                    initialValue: ldapData.directoryType,
                  })(
                    <Select onChange={this.changeDataSourceType}>
                      {directoryTypeList.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem
                  // label={intl.get('hiam.ldap.model.ldap.serverAddress').d('主机名')}
                  label={
                    <span>
                      {intl.get('hiam.ldap.model.ldap.serverAddress').d('主机名')}&nbsp;
                      <Tooltip
                        title={intl
                          .get('hiam.ldap.view.message.serverAddress.help.msg')
                          .d('运行 LDAP 的服务器主机名。例如：ldap://example.com')}
                      >
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                  {...formLayout}
                >
                  {getFieldDecorator('serverAddress', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hiam.ldap.model.ldap.serverAddress').d('主机名'),
                        }),
                      },
                    ],
                    initialValue: ldapData.serverAddress,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem
                  {...formLayout}
                  // label={intl.get('hiam.ldap.model.ldap.useSSL').d('是否使用SSL')}
                  label={
                    <span>
                      {intl.get('hiam.ldap.model.ldap.useSSL').d('是否使用SSL')}&nbsp;
                      <Tooltip
                        title={intl
                          .get('hiam.ldap.view.message.useSSL.help.msg')
                          .d('是否使用SSL会对端口号有影响')}
                      >
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                >
                  {getFieldDecorator('useSSL', {
                    initialValue: ldapData.useSSL ? 'Y' : 'N', // isUndefined(ldapData.useSSL)?'false': ldapData.useSSL,
                  })(
                    <RadioGroup onChange={this.handleSSLChange}>
                      <Radio value="Y">{intl.get('hzero.common.status.yes').d('是')}</Radio>
                      <Radio value="N">{intl.get('hzero.common.status.no').d('否')}</Radio>
                    </RadioGroup>
                  )}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem label={intl.get('hiam.ldap.model.ldap.port').d('端口号')} {...formLayout}>
                  {getFieldDecorator('port', {
                    initialValue: ldapData.port || (ldapData.useSSL ? '636' : '389'),
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem
                  // label={intl.get('hiam.ldap.model.ldap.baseDn').d('基准DN')}
                  label={
                    <span>
                      {intl.get('hiam.ldap.model.ldap.baseDn').d('基准DN')}&nbsp;
                      <Tooltip
                        title={intl
                          .get('hiam.ldap.view.message.baseDn.help.msg')
                          .d(
                            'LDAP目录树的最顶部的根，从根节点搜索用户。例如：cn=users,dc=example,dc=com'
                          )}
                      >
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                  {...formLayout}
                >
                  {getFieldDecorator('baseDn', {
                    initialValue: ldapData.baseDn,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem
                  label={intl.get('hiam.ldap.model.ldap.account').d('管理员登录名')}
                  {...formLayout}
                >
                  {getFieldDecorator('account', {
                    initialValue: ldapData.account,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem
                  label={intl.get('hiam.ldap.model.ldap.password').d('管理员密码')}
                  {...formLayout}
                >
                  {getFieldDecorator('password', {
                    initialValue: ldapData.password,
                  })(<Input type="password" />)}
                </FormItem>
              </Col>
            </Row>
          </Panel>
          <Panel
            header={intl.get('hiam.ldap.view.message.userInfoSet').d('用户属性设置')}
            key="userInfo"
            style={customPanelStyle}
          >
            <Row>
              <Col span={10}>
                <FormItem
                  label={intl.get('hiam.ldap.model.ldap.objectClass').d('用户对象类')}
                  {...formLayout}
                >
                  {getFieldDecorator('objectClass', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hiam.ldap.model.ldap.objectClass').d('用户对象类'),
                        }),
                      },
                    ],
                    initialValue: ldapData.objectClass,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem
                  label={intl.get('hiam.ldap.model.ldap.loginNameField').d('登录名属性')}
                  {...formLayout}
                >
                  {getFieldDecorator('loginNameField', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hiam.ldap.model.ldap.loginNameField').d('登录名属性'),
                        }),
                      },
                    ],
                    initialValue: ldapData.loginNameField,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem
                  label={intl.get('hiam.ldap.model.ldap.emailField').d('邮箱属性')}
                  {...formLayout}
                >
                  {getFieldDecorator('emailField', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hiam.ldap.model.ldap.emailField').d('邮箱属性'),
                        }),
                      },
                    ],
                    initialValue: ldapData.emailField,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem
                  // label={intl.get('hiam.ldap.model.ldap.realNameField').d('用户名属性')}
                  label={
                    <span>
                      {intl.get('hiam.ldap.model.ldap.realNameField').d('用户名属性')}&nbsp;
                      <Tooltip
                        title={intl
                          .get('hiam.ldap.view.message.realNameField.help.msg')
                          .d('为空时系统将默认获取登录名的值')}
                      >
                        <Icon type="question-circle-o" />
                      </Tooltip>
                    </span>
                  }
                  {...formLayout}
                >
                  {getFieldDecorator('realNameField', {
                    initialValue: ldapData.realNameField,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={10}>
                <FormItem
                  label={intl.get('hiam.ldap.model.ldap.phoneField').d('手机号属性')}
                  {...formLayout}
                >
                  {getFieldDecorator('phoneField', {
                    initialValue: ldapData.phoneField,
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
          </Panel>
        </Collapse>
        <div style={{ marginTop: 20 }}>
          <Button
            type="primary"
            onClick={this.handleSave}
            loading={updateLoading}
            style={{ marginRight: 12 }}
          >
            {intl.get('hiam.ldap.button.saveAndTest').d('保存并测试')}
          </Button>
          <Button onClick={this.handleCancel}>
            {intl.get('hzero.common.button.cancel').d('取消')}
          </Button>
        </div>
      </Form>
    );
  }
}
