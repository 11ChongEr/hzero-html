import React from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
export default class FilterForm extends React.PureComponent {
  @Bind()
  handleSearch() {
    const { form, search } = this.props;
    search(form);
  }

  @Bind()
  handleReset() {
    const { form, reset } = this.props;
    reset(form);
  }

  @Bind()
  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('hsgp.productEnv.model.productEnv.envCode').d('环境编码')}>
          {getFieldDecorator('envCode')(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get('hsgp.productEnv.model.productEnv.envName').d('环境名称')}>
          {getFieldDecorator('envName')(<Input />)}
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
