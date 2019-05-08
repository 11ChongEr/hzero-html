import React, { PureComponent } from 'react';
import { Button, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  /**
   * handleSearchOrg - 搜索采购组织
   * @param {object} e - 事件对象
   */
  @Bind()
  handleSearchOrg(e) {
    e.preventDefault();
    const { form } = this.props;
    this.props.onSearch(form.getFieldsValue());
  }

  /**
   * handleResetSearch - 重置搜索表单
   * @param {object} e - 事件对象
   */
  @Bind()
  handleResetSearch() {
    const { form } = this.props;
    this.props.onReset(form);
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('hpfm.purchaseOrg.model.org.organizationCode').d('采购组织编码')}>
          {getFieldDecorator('organizationCode')(
            <Input trim typeCase="upper" inputChinese={false} style={{ width: 150 }} />
          )}
        </FormItem>
        <FormItem label={intl.get('hpfm.purchaseOrg.model.org.organizationName').d('采购组织名称')}>
          {getFieldDecorator('organizationName')(<Input style={{ width: 150 }} />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.handleSearchOrg}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleResetSearch}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
