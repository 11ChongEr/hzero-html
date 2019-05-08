import React, { Component, Fragment } from 'react';
import { Form, Col, Row, Input, Select } from 'hzero-ui';

import Switch from 'components/Switch';

import { EMAIL, PHONE } from 'utils/regExp';
import intl from 'utils/intl';

import styles from './index.less';

/**
 * 员工基本信息表单
 * @extends {Component} - React.Component
 * @reactProps {!Object} employeeInfo - 数据源
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class DataForm extends Component {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { employeeInfo = {}, employeeStatus = [] } = this.props;
    const { getFieldDecorator } = this.props.form;
    const formLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    return (
      <Fragment>
        <Form style={{ maxWidth: 1000 }}>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label={intl.get('entity.employee.code').d('员工编码')} {...formLayout}>
                {getFieldDecorator('employeeNum', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('entity.employee.code').d('员工编码'),
                      }),
                    },
                  ],
                  initialValue: employeeInfo.employeeNum,
                })(<Input disabled />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={intl.get('entity.employee.name').d('员工姓名')} {...formLayout}>
                {getFieldDecorator('name', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('entity.employee.name').d('员工姓名'),
                      }),
                    },
                    {
                      max: 60,
                      message: intl.get('hzero.common.validation.max', {
                        max: 60,
                      }),
                    },
                  ],
                  initialValue: employeeInfo.name,
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('hpfm.employee.model.employee.phoneticize').d('拼音')}
                {...formLayout}
              >
                {getFieldDecorator('phoneticize', {
                  initialValue: employeeInfo.phoneticize,
                  rules: [
                    {
                      max: 60,
                      message: intl.get('hzero.common.validation.max', {
                        max: 60,
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item
                label={intl.get('hpfm.employee.model.employee.quickIndex').d('快速索引')}
                {...formLayout}
              >
                {getFieldDecorator('quickIndex', {
                  initialValue: employeeInfo.quickIndex,
                  rules: [
                    {
                      max: 30,
                      message: intl.get('hzero.common.validation.max', {
                        max: 30,
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={intl.get('hpfm.employee.model.employee.status').d('员工状态')}
                {...formLayout}
              >
                {getFieldDecorator('status', {
                  initialValue: employeeInfo.status,
                })(
                  <Select className={styles['full-width']} allowClear>
                    {employeeStatus.map(item => {
                      return (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      );
                    })}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
                {getFieldDecorator('enabledFlag', {
                  initialValue: employeeInfo.enabledFlag,
                })(<Switch />)}
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={8}>
              <Form.Item label={intl.get('hzero.common.email').d('邮箱')} {...formLayout}>
                {getFieldDecorator('email', {
                  initialValue: employeeInfo.email,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hzero.common.email').d('邮箱'),
                      }),
                    },
                    {
                      pattern: EMAIL,
                      message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                    },
                    {
                      max: 60,
                      message: intl.get('hzero.common.validation.max', {
                        max: 60,
                      }),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label={intl.get('hzero.common.cellphone').d('手机号')} {...formLayout}>
                {getFieldDecorator('mobile', {
                  initialValue: employeeInfo.mobile,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hzero.common.cellphone').d('手机号'),
                      }),
                    },
                    {
                      pattern: PHONE,
                      message: intl.get('hzero.common.validation.phone').d('手机号码格式不正确'),
                    },
                  ],
                })(<Input />)}
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Fragment>
    );
  }
}
