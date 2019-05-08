import React, { PureComponent } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

const FormItem = Form.Item;

/**
 * 单据权限查询表单
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
        <FormItem label={intl.get('hiam.docType.model.docType.docTypeName').d('类型名称')}>
          {getFieldDecorator('docTypeName')(<Input style={{ width: 150 }} />)}
        </FormItem>
        <FormItem>
          <Button
            type="primary"
            htmlType="submit"
            onClick={() => this.handleSearch()}
            style={{ marginRight: 10 }}
          >
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
