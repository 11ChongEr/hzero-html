import React, { PureComponent } from 'react';
import { Form, Button, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

/**
 * 请求定义查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
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
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline">
        <Form.Item label={intl.get('hsdr.jobGroup.model.jobGroup.executorCode').d('执行器编码')}>
          {getFieldDecorator('executorCode')(<Input trim inputChinese={false} />)}
        </Form.Item>
        <Form.Item label={intl.get('hsdr.jobGroup.model.jobGroup.executorName').d('执行器名称')}>
          {getFieldDecorator('executorName')(<Input />)}
        </Form.Item>
        <Form.Item label={intl.get('hsdr.jobGroup.view.message.addressType').d('注册方式')}>
          {getFieldDecorator('executorType')(
            <Select style={{ width: 150 }} allowClear>
              <Select.Option value={0}>
                {intl.get('hsdr.jobGroup.view.message.auto').d('自动注册')}
              </Select.Option>
              <Select.Option value={1}>
                {intl.get('hsdr.jobGroup.view.message.byHand').d('手动录入')}
              </Select.Option>
            </Select>
          )}
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
    );
  }
}
