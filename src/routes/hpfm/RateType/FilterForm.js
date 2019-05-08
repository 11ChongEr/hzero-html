import React, { PureComponent } from 'react';
import { Form, Button, Input, Select } from 'hzero-ui';
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
    const { rateMethodList = [] } = this.props;
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('smdm.rateTypeOrg.model.rateType.typeCode').d('类型编码')}>
          {getFieldDecorator('typeCode')(<Input style={{ width: 150 }} />)}
        </FormItem>
        <FormItem label={intl.get('smdm.rateTypeOrg.model.rateType.typeName').d('类型名称')}>
          {getFieldDecorator('typeName')(<Input style={{ width: 150 }} />)}
        </FormItem>
        <FormItem label={intl.get('smdm.rateTypeOrg.model.rateType.rateMethodCode').d('方式')}>
          {getFieldDecorator('rateMethodCode')(
            <Select style={{ width: 150 }} allowClear>
              {rateMethodList.map(m => {
                return (
                  <Select.Option key={m.value} value={m.value}>
                    {m.meaning}
                  </Select.Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem>
          <Button onClick={() => this.handleSearch()} type="primary" htmlType="submit">
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
