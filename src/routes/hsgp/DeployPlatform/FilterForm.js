import React from 'react';
import { Form, Button, Input } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
export default class FilterForm extends React.PureComponent {
  /**
   * 查询表单
   */
  @Bind()
  handleSearch() {
    const { form, search } = this.props;
    search(form);
  }

  /**
   * 重置查询表单
   */
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
        <FormItem
          label={intl.get('hsgp.deployPlatform.model.deployPlatform.platformCode').d('平台编码')}
        >
          {getFieldDecorator('platformCode')(<Input typeCase="upper" inputChinese={false} />)}
        </FormItem>
        <FormItem
          label={intl.get('hsgp.deployPlatform.model.deployPlatform.platformName').d('平台名称')}
        >
          {getFieldDecorator('platformName')(<Input />)}
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
