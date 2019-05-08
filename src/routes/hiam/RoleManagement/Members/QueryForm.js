import React, { PureComponent } from 'react';
import { Form, Input, Button } from 'hzero-ui';
import intl from 'utils/intl';

const FormItem = Form.Item;

const modelPrompt = 'hiam.roleManagement.model.roleManagement';
const commonPrompt = 'hzero.common';

@Form.create({ fieldNameProp: null })
export default class QueryForm extends PureComponent {
  onClick() {
    const {
      handleFetchData = e => e,
      form: { getFieldsValue = e => e },
    } = this.props;
    const data = getFieldsValue() || {};
    handleFetchData({
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
      disabled,
    } = this.props;
    return (
      <Form layout="inline">
        <FormItem label={intl.get(`${modelPrompt}.userLoginName`).d('用户名')}>
          {getFieldDecorator('userRealName')(<Input />)}
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            onClick={this.onClick.bind(this)}
            style={{ marginRight: 8 }}
            disabled={disabled}
          >
            {intl.get(`${commonPrompt}.button.search`).d('查询')}
          </Button>
          <Button onClick={this.onReset.bind(this)}>
            {intl.get(`${commonPrompt}.button.reset`).d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
