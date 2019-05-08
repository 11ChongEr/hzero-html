import React from 'react';
import { Form, Button, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

const { Option } = Select;
const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
export default class TaskFilter extends React.Component {
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
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  render() {
    const { form, statusList } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline">
        <FormItem label="状态">
          {getFieldDecorator('status')(
            <Select style={{ width: 200 }} allowClear>
              {statusList.map(item => {
                return (
                  <Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Option>
                );
              })}
            </Select>
          )}
        </FormItem>
        <FormItem label="任务编码">
          {getFieldDecorator('taskInstanceCode')(<Input inputChinese={false} />)}
        </FormItem>
        <FormItem label="所属事务实例">
          {getFieldDecorator('sagaInstanceCode')(<Input inputChinese={false} />)}
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
