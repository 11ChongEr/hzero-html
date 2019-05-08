/**
 * Exception - 报错日志
 * @date: 2018-8-23
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { Header, Content } from 'components/Page';

import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 报错日志组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} exception - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ exception, loading }) => ({
  exception,
  fetchList: loading.effects['exception/fetchExceptionList'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hwfl.exception', 'hwfl.common'] })
export default class Exception extends Component {
  form;

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    const { before, after, ...others } = fieldValues;
    dispatch({
      type: 'exception/fetchExceptionList',
      payload: {
        tenantId,
        after: after ? moment(after).format(DATETIME_MIN) : undefined,
        before: before ? moment(before).format(DATETIME_MAX) : undefined,
        page: isEmpty(fields) ? {} : fields,
        ...others,
      },
    });
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
      dispatch,
      fetchList,
      tenantId,
      exception: { list = [], pagination, exceptionDetail = {}, modalVisible = false },
    } = this.props;
    const filterProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      dispatch,
      modalVisible,
      tenantId,
      exceptionDetail,
      pagination,
      dataSource: list,
      loading: fetchList,
      onChange: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.exception.view.message.title').d('报错日志')}>
          {/* <Button icon="sync" onClick={() => this.handleSearch()}>
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button> */}
        </Header>
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
