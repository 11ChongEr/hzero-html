/*
 * Form - 接口表单
 * @date: 2018-10-25
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import {
  Form,
  Input,
  Select,
  Row,
  Col,
  // Icon,
} from 'hzero-ui';
import Switch from 'components/Switch';
import { toSafeInteger } from 'lodash';
import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};

const modelPrompt = 'hitf.services.model.services';
const commonPrompt = 'hzero.common';

@Form.create({ fieldNameProp: null })
export default class EditorForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: props.dataSource,
    };
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
    const { dataSource = {} } = this.state;
    const {
      form: { getFieldDecorator = e => e },
      serviceTypes, // 发布类型
      requestTypes, // 请求方式值集
      soapVersionTypes, // 接口soap版本号
      interfaceStatus, // 接口状态
      contentTypes, // 接口类型
      // editorHeaderForm,
      type,
    } = this.props;

    // const { dirModelVisible, currentParentDir, dirModelDataSource } = this.state;
    const {
      interfaceCode = '',
      publishType,
      mappingClass,
      interfaceName,
      interfaceUrl,
      requestMethod,
      requestHeader = 'application/json',
      status,
      soapVersion,
      publishUrl,
      invokeRecordDetails = 0,
      interfaceId,
    } = dataSource;
    return (
      <Form style={{ paddingBottom: '40px' }}>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl.get(`${modelPrompt}.interfaceCode`).d('接口编码')}
              {...formLayout}
            >
              {getFieldDecorator('interfaceCode', {
                initialValue: interfaceCode,
                rules: [
                  {
                    required: true,
                    message: intl
                      .get(`${commonPrompt}.validation.requireInput`, {
                        name: intl.get(`${modelPrompt}.interfaceCode`).d('接口编码'),
                      })
                      .d(`请输入${intl.get(`${modelPrompt}.interfaceCode`).d('接口编码')}`),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
              })(
                <Input
                  disabled={interfaceId && !dataSource.isNew}
                  typeCase="upper"
                  inputChinese={false}
                />
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl.get(`${modelPrompt}.interfaceName`).d('接口名称')}
              {...formLayout}
            >
              {getFieldDecorator('interfaceName', {
                initialValue: interfaceName,
                rules: [
                  {
                    required: true,
                    message: intl
                      .get(`${commonPrompt}.validation.requireInput`, {
                        name: intl.get(`${modelPrompt}.interfaceName`).d('接口名称'),
                      })
                      .d(`请输入${intl.get(`${modelPrompt}.interfaceName`).d('接口名称')}`),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              label={intl.get(`${modelPrompt}.interfaceAddress`).d('接口地址')}
              {...formLayout}
            >
              {getFieldDecorator('interfaceUrl', {
                initialValue: interfaceUrl,
              })(<Input />)}
            </FormItem>
          </Col>
          {type === 'SOAP' && (
            <Col span={12}>
              <FormItem
                label={intl.get(`${modelPrompt}.soapVersion`).d('SOAP版本')}
                {...formLayout}
              >
                {getFieldDecorator('soapVersion', {
                  initialValue: soapVersion,
                })(
                  <Select>
                    {soapVersionTypes.map(item => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          )}
        </Row>
        {/* 发布类型为REST：显示请求方式、接口ContentType、隐藏soap版本||发布类型为SOAP时相反 */}
        {type === 'REST' && (
          <Row>
            <Col span={12}>
              <FormItem
                label={intl.get(`${modelPrompt}.requestMethod`).d('请求方式')}
                {...formLayout}
              >
                {getFieldDecorator('requestMethod', {
                  initialValue: requestMethod,
                })(
                  <Select>
                    {requestTypes.map(n => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={12}>
              <FormItem
                label={intl.get(`${modelPrompt}.requestHeader`).d('接口ContentType')}
                {...formLayout}
              >
                {getFieldDecorator('requestHeader', {
                  initialValue: requestHeader,
                })(
                  <Select>
                    {contentTypes.map(n => (
                      <Option key={n.value} value={n.value}>
                        {n.meaning}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        <Row>
          <Col span={12}>
            <FormItem label={intl.get(`${modelPrompt}.releaseType`).d('发布类型')} {...formLayout}>
              {getFieldDecorator('publishType', {
                initialValue: publishType,
                rules: [
                  {
                    required: true,
                    message: intl
                      .get(`${commonPrompt}.validation.requireSelect`, {
                        name: intl.get(`${modelPrompt}.releaseType`).d('发布类型'),
                      })
                      .d(`请选择${intl.get(`${modelPrompt}.releaseType`).d('发布类型')}`),
                  },
                ],
              })(
                <Select>
                  {serviceTypes.map(n => (
                    <Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem label={intl.get(`${modelPrompt}.mappingClass`).d('映射类')} {...formLayout}>
              {getFieldDecorator('mappingClass', {
                initialValue: mappingClass,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem label={intl.get(`${commonPrompt}.status`).d('状态')} {...formLayout}>
              {getFieldDecorator('status', {
                initialValue: status,
                rules: [
                  {
                    required: true,
                    message: intl
                      .get(`${commonPrompt}.validation.requireSelect`, {
                        name: intl.get(`${commonPrompt}.status`).d('状态'),
                      })
                      .d(`请选择${intl.get(`${commonPrompt}.status`).d('状态')}`),
                  },
                ],
              })(
                <Select>
                  {interfaceStatus.map(n => (
                    <Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              label={intl.get(`${modelPrompt}.invokeRecordDetails`).d('记录调用详情')}
              {...formLayout}
            >
              {getFieldDecorator('invokeRecordDetails', {
                initialValue: invokeRecordDetails === 1 ? 1 : 0,
              })(<Switch />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <FormItem
              label={intl.get(`${modelPrompt}.publishUrl`).d('发布地址')}
              {...formLayout}
              labelCol={{ span: 3 }}
            >
              {getFieldDecorator('publishUrl', {
                initialValue: publishUrl,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
