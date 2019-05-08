import React from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
export default class FilterForm extends React.Component {
  constructor(props) {
    super(props);
    // 调用父组件 props onRef 方法
    props.onRef(this);
  }

  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    onSearch(form);
  }

  @Bind()
  handleReset() {
    const { form, onReset } = this.props;
    onReset(form);
  }

  @Bind()
  render() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline">
        <FormItem label="编码">
          {getFieldDecorator('code')(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem label="所属微服务">
          {getFieldDecorator('service')(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem label="描述">{getFieldDecorator('description')(<Input />)}</FormItem>
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
