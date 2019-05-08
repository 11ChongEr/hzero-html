/**
 * Detail - 币种定义引用明细
 * @date: 2018-7-3
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Form, Input, Table } from 'hzero-ui';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { createPagination } from 'utils/utils';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 币种引用明细
 * @extends {Component} - React.Component
 * @reactProps {Object} currency - 数据源
 * @reactProps {Object} fetchDetailLoading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ currency, loading }) => ({
  currency,
  fetchDetailLoading: loading.effects['currency/fetchDetail'],
}))
@Form.create({ fieldNameProp: null })
@withRouter
export default class Detail extends PureComponent {
  /**
   * 分页change事件
   * @param {boolean} flag  显/隐标记
   */
  handleStandardTableChange = pagination => {
    const { match, dispatch } = this.props;
    const params = {
      page: pagination.current - 1, // 服务器接口从 0 开始分页
      size: pagination.pageSize,
      currencyId: match.params.currencyId,
    };
    dispatch({
      type: 'currency/fetchDetail',
      payload: params,
    });
  };

  /**
   * 渲染头展示数据
   * @returns
   */
  renderForm() {
    const {
      currency: {
        detail: { currencyCode = {}, currencyName = {} },
      },
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('hpfm.currency.model.currency.currencyCode').d('币种代码')}>
          {getFieldDecorator('currencyCode', { initialValue: currencyCode })(<Input disabled />)}
        </FormItem>
        <FormItem label={intl.get('hpfm.currency.model.currency.currencyName').d('币种名称')}>
          {getFieldDecorator('currencyName', { initialValue: currencyName })(<Input disabled />)}
        </FormItem>
      </Form>
    );
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      currency: { detail = {} },
      fetchDetailLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get('hpfm.currency.model.currency.tenantNum').d('企业集团代码'),
        dataIndex: 'tenantNum',
        width: 200,
      },
      {
        title: intl.get('hpfm.currency.model.currency.tenantName').d('企业集团名称'),
        dataIndex: 'tenantName',
      },
      {
        title: intl.get('hpfm.currency.model.currency.currencyCode').d('币种代码'),
        dataIndex: 'currencyCode',
        width: 100,
        align: 'center',
      },
      {
        title: intl.get('hpfm.currency.model.currency.currencyName').d('币种名称'),
        dataIndex: 'currencyName',
        width: 100,
        align: 'center',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 80,
        align: 'center',
        render: enableRender,
      },
    ];

    return (
      <React.Fragment>
        <div className="table-list-search">{this.renderForm()}</div>
        <Table
          bordered
          loading={fetchDetailLoading}
          dataSource={detail.list}
          columns={columns}
          rowKey="currencyTenantId"
          pagination={createPagination(detail)}
          onChange={this.handleStandardTableChange}
        />
      </React.Fragment>
    );
  }
}
