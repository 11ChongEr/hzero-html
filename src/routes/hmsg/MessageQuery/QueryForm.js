import React, { PureComponent } from 'react';
import { Form, Button, Select, Input, Row, Col, Icon, DatePicker } from 'hzero-ui';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';

import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';

const FormItem = Form.Item;
const { Option } = Select;

/**
 * 查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onQueryMessage - 查询
 * @reactProps {Function} onStoreFormValues - 存储表单值
 * @reactProps {Object} statusList - 状态
 * @return React.element
 */
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class QueryForm extends PureComponent {
  state = {
    display: true,
  };

  /**
   * 提交查询表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleSearch() {
    const { form, onQueryMessage, onStoreFormValues } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (isEmpty(err)) {
        let values = { ...fieldsValue };
        values = {
          startDate: fieldsValue.startDate ? fieldsValue.startDate.format(DATETIME_MIN) : undefined,
          endDate: fieldsValue.endDate ? fieldsValue.endDate.format(DATETIME_MAX) : undefined,
        };
        onQueryMessage({ ...fieldsValue, ...values });
        onStoreFormValues({ ...fieldsValue, ...values });
      }
    });
  }

  /**
   * 重置表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { statusList, messageTypeList, tenantRoleLevel } = this.props;
    const { display } = this.state;
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('hmsg.messageQuery.model.messageQuery.messageTypeCode')
                      .d('类型')}
                    {...formLayout}
                  >
                    {getFieldDecorator('messageTypeCode')(
                      <Select allowClear>
                        {messageTypeList &&
                          messageTypeList.map(item => (
                            <Option value={item.value} key={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('hmsg.messageQuery.model.messageQuery.trxStatusCode').d('状态')}
                    {...formLayout}
                  >
                    {getFieldDecorator('trxStatusCode')(
                      <Select allowClear>
                        {statusList &&
                          statusList.map(item => (
                            <Option value={item.value} key={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('hmsg.messageQuery.model.messageQuery.subject').d('主题')}
                    {...formLayout}
                  >
                    {getFieldDecorator('subject')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
              <Row style={{ display: display ? 'none' : 'block' }}>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('hmsg.messageQuery.model.messageQuery.serverCode')
                      .d('账号代码')}
                    {...formLayout}
                  >
                    {getFieldDecorator('serverCode')(<Input />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('hmsg.messageQuery.model.messageQuery.receiver').d('接收人')}
                    {...formLayout}
                  >
                    {getFieldDecorator('receiver')(<Input />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('hmsg.messageQuery.model.messageQuery.startDate')
                      .d('发送时间从')}
                    {...formLayout}
                  >
                    {getFieldDecorator('startDate')(
                      <DatePicker
                        placeholder=""
                        format={getDateFormat()}
                        disabledDate={currentDate =>
                          getFieldValue('endDate') &&
                          moment(getFieldValue('endDate')).isBefore(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get('hmsg.messageQuery.model.messageQuery.endDate').d('发送时间至')}
                    {...formLayout}
                  >
                    {getFieldDecorator('endDate')(
                      <DatePicker
                        placeholder=""
                        format={getDateFormat()}
                        disabledDate={currentDate =>
                          getFieldValue('startDate') &&
                          moment(getFieldValue('startDate')).isAfter(currentDate, 'day')
                        }
                      />
                    )}
                  </FormItem>
                </Col>
                {!tenantRoleLevel && (
                  <Col span={8}>
                    <FormItem label={intl.get('entity.tenant.tag').d('租户')} {...formLayout}>
                      {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
                    </FormItem>
                  </Col>
                )}
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
                <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <a
                  style={{ marginLeft: 8, display: display ? 'inline-block' : 'none' }}
                  onClick={this.toggleForm}
                >
                  {intl.get(`hzero.common.button.expand`).d('展开')} <Icon type="down" />
                </a>
                <a
                  style={{ marginLeft: 8, display: display ? 'none' : 'inline-block' }}
                  onClick={this.toggleForm}
                >
                  {intl.get(`hzero.common.button.up`).d('收起')} <Icon type="up" />
                </a>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }
}
