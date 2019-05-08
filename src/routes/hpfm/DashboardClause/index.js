/**
 * Clause -条目配置
 * @date: 2019-01-28
 * @author YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';

import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { Header, Content } from 'components/Page';
import cacheComponent from 'components/CacheComponent';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 条目配置
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} dashboard - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

const promptCode = 'hpfm.dashboardClause';
@connect(({ dashboardClause, loading }) => ({
  dashboardClause,
  loading: loading.effects['dashboardClause/queryClause'],
  saving: loading.effects['dashboardClause/addClause'],
  detailLoading: loading.effects['dashboardClause/queryClauseDetail'],
}))
@formatterCollections({ code: 'hpfm.dashboardClause' })
@cacheComponent({ cacheKey: '/hpfm/dashboard-clause/list' })
export default class DashboardClause extends Component {
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'dashboardClause/init',
    });
    this.handleSearch();
  }

  /**
   * 新建条目配置
   */
  @Bind()
  handleCreateHeader() {
    this.props.history.push(`/hpfm/dashboard-clause/create`);
  }

  /**
   * 查询条目配置列表
   * @param {Object} page
   */
  @Bind()
  handleSearch(params = {}) {
    const {
      dispatch,
      dashboardClause: { clausePagination = [] },
    } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    dispatch({
      type: 'dashboardClause/queryClause',
      payload: {
        page: clausePagination,
        ...params,
        ...filterValues,
      },
    });
  }

  @Bind()
  handleEdit(record) {
    this.props.history.push(`/hpfm/dashboard-clause/detail/${record.clauseId}`);
  }

  @Bind()
  handleTableChange(page) {
    this.handleSearch(page);
  }

  render() {
    const {
      loading,
      dashboardClause: { clauseList = [], clausePagination = {}, flags },
    } = this.props;
    const filterProps = {
      flags,
      onFilterChange: this.handleSearch,
      onRef: node => {
        this.filterForm = node.props.form;
      },
    };
    const listProps = {
      loading,
      dataSource: clauseList,
      showEditModal: this.handleEdit,
      pagination: clausePagination,
      onChange: this.handleTableChange,
    };
    return (
      <Fragment>
        <Header title={intl.get(`${promptCode}.view.message.title.dashboardClause`).d('条目配置')}>
          <Button icon="plus" type="primary" onClick={this.handleCreateHeader}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
