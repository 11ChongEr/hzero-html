/**
 * FilterForm.js
 * @date 2018-12-15
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Button, Col, DatePicker, Form, Icon, Input, Row } from 'hzero-ui';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import cacheComponent from 'components/CacheComponent';
import Checkbox from 'components/Checkbox';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { getDateFormat } from 'utils/utils';

const formCol = { span: 6 };
const formItemLayout = {
  labelCol: {
    span: 10,
  },
  wrapperCol: {
    span: 14,
  },
};
const btnStyle = { marginLeft: 8 };

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hiam/sub-account-site' })
export default class FilterForm extends React.Component {
  static propTypes = {
    onRef: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
  };

  state = {
    advanceForm: false,
  };

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  render() {
    const { advanceForm = false } = this.state;
    if (advanceForm) {
      return this.renderAdvanceForm();
    }
    return this.renderBaseForm();
  }

  renderBaseForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form className="more-fields-form">
        <Row>
          <Col {...formCol}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.loginName').d('账号')}
            >
              {getFieldDecorator('loginName')(<Input />)}
            </Form.Item>
          </Col>
          <Col {...formCol}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.email').d('邮箱')}
            >
              {getFieldDecorator('email')(<Input />)}
            </Form.Item>
          </Col>
          <Col {...formCol}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.phone').d('手机号码')}
            >
              {getFieldDecorator('phone')(<Input />)}
            </Form.Item>
          </Col>
          <Col {...formCol} className="search-btn-more">
            <Form.Item>
              <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button style={btnStyle} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <a style={btnStyle} onClick={this.toggleForm}>
                {intl.get('hzero.common.button.expand').d('展开')}
                <Icon type="down" />
              </a>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  renderAdvanceForm() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { defaultTenant } = this.state;
    return (
      <Form className="more-fields-form">
        <Row>
          <Col {...formCol}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.loginName').d('账号')}
            >
              {getFieldDecorator('loginName')(<Input />)}
            </Form.Item>
          </Col>
          <Col {...formCol}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.email').d('邮箱')}
            >
              {getFieldDecorator('email')(<Input />)}
            </Form.Item>
          </Col>
          <Col {...formCol}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.phone').d('手机号码')}
            >
              {getFieldDecorator('phone')(<Input />)}
            </Form.Item>
          </Col>
          <Col {...formCol} className="search-btn-more">
            <Form.Item>
              <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                {intl.get('hzero.common.button.up').d('收起')} <Icon type="up" />
              </a>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col {...formCol}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.realName').d('名称')}
            >
              {getFieldDecorator('realName')(<Input />)}
            </Form.Item>
          </Col>
          <Col {...formCol}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.tenant').d('所属租户')}
            >
              {getFieldDecorator('organizationId')(<Lov code="HPFM.TENANT" />)}
            </Form.Item>
          </Col>
          <Col {...formCol}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.defaultTenant').d('默认租户')}
            >
              {getFieldDecorator('defaultTenant', {
                initialValue: defaultTenant === undefined ? 0 : 1,
              })(<Checkbox />)}
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col {...formCol}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.startDateActive').d('有效时间从')}
            >
              {getFieldDecorator('startDateActive')(
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateFormat()}
                  disabledDate={currentDate =>
                    getFieldValue('endDateActive') &&
                    moment(getFieldValue('endDateActive')).isBefore(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
          <Col {...formCol}>
            <Form.Item
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.endDateActive').d('有效时间至')}
            >
              {getFieldDecorator('endDateActive')(
                <DatePicker
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateFormat()}
                  disabledDate={currentDate =>
                    getFieldValue('startDateActive') &&
                    moment(getFieldValue('startDateActive')).isAfter(currentDate, 'day')
                  }
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }

  @Bind()
  toggleForm() {
    const { advanceForm = false } = this.state;
    this.setState({
      advanceForm: !advanceForm,
    });
  }

  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    onSearch();
  }
}
