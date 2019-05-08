import React, { PureComponent } from 'react';
import { Form, Button, Input, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const FormItem = Form.Item;

/**
 * 汇率类型
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('hpfm.taxRate.model.taxRate.taxCode').d('税种代码')}>
          {getFieldDecorator('taxCode')(<Input trim typeCase="upper" inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get('hpfm.taxRate.model.taxRate.description').d('税率描述')}>
          {getFieldDecorator('description')(<Input />)}
        </FormItem>
        <FormItem label={`${intl.get('hpfm.taxRate.model.taxRate.taxRate').d('税率')}（%）`}>
          {getFieldDecorator('taxRate')(<InputNumber precision={2} max={100} min={0} />)}
        </FormItem>
        <FormItem>
          <Button type="primary" onClick={() => this.handleSearch()} htmlType="submit">
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
