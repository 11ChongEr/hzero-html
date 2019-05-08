import React, { PureComponent } from 'react';
import { Form, Button, Input, Select } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import cacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';

const FormItem = Form.Item;
const { Option } = Select;
/**
 * 查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Function} onStore - 存储表单值
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hrpt/template-manage' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  // 提交查询表单
  @Bind()
  handleFormSearch() {
    const { form, onSearch } = this.props;
    form.validateFields(err => {
      if (isEmpty(err)) {
        onSearch();
      }
    });
  }

  // 重置表单
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
      templateTypeCode = [],
    } = this.props;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('entity.template.code').d('模板代码')}>
          {getFieldDecorator('templateCode')(<Input typeCase="upper" trim inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get('entity.template.name').d('模板名称')}>
          {getFieldDecorator('templateName')(<Input />)}
        </FormItem>
        <FormItem label={intl.get('entity.template.type').d('模板类型')}>
          {getFieldDecorator('templateTypeCode')(
            <Select allowClear style={{ width: '170px' }}>
              {templateTypeCode &&
                templateTypeCode.map(item => (
                  <Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Option>
                ))}
            </Select>
          )}
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
    );
  }
}
