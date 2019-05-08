/**
 * FilterForm - 模板头数据表单
 * @since 2019-1-29
 * @author jiacheng.wang <jiacheng.wang@hand-china.com>
 * @version 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

import Lov from 'components/Lov';
import { isTenantRoleLevel } from 'utils/utils';

const modelPrompt = 'himp.template.model.template';

/**
 * 消息模板列表查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} search - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
export default class FilterForm extends PureComponent {
  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { search, form } = this.props;
    if (search) {
      form.validateFields(err => {
        if (!err) {
          // 如果验证成功,则执行search
          search();
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        {!isTenantRoleLevel() && (
          <Form.Item label={intl.get(`${modelPrompt}.tenantName`).d('租户')}>
            {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
          </Form.Item>
        )}
        <Form.Item label={intl.get(`${modelPrompt}.templateName`).d('模板名称')}>
          {getFieldDecorator('templateName', {})(<Input />)}
        </Form.Item>
        <Form.Item label={intl.get(`${modelPrompt}.templateCode`).d('模板代码')}>
          {getFieldDecorator('templateCode', {})(<Input />)}
        </Form.Item>
        <Form.Item>
          <Button data-code="search" type="primary" htmlType="submit" onClick={this.handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </Form.Item>
      </Form>
    );
  }
}
