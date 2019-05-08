/**
 * 卡片管理 分配租户 查询表单
 * @date 2019-01-23
 * @author WY yang.wang06@hand-china.com
 * @copyright © HAND 2019
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

/**
 * 卡片管理查询表单
 * @ReactProps {!Function} onRef - 拿到该组件的this
 * @ReactProps {!Function} onSearch - 触发查询方法
 */
@Form.create({ fieldNameProp: null })
export default class CardTenantEditSearchForm extends React.Component {
  static propTypes = {
    onSearch: PropTypes.func.isRequired, // 查询按钮点击触发
    onRef: PropTypes.func.isRequired, // 获取本省的this
  };

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  render() {
    const { form } = this.props;
    return (
      <Form layout="inline">
        <Form.Item label={intl.get('entity.tenant.name').d('租户名称')}>
          {form.getFieldDecorator('tenantName')(<Input />)}
        </Form.Item>
        <Form.Item>
          <Button key="search" type="primary" onClick={this.handleSearchBtnClick}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button key="reset" onClick={this.handleResetBtnClick}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </Form.Item>
      </Form>
    );
  }

  @Bind()
  handleSearchBtnClick() {
    const { onSearch } = this.props;
    onSearch();
  }

  @Bind()
  handleResetBtnClick() {
    const { form } = this.props;
    form.resetFields();
  }
}
