/*
 * DetailFilter - Zuul限流配置表单
 * @date: 2018/08/07 14:57:58
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import OptionInput from 'components/OptionInput';
import intl from 'utils/intl';

/**
 * Zuul限流配置表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch  搜索
 * @reactProps {Function} handleFormReset  重置表单
 * @reactProps {Function} toggleForm  展开查询条件
 * @reactProps {Function} renderAdvancedForm 渲染所有查询条件
 * @reactProps {Function} renderSimpleForm 渲染缩略查询条件
 * @return React.element
 */
const modelPrompt = 'hsgp.zuulRateLimit.model.zuulRateLimit';
const FormItem = Form.Item;
const formItemLayout = {
  wrapperCol: { span: 24 },
  style: { width: '250px', marginRight: '0' },
};
@Form.create({ fieldNameProp: null })
export default class DetailFilter extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 查询
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

  /**
   * 渲染查询条件
   * @returns React.component
   */
  @Bind()
  renderForm() {
    const {
      form: { getFieldDecorator },
      showAddModal,
      handleDelete,
    } = this.props;
    const queryArray = [
      {
        queryLabel: intl.get(`${modelPrompt}.user`).d('用户维度'),
        queryName: 'user',
      },
      {
        queryLabel: intl.get(`${modelPrompt}.tenant`).d('租户维度'),
        queryName: 'tenant',
      },
      {
        queryLabel: intl.get(`${modelPrompt}.origin`).d('源请求地址维度'),
        queryName: 'origin',
      },
      {
        queryLabel: intl.get(`${modelPrompt}.url`).d('URL维度'),
        queryName: 'url',
      },
    ];
    return (
      <Form layout="inline">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Button icon="plus" onClick={showAddModal} />
            <Button icon="minus" onClick={handleDelete} style={{ marginLeft: '10px' }} />
          </div>
          <div>
            <FormItem {...formItemLayout}>
              {getFieldDecorator('option')(<OptionInput queryArray={queryArray} />)}
            </FormItem>
            <FormItem style={{ marginRight: '0' }}>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </div>
        </div>
      </Form>
    );
  }

  render() {
    return <div className="table-list-search">{this.renderForm()}</div>;
  }
}
