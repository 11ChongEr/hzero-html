/*
 * FilterForm - 条目配置查询表单
 * @date: 2019/01/28 14:48:29
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';

/**
 * 条目配置查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch // 搜索
 * @reactProps {Function} handleFormReset // 重置表单
 * @return React.element
 */
const { Option } = Select;
const FormItem = Form.Item;
const promptCode = 'hpfm.dashboardClause';
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 查询
   * @param {*} e
   */
  @Bind()
  handleSearch() {
    const { onFilterChange } = this.props;
    if (onFilterChange) {
      onFilterChange();
    }
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
      flags,
    } = this.props;
    return (
      <Form layout="inline">
        <FormItem label={intl.get(`${promptCode}.model.dashboard.clauseCode`).d('条目代码')}>
          {getFieldDecorator('clauseCode')(<Input trim inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get(`${promptCode}.model.dashboard.clauseName`).d('条目名称')}>
          {getFieldDecorator('clauseName')(<Input />)}
        </FormItem>
        {!isTenantRoleLevel() && (
          <FormItem label={intl.get(`${promptCode}.model.dashboard.dataTenantLevel`).d('层级')}>
            {getFieldDecorator('dataTenantLevel')(
              <Select style={{ width: 150 }} allowClear>
                {flags.map(item => (
                  <Option value={item.value} key={item.value}>
                    {item.meaning}
                  </Option>
                ))}
              </Select>
            )}
          </FormItem>
        )}
        <FormItem>
          <Button data-code="search" htmlType="submit" type="primary" onClick={this.handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }
}
