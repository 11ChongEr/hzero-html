import React, { PureComponent } from 'react';
import { Form, Input, Button } from 'hzero-ui';

import Lov from 'components/Lov';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class QueryForm extends PureComponent {
  onClick() {
    const {
      handleQueryList = e => e,
      form: { getFieldsValue = e => e },
    } = this.props;
    const data = getFieldsValue() || {};
    handleQueryList({
      ...data,
    });
  }

  onReset() {
    const {
      form: { resetFields = e => e },
    } = this.props;
    resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator = e => e },
    } = this.props;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('hpfm.permission.model.permission.tableName').d('屏蔽表名')}>
          {getFieldDecorator('tableName')(<Input />)}
        </FormItem>
        {!isTenantRoleLevel() && (
          <FormItem label={intl.get('hpfm.permission.model.permission.tenant').d('租户')}>
            {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
          </FormItem>
        )}
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.onClick.bind(this)}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
        </FormItem>
        <FormItem>
          <Button onClick={this.onReset.bind(this)}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
