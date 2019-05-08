import React, { PureComponent } from 'react';
import { Form, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

import Switch from 'components/Switch';

const formLayOut = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const { Option } = Select;

const promptCode = 'hpfm.dashboardClause';

/**
 * 条目配置详情表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class DetailForm extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {};
  }

  @Bind()
  handleChangeIdType(formObj) {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue(formObj);
  }

  render() {
    const { form, headInfo = {}, flags, isEdit } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formLayOut}
              label={intl.get(`${promptCode}.model.dashboard.clauseCode`).d('条目代码')}
            >
              {getFieldDecorator('clauseCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.dashboard.clauseCode`).d('条目代码'),
                    }),
                  },
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
                initialValue: headInfo.clauseCode,
              })(<Input disabled={isEdit} typeCase="upper" inputChinese={false} />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formLayOut}
              label={intl.get(`${promptCode}.model.dashboard.clauseName`).d('条目名称')}
            >
              {getFieldDecorator('clauseName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.dashboard.clauseName`).d('条目名称'),
                    }),
                  },
                  {
                    max: 60,
                    message: intl.get('hzero.common.validation.max', {
                      max: 60,
                    }),
                  },
                ],
                initialValue: headInfo.clauseName,
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formLayOut}
              label={intl.get(`${promptCode}.model.dashboard.menuCode`).d('功能代码')}
            >
              {getFieldDecorator('menuCode', {
                rules: [
                  {
                    max: 128,
                    message: intl.get('hzero.common.validation.max', {
                      max: 128,
                    }),
                  },
                ],
                initialValue: headInfo.menuCode,
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={8}>
            <Form.Item
              {...formLayOut}
              label={intl.get(`${promptCode}.model.dashboard.route`).d('路由')}
            >
              {getFieldDecorator('route', {
                rules: [
                  {
                    max: 128,
                    message: intl.get('hzero.common.validation.max', {
                      max: 128,
                    }),
                  },
                ],
                initialValue: headInfo.route,
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formLayOut}
              label={intl.get(`${promptCode}.model.dashboard.statsExpression`).d('数据匹配表达式')}
            >
              {getFieldDecorator('statsExpression', {
                rules: [
                  {
                    max: 360,
                    message: intl.get('hzero.common.validation.max', {
                      max: 360,
                    }),
                  },
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`${promptCode}.model.dashboard.statsExpression`)
                        .d('数据匹配表达式'),
                    }),
                  },
                ],
                initialValue: headInfo.statsExpression,
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formLayOut}
              label={intl
                .get(`${promptCode}.model.dashboard.docRemarkExpression`)
                .d('单据标题表达式')}
            >
              {getFieldDecorator('docRemarkExpression', {
                rules: [
                  {
                    max: 360,
                    message: intl.get('hzero.common.validation.max', {
                      max: 360,
                    }),
                  },
                ],
                initialValue: headInfo.docRemarkExpression,
              })(<Input />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          {!isTenantRoleLevel() && (
            <Col span={8}>
              <Form.Item
                {...formLayOut}
                label={intl.get(`${promptCode}.model.dashboard.dataTenantLevel`).d('层级')}
              >
                {getFieldDecorator('dataTenantLevel', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get(`${promptCode}.model.dashboard.dataTenantLevel`).d('层级'),
                      }),
                    },
                  ],
                  initialValue: headInfo.dataTenantLevel,
                })(
                  <Select>
                    {flags.map(item => (
                      <Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                    {/* HPFM.DATA_TENANT_LEVEL */}
                  </Select>
                )}
              </Form.Item>
            </Col>
          )}
          <Col span={8}>
            <Form.Item
              {...formLayOut}
              label={intl.get(`${promptCode}.model.dashboard.remark`).d('备注')}
            >
              {getFieldDecorator('remark', {
                initialValue: headInfo.remark,
              })(<Input />)}
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              {...formLayOut}
              label={intl.get(`${promptCode}.model.dashboard.enabledFlag`).d('状态')}
            >
              {getFieldDecorator('enabledFlag', {
                initialValue: headInfo.enabledFlag === 0 ? 0 : 1,
              })(<Switch />)}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
