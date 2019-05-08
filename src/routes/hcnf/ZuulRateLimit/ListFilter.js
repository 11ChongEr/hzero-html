/*
 * Zuul限流配置表单
 * @date: 2018/08/07 14:57:58
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input, Col, Row, Icon, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';

/**
 * Zuul限流配置表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @reactProps {Function} toggleForm  展开查询条件
 * @reactProps {Function} renderAdvancedForm 渲染所有查询条件
 * @reactProps {Function} renderSimpleForm 渲染缩略查询条件
 * @return React.element
 */
const modelPrompt = 'hsgp.zuulRateLimit.model.zuulRateLimit';
// const messagePrompt = 'spfm.invitationList.view.message';
const FormItem = Form.Item;
const { Option } = Select;
const refreshStatus = [
  { value: 2, meaning: intl.get(`${modelPrompt}.noRefresh`).d('未刷新') },
  { value: 1, meaning: intl.get(`${modelPrompt}.refreshSuccess`).d('刷新成功') },
  { value: 0, meaning: intl.get(`${modelPrompt}.refreshFailed`).d('刷新失败') },
];
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
// @formatterCollections({ code: 'spfm.invitationList' })
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hsgp/zuul-rate-limits' })
export default class ListFilter extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
    };
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

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
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
  renderForm() {
    const { expandForm } = this.state;
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.rateLimitKey`).d('代码')}
                >
                  {getFieldDecorator('rateLimitKey')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.rateLimitType`).d('限流方式')}
                >
                  {getFieldDecorator('rateLimitType')(
                    <Lov code="HSGP.ZULL.ZULL_LIMIT_TYPE" textField="rateLimitType" />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get(`${modelPrompt}.remark`).d('说明')}>
                  {getFieldDecorator('remark')(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.serviceName`).d('网关服务')}
                >
                  {getFieldDecorator('serviceName')(
                    <Lov code="HPFM.DATASOURCE.SERVICE" textField="serviceName" />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`${modelPrompt}.refreshStatus`).d('刷新状态')}
                >
                  {getFieldDecorator('refreshStatus')(
                    <Select style={{ width: '100%' }} allowClear>
                      {refreshStatus.map(n => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
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
              <a style={{ marginLeft: 8, display: 'inline-block' }} onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.up').d('收起')
                  : intl.get(`hzero.common.button.expand`).d('展开')}
                <Icon type={expandForm ? 'up' : 'down'} />
              </a>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    return <div className="table-list-search">{this.renderForm()}</div>;
  }
}
