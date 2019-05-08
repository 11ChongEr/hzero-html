/**
 * List - 报表平台/报表查询
 * @date: 2018-11-28
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { filterNullValueObject, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 报表定义
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} approveAuth - 数据源
 * @reactProps {!Object} fetchApproveLoading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hrpt.reportQuery', 'entity.tenant'] })
@connect(({ reportQuery, loading }) => ({
  reportQuery,
  tenantRoleLevel: isTenantRoleLevel(),
  currentTenantId: getCurrentOrganizationId(),
  fetchReportLoading: loading.effects['reportQuery/fetchReportList'],
}))
export default class List extends Component {
  form;

  /**
   * state初始化
   */
  state = {};

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      reportQuery: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch(page);
    this.props.dispatch({ type: 'reportQuery/fetchReportType' });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'reportQuery/fetchReportList',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    });
  }

  /**
   * 查看
   *@param {obejct} record - 操作对象
   */
  @Bind()
  handleViewContent(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hrpt/report-query/detail/${record.reportUuid}`,
      })
    );
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      fetchReportLoading,
      reportQuery: { list = [], pagination, reportTypeList = [] },
      tenantRoleLevel,
    } = this.props;
    const filterProps = {
      reportTypeList,
      tenantRoleLevel,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      pagination,
      tenantRoleLevel,
      loading: fetchReportLoading,
      dataSource: list,
      onView: this.handleViewContent,
      onChange: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hrpt.reportQuery.view.message.title').d('报表查询')} />
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
