import React, { Component, Fragment } from 'react';
import { Form, Button, Input, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

/**
 * 期间定义查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} onSearch - 表单查询
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 查询按钮
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          // 如果验证成功,则执行search
          onSearch();
        }
      });
    }
  }

  /**
   * 重置按钮
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
      <Fragment>
        <Form layout="inline">
          <Form.Item label={intl.get('hpfm.period.model.period.periodSetCode').d('会计期编码')}>
            {getFieldDecorator('periodSetCode')(<Input typeCase="upper" inputChinese={false} />)}
          </Form.Item>
          <Form.Item label={intl.get('hpfm.period.model.period.periodName').d('期间')}>
            {getFieldDecorator('periodName')(<Input />)}
          </Form.Item>
          <Form.Item label={intl.get('hpfm.period.model.period.periodYear').d('年')}>
            {getFieldDecorator('periodYear')(<InputNumber precision={0} />)}
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
      </Fragment>
    );
  }
}
