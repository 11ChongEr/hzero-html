import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';
import { toSafeInteger, isUndefined } from 'lodash';
import Lov from 'components/Lov';
import intl from 'utils/intl';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const modelPrompt = 'hitf.application.model.application';
const commonPrompt = 'hzero.common';

@Form.create({ fieldNameProp: null })
export default class EditorForm extends PureComponent {
  state = {};

  parserSort(value) {
    return toSafeInteger(value);
  }

  render() {
    const {
      form: { getFieldDecorator = e => e, getFieldValue = e => e, setFieldsValue = e => e },
      editable,
      dataSource = {},
      setTenantId = e => e,
      tenantRoleLevel,
    } = this.props;

    const {
      applicationCode = '',
      tenantId,
      tenantName,
      oauthClientId,
      clientName,
      applicationName,
    } = dataSource;

    return (
      <Fragment>
        <Form>
          <Row type="flex">
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
                      disabled={editable}
                      textValue={tenantName}
                      code="HPFM.TENANT"
                      onOk={setTenantId}
                      allowClear={false}
                      onChange={() => setFieldsValue({ oauthClientId: undefined })}
                    />
                  )}
                </FormItem>
              </Col>
            )}
            <Col span={12}>
              <FormItem label={intl.get(`${modelPrompt}.code`).d('应用代码')} {...formLayout}>
                {getFieldDecorator('applicationCode', {
                  initialValue: applicationCode,
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get(`${commonPrompt}.validation.requireInput`, {
                          name: intl.get(`${modelPrompt}.code`).d('应用代码'),
                        })
                        .d(`请输入${intl.get(`${modelPrompt}.code`).d('应用代码')}`),
                    },
                  ],
                })(<Input disabled={editable} typeCase="upper" inputChinese={false} />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={intl.get(`${modelPrompt}.name`).d('应用名称')} {...formLayout}>
                {getFieldDecorator('applicationName', {
                  initialValue: applicationName,
                  rules: [
                    {
                      required: true,
                      message: intl
                        .get(`${commonPrompt}.validation.requireInput`, {
                          name: intl.get(`${modelPrompt}.name`).d('应用名称'),
                        })
                        .d(`请输入${intl.get(`${modelPrompt}.name`).d('应用名称')}`),
                    },
                  ],
                })(<Input />)}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem label={intl.get(`${modelPrompt}.client`).d('客户端')} {...formLayout}>
                {getFieldDecorator('oauthClientId', {
                  initialValue: oauthClientId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${modelPrompt}.client`).d('客户端'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    textValue={clientName}
                    code="HITF.APPLICATION.CLIENT"
                    queryParams={{
                      tenantId: !tenantRoleLevel ? getFieldValue('tenantId') : tenantId,
                    }}
                    disabled={!tenantRoleLevel ? isUndefined(getFieldValue('tenantId')) : false}
                    allowClear={false}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </Fragment>
    );
  }
}
