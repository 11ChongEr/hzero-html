/**
 * SearchForm.js
 * @date 2018-12-25
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import React from 'react';
import { Button, Form, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import cacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';

import intl from 'utils/intl';

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hpfm/static-text/list/search' })
export default class SearchForm extends React.Component {
  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  render() {
    const { form } = this.props;
    return (
      <div className="table-list-search table-list-operator">
        <Form layout="inline">
          <Form.Item
            key="title"
            label={intl.get('hpfm.staticText.model.staticText.title').d('标题')}
          >
            {form.getFieldDecorator('title')(<Input />)}
          </Form.Item>
          <Form.Item
            key="textCode"
            label={intl.get('hpfm.staticText.model.staticText.code').d('编码')}
          >
            {form.getFieldDecorator('textCode')(<Input />)}
          </Form.Item>
          <Form.Item key="tenantId" label={intl.get('entity.tenant.tag').d('租户')}>
            {form.getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" textField="tenantName" />)}
          </Form.Item>
          <Form.Item key="btns">
            <Button
              key="search"
              type="primary"
              htmlType="submit"
              onClick={this.handleSearchBtnClick}
            >
              {intl.get('hzero.common.button.search').d('查询')}
            </Button>
            <Button key="reset" onClick={this.handleResetBtnClick}>
              {intl.get('hzero.common.button.reset').d('重置')}
            </Button>
          </Form.Item>
        </Form>
      </div>
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
