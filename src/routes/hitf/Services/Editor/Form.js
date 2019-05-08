/*
 * Form - 服务注册编辑弹窗
 * @date: 2018-10-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  // Icon,
} from 'hzero-ui';
import Switch from 'components/Switch';
import { toSafeInteger } from 'lodash';
import Lov from 'components/Lov';
import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const modelPrompt = 'hitf.services.model.services';
const viewButtonPrompt = 'hitf.services.view.button';
const commonPrompt = 'hzero.common';

@Form.create({ fieldNameProp: null })
export default class EditorForm extends PureComponent {
  // constructor(props) {
  //   super(props);
  // }
  state = {};

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  parserSort(value) {
    return toSafeInteger(value);
  }

  handleResetClientKey() {
    const {
      resetClientKey = e => e,
      form: { getFieldsValue },
    } = this.props;
    resetClientKey(getFieldsValue(['clientId', 'clientKey']));
  }

  render() {
    const {
      form: { getFieldDecorator = e => e, getFieldValue },
      editable,
      dataSource = {},
      tenantRoleLevel,
      onTypeChange = e => e,
      changeListTenant,
      openAuthenticationServiceModal = e => e,
      serviceTypes,
      wssPasswordTypes,
    } = this.props;

    // const { dirModelVisible, currentParentDir, dirModelDataSource } = this.state;
    const {
      serverCode,
      tenantId,
      realName,
      serviceType,
      domainUrl,
      serverName,
      soapNamespace,
      soapElementPrefix,
      soapUsername,
      soapPassword,
      enabledFlag,
      soapWssPasswordType,
      interfaceServerId,
    } = dataSource;

    return (
      <Fragment>
        <Form>
          <Row>
            {!tenantRoleLevel && (
              <Col span={12}>
                <FormItem label={intl.get(`${modelPrompt}.tenant`).d('所属租户')} {...formLayout}>
                  {getFieldDecorator('tenantId', {
                    initialValue: tenantId,
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get(`${commonPrompt}.validation.requireSelect`, {
                            name: intl.get(`${modelPrompt}.tenant`).d('所属租户'),
                          })
                          .d(`请选择${intl.get(`${modelPrompt}.tenant`).d('所属租户')}`),
                      },
                    ],
                  })(
                    <Lov
                      textValue={realName || ''}
                      code="HPFM.TENANT"
                      onChange={changeListTenant}
                      disabled={editable}
                    />
                  )}
                </FormItem>
              </Col>
            )}
            <Col span={12}>
              <FormItem label={intl.get(`${modelPrompt}.code`).d('服务代码')} {...formLayout}>
                {getFieldDecorator('serverCode', {
                  initialValue: serverCode,
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get(`${commonPrompt}.validation.requireInput`, {
                          name: intl.get(`${modelPrompt}.code`).d('服务代码'),
                        })
                        .d(`请输入${intl.get(`${modelPrompt}.code`).d('服务代码')}`),
                    },
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                })(<Input disabled={interfaceServerId} typeCase="upper" inputChinese={false} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={intl.get(`${modelPrompt}.name`).d('服务名称')} {...formLayout}>
                {getFieldDecorator('serverName', {
                  initialValue: serverName,
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get(`${commonPrompt}.validation.requireInput`, {
                          name: intl.get(`${modelPrompt}.name`).d('服务名称'),
                        })
                        .d(`请输入${intl.get(`${modelPrompt}.name`).d('服务名称')}`),
                    },
                  ],
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={intl.get(`${modelPrompt}.type`).d('服务类型')} {...formLayout}>
                {getFieldDecorator('serviceType', {
                  initialValue: serviceType,
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get(`${commonPrompt}.validation.requireSelect`, {
                          name: intl.get(`${modelPrompt}.type`).d('服务类型'),
                        })
                        .d(`请选择${intl.get(`${modelPrompt}.type`).d('服务类型')}`),
                    },
                  ],
                })(
                  <Select onChange={onTypeChange}>
                    {serviceTypes.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={intl.get(`${modelPrompt}.address1`).d('服务地址')} {...formLayout}>
                {getFieldDecorator('domainUrl', {
                  initialValue: domainUrl,
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get(`${commonPrompt}.validation.requireInput`, {
                          name: intl.get(`${modelPrompt}.address`).d('服务地址'),
                        })
                        .d(`请输入${intl.get(`${modelPrompt}.address`).d('服务地址')}`),
                    },
                  ],
                })(<Input />)}
              </FormItem>
            </Col>
            {/* 服务类型为SOAP：显示命名空间、参数前缀、加密类型 */}
            {getFieldValue('serviceType') === 'SOAP' && (
              <Fragment>
                <Row>
                  <Col span={12}>
                    <FormItem
                      label={intl.get(`${modelPrompt}.nameSpace`).d('命名空间')}
                      {...formLayout}
                    >
                      {getFieldDecorator('soapNamespace', {
                        initialValue: soapNamespace,
                      })(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      label={intl.get(`${modelPrompt}.paramPrefix`).d('参数前缀')}
                      {...formLayout}
                    >
                      {getFieldDecorator('soapElementPrefix', {
                        initialValue: soapElementPrefix,
                        rules: [
                          {
                            max: 30,
                            message: intl.get('hzero.common.validation.max', {
                              max: 30,
                            }),
                          },
                        ],
                      })(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      label={intl.get(`${modelPrompt}.encryptionType`).d('加密类型')}
                      {...formLayout}
                    >
                      {getFieldDecorator('soapWssPasswordType', {
                        initialValue: soapWssPasswordType,
                      })(
                        <Select>
                          {wssPasswordTypes.map(item => (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Fragment>
            )}
            {/* 加密类型不为None：显示校验用户名、校验密码 */}
            {getFieldValue('soapWssPasswordType') !== 'None' &&
              getFieldValue('serviceType') === 'SOAP' && (
                <Row>
                  <Col span={12}>
                    <FormItem
                      label={intl.get(`${modelPrompt}.userName`).d('校验用户名')}
                      {...formLayout}
                    >
                      {getFieldDecorator('soapUsername', {
                        initialValue: soapUsername,
                      })(<Input />)}
                    </FormItem>
                  </Col>
                  <Col span={12}>
                    <FormItem
                      label={intl.get(`${modelPrompt}.password`).d('校验密码')}
                      {...formLayout}
                    >
                      {getFieldDecorator('soapPassword', {
                        initialValue: soapPassword,
                      })(<Input />)}
                    </FormItem>
                  </Col>
                </Row>
              )}
            <Col span={12}>
              <FormItem>
                <Button onClick={openAuthenticationServiceModal}>
                  {intl.get(`${viewButtonPrompt}.authConfig`).d('服务认证配置')}
                </Button>
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={intl.get(`${commonPrompt}.status`).d('状态')} {...formLayout}>
                {getFieldDecorator('enabledFlag', {
                  initialValue: enabledFlag === 0 ? 0 : 1,
                })(<Switch />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Fragment>
    );
  }
}
