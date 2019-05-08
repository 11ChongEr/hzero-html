/**
 * List  - 应用管理 - 查询
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button } from 'hzero-ui';
import intl from 'utils/intl';
import Lov from 'components/Lov';

const FormItem = Form.Item;

const modelPrompt = 'hitf.application.model.application';
const commonPrompt = 'hzero.common';

@Form.create({ fieldNameProp: null })
export default class Search extends PureComponent {
  onClick() {
    const {
      fetchList = e => e,
      form: { getFieldsValue = e => e },
      pagination = { pageSize: 10, current: 1 },
    } = this.props;
    const data = getFieldsValue() || {};
    fetchList({
      ...data,
      size: pagination.pageSize,
      page: pagination.current - 1,
    });
  }

  onReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  render() {
    const { form = {}, tenantRoleLevel } = this.props;
    const { getFieldDecorator = e => e } = form;
    return (
      <Form layout="inline">
        {!tenantRoleLevel && (
          <FormItem label={intl.get(`${modelPrompt}.tenant`).d('所属租户')}>
            {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
          </FormItem>
        )}
        <FormItem label={intl.get(`${modelPrompt}.code`).d('应用代码')}>
          {getFieldDecorator('applicationCode')(<Input typeCase="upper" inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get(`${modelPrompt}.name`).d('应用名称')}>
          {getFieldDecorator('applicationName')(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.onClick.bind(this)}>
            {intl.get(`${commonPrompt}.button.search`).d('查询')}
          </Button>
        </FormItem>
        <FormItem>
          <Button onClick={this.onReset.bind(this)}>
            {intl.get(`${commonPrompt}.button.reset`).d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
