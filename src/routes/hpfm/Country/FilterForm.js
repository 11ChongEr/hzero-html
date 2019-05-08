import React from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class FilterForm extends React.PureComponent {
  constructor(props) {
    super(props);
    // 调用父组件 props onRef 方法
    props.onRef(this);
  }

  /**
   * 查询操作
   */
  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    onSearch(form);
  }

  /**
   * 重置操作
   */
  @Bind()
  handleReset() {
    const { form, onReset } = this.props;
    onReset(form);
  }

  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('hpfm.country.model.country.condition').d('国家代码/国家名称')}>
          {getFieldDecorator('condition')(<Input typeCase="upper" />)}
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
