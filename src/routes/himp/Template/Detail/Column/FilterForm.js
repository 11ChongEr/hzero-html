/**
 * FilterForm - 模板头数据表单
 * @since 2019-3-7
 * @author jiacheng.wang <jiacheng.wang@hand-china.com>
 * @version 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const modelPrompt = 'himp.template.model.template';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch = e => e, form } = this.props;
    onSearch(form.getFieldsValue());
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
        <Form.Item label={intl.get(`${modelPrompt}.columnCode`).d('列编码')}>
          {getFieldDecorator('columnCode')(<Input />)}
        </Form.Item>
        <Form.Item label={intl.get(`${modelPrompt}.columnName`).d('列名')}>
          {getFieldDecorator('columnName')(<Input />)}
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
