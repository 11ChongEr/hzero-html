/*
 * FilterForm - 计量单位类型定义查询表单
 * @date: 2018/08/07 14:30:36
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import intl from 'utils/intl';

const promptCode = 'hpfm.uomType';
/**
 * 计量单位查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch // 搜索
 * @reactProps {Function} handleFormReset // 重置表单
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  /**
   * 查询列表
   */
  @Bind()
  handleSearch() {
    const { onFilterChange, form } = this.props;
    if (onFilterChange) {
      form.validateFields(err => {
        if (!err) {
          onFilterChange();
        }
      });
    }
  }

  /**
   * 重置表单数据
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div className="table-list-search">
        <Form layout="inline">
          <Form.Item label={intl.get(`${promptCode}.model.uomType.uomTypeCode`).d('单位类别代码')}>
            {getFieldDecorator('uomTypeCode')(<Input trim typeCase="upper" inputChinese={false} />)}
          </Form.Item>
          <Form.Item label={intl.get(`${promptCode}.model.uomType.uomTypeName`).d('单位类别名称')}>
            {getFieldDecorator('uomTypeName')(<Input />)}
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
      </div>
    );
  }
}
