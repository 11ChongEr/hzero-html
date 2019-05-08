import React, { PureComponent } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const FormItem = Form.Item;

/**
 * 查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Function} onStore - 存储表单值
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class QueryForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  // 提交查询表单
  @Bind()
  handleFormSearch() {
    const { form, onSearch, onStore } = this.props;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        onSearch();
        onStore(values);
      }
    });
  }

  // 重置表单
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    return (
      <React.Fragment>
        <Form layout="inline">
          <FormItem label={intl.get('hwfl.categories.model.categories.code').d('流程分类编码')}>
            {getFieldDecorator('code')(<Input typeCase="upper" trim inputChinese={false} />)}
          </FormItem>
          <FormItem
            label={intl.get('hwfl.categories.model.categories.description').d('流程分类描述')}
          >
            {getFieldDecorator('description')(<Input />)}
          </FormItem>
          <FormItem>
            <Button
              htmlType="submit"
              type="primary"
              style={{ marginRight: 8 }}
              onClick={this.handleFormSearch}
            >
              {intl.get('hzero.common.status.search').d('查询')}
            </Button>
            <Button onClick={this.handleFormReset}>
              {intl.get('hzero.common.status.reset').d('重置')}
            </Button>
          </FormItem>
        </Form>
      </React.Fragment>
    );
  }
}
