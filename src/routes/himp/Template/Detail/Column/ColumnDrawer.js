/**
 * Editor - 编辑数据表单
 * @since 2019-1-28
 * @author jiacheng.wang <jiacheng.wang@hand-china.com>
 * @version 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Form, Input, Col, Row, InputNumber, Select, Modal, Spin } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import Switch from 'components/Switch';
import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;
const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

const modelPrompt = 'himp.template.model.template';
const commonPrompt = 'hzero.common';

@Form.create({ fieldNameProp: null })
export default class ColumnDrawer extends React.PureComponent {
  @Bind()
  handleOK() {
    const { form, onOk } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        onOk(fieldsValue);
      }
    });
  }

  render() {
    const {
      form: { getFieldDecorator = e => e },
      initData = {},
      columnTypeCode = [],
      title,
      modalVisible,
      loading,
      onCancel,
      initLoading = false,
    } = this.props;
    const {
      minValue,
      maxValue,
      validateSet,
      columnName,
      columnType,
      length,
      columnIndex,
      columnCode,
      formatMask,
      regularExpression,
      nullableFlag = 1,
      validateFlag = 1,
      enabledFlag = 1,
    } = initData;
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={title}
        width={820}
        visible={modalVisible}
        confirmLoading={loading}
        onCancel={onCancel}
        onOk={this.handleOK}
      >
        <Spin spinning={initLoading}>
          <Form>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${modelPrompt}.columnIndex`).d('列序号')}
                  {...formLayout}
                >
                  {getFieldDecorator('columnIndex', {
                    initialValue: columnIndex,
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get(`${commonPrompt}.validation.requireInput`, {
                            name: intl.get(`${modelPrompt}.columnIndex`).d('列序号'),
                          })
                          .d(`请输入${intl.get(`${modelPrompt}.columnIndex`).d('列序号')}`),
                      },
                    ],
                  })(
                    <InputNumber
                      min={0}
                      style={{ width: '100%' }}
                      disabled={!isUndefined(columnIndex)}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`${modelPrompt}.columnCode`).d('列编码')} {...formLayout}>
                  {getFieldDecorator('columnCode', {
                    initialValue: columnCode,
                    rules: [{ required: true, message: '请输入值' }],
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`${modelPrompt}.columnName`).d('列名')} {...formLayout}>
                  {getFieldDecorator('columnName', {
                    initialValue: columnName,
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get(`${commonPrompt}.validation.requireInput`, {
                            name: intl.get(`${modelPrompt}.columnName`).d('列名'),
                          })
                          .d(`请输入${intl.get(`${modelPrompt}.columnName`).d('列名')}`),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem label={intl.get(`${modelPrompt}.columnType`).d('列类型')} {...formLayout}>
                  {getFieldDecorator('columnType', {
                    initialValue: columnType,
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get(`${commonPrompt}.validation.requireInput`, {
                            name: intl.get(`${modelPrompt}.columnType`).d('列类型'),
                          })
                          .d(`请输入${intl.get(`${modelPrompt}.columnType`).d('列类型')}`),
                      },
                    ],
                  })(
                    <Select>
                      {columnTypeCode.map(n => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${modelPrompt}.formatMask`).d('格式掩码')}
                  {...formLayout}
                >
                  {getFieldDecorator('formatMask', {
                    initialValue: formatMask,
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`${modelPrompt}.length`).d('长度')} {...formLayout}>
                  {getFieldDecorator('length', {
                    initialValue: length,
                  })(<InputNumber min={0} style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem label={intl.get(`${modelPrompt}.minValue`).d('最小值')} {...formLayout}>
                  {getFieldDecorator('minValue', {
                    initialValue: minValue,
                  })(<InputNumber min={0} style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`${modelPrompt}.maxValue`).d('最大值')} {...formLayout}>
                  {getFieldDecorator('maxValue', {
                    initialValue: maxValue,
                  })(<InputNumber min={0} style={{ width: '100%' }} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${modelPrompt}.validateSet`).d('验证值集')}
                  {...formLayout}
                >
                  {getFieldDecorator('validateSet', {
                    initialValue: validateSet,
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${modelPrompt}.regularExpression`).d('正则式')}
                  {...formLayout}
                >
                  {getFieldDecorator('regularExpression', {
                    initialValue: regularExpression,
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get(`${commonPrompt}.status.enable`).d('启用')}
                  {...formLayout}
                >
                  {getFieldDecorator('enabledFlag', {
                    initialValue: enabledFlag,
                  })(<Switch />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`${modelPrompt}.nullable`).d('是否为空')} {...formLayout}>
                  {getFieldDecorator('nullableFlag', {
                    initialValue: nullableFlag,
                  })(<Switch />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label={intl.get(`${modelPrompt}.validate`).d('数据验证')} {...formLayout}>
                  {getFieldDecorator('validateFlag', {
                    initialValue: validateFlag,
                  })(<Switch />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        </Spin>
      </Modal>
    );
  }
}
