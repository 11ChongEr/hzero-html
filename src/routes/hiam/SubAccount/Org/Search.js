/*
 * Search - 租户级子账户查询表单
 * @date: 2018/11/19 20:03:51
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Form, Button, Input, Col, Row } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';

/**
 * 租户级子账户查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @reactProps {Function} renderAdvancedForm 渲染所有查询条件
 * @reactProps {Function} renderSimpleForm 渲染缩略查询条件
 * @return React.element
 */
const FormItem = Form.Item;
const formCol = { span: 6 };
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
// @formatterCollections({ code: 'spfm.invitationList' })
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hiam/sub-account-org/list' })
export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onFilterChange } = this.props;
    if (onFilterChange) {
      onFilterChange();
    }
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 渲染查询条件
   * @returns React.component
   */
  @Bind()
  renderSearchForm() {
    const { form } = this.props;
    return (
      <Form className="more-fields-form" layout="inline">
        <Row>
          <Col {...formCol}>
            <FormItem
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.loginName').d('账号')}
            >
              {form.getFieldDecorator('loginName')(<Input />)}
            </FormItem>
          </Col>
          <Col {...formCol}>
            <FormItem
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.email').d('邮箱')}
            >
              {form.getFieldDecorator('email')(<Input />)}
            </FormItem>
          </Col>
          <Col {...formCol}>
            <FormItem
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.phone').d('手机号码')}
            >
              {form.getFieldDecorator('phone')(<Input />)}
            </FormItem>
          </Col>
          <Col {...formCol} className="search-btn-more">
            <FormItem>
              <Button
                style={{ marginRight: 8 }}
                htmlType="submit"
                type="primary"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col {...formCol}>
            <FormItem
              {...formItemLayout}
              label={intl.get('hiam.subAccount.model.user.realName').d('名称')}
            >
              {form.getFieldDecorator('realName')(<Input />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    return <div className="table-list-search">{this.renderSearchForm()}</div>;
  }
}
