/**
 * Condition - 流程设置/跳转条件管理
 * @date: 2018-8-15
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 跳转条件管理组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} condition - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hwfl.condition', 'hwfl.common'] })
@connect(({ condition, loading }) => ({
  condition,
  loading: loading.effects['condition/fetchConditionList'],
  tenantId: getCurrentOrganizationId(),
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
      tenantId,
      dispatch,
      condition: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch(page);
    dispatch({
      type: 'condition/fetchCategory',
      payload: {
        tenantId,
      },
    });
    //  数据范围
    dispatch({
      type: 'condition/fetchScopeType',
    });
  }

  /**
   * 传递表单对象
   * @param {object} ref - FilterForm对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'condition/fetchConditionList',
      payload: {
        type: 'sequence', // 类型：跳转条件
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
      },
    });
  }

  /**
   * 新增，跳转到明细页面
   */
  @Bind()
  handleAddCondition() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hwfl/setting/condition/create`,
      })
    );
  }

  /**
   * 数据列表，行删除
   * @param {obejct} record - 操作对象
   */
  @Bind()
  handleDeleteContent(record) {
    const {
      dispatch,
      tenantId,
      condition: { pagination },
    } = this.props;
    dispatch({
      type: 'condition/deleteHeader',
      payload: {
        tenantId,
        headerId: record.expressionDefinitionId,
        record,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 数据列表，行编辑
   *@param {obejct} record - 操作对象
   */
  @Bind()
  handleEditContent(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hwfl/setting/condition/detail/${record.expressionDefinitionId}`,
      })
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      condition: { list = [], pagination = {}, category = [], scopeType = [] },
    } = this.props;
    const filterProps = {
      category,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      category,
      scopeType,
      pagination,
      dataSource: list,
      processing: {
        list: loading,
      },
      onEdit: this.handleEditContent,
      onDelete: this.handleDeleteContent,
      onChange: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.condition.view.message.title').d('跳转条件管理')}>
          <Button icon="plus" type="primary" onClick={this.handleAddCondition}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
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
