import React, { PureComponent } from 'react';
import { Form, Button, Input } from 'hzero-ui';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 列表查询表单查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          onSearch();
        }
      });
    }
  }

  /**
   * 采购员列表查询表单重置
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem
          label={intl.get('hpfm.operationUnit.model.operationUnit.ouCode').d('业务实体编码')}
        >
          {getFieldDecorator('ouCode', {
            initialValue: '',
          })(<Input trim typeCase="upper" inputChinese={false} style={{ width: 150 }} />)}
        </FormItem>
        <FormItem
          label={intl.get('hpfm.operationUnit.model.operationUnit.ouName').d('业务实体名称')}
        >
          {getFieldDecorator('ouName', {
            initialValue: '',
          })(<Input style={{ width: 150 }} />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
