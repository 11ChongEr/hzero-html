import React, { PureComponent } from 'react';
import { Form, Input, Button } from 'hzero-ui';
import intl from 'utils/intl';

const FormItem = Form.Item;

const modelPrompt = 'hiam.menuConfig.model.menuConfig';
const commonPrompt = 'hzero.common';

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
        <FormItem label={intl.get(`${modelPrompt}.permissionCode`).d('权限编码')}>
          {getFieldDecorator('code')(<Input />)}
        </FormItem>
        <FormItem label={intl.get(`${modelPrompt}.permissionName`).d('权限名称')}>
          {getFieldDecorator('name')(<Input />)}
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
