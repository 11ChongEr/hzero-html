/**
 * ApporoveWay - 流程设置/审批方式管理
 * @date: 2018-8-20
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
 * @reactProps {!Object} approveWay - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ approveWay, loading }) => ({
  approveWay,
  loading: loading.effects['approveWay/fetchApproveList'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hwfl.approveWay', 'hwfl.common'] })
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
      dispatch,
      tenantId,
      approveWay: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch(page);
    dispatch({
      type: 'approveWay/fetchCategory',
      payload: {
        tenantId,
      },
    });
    // 数据范围
    dispatch({
      type: 'approveWay/fetchScopeType',
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
      type: 'approveWay/fetchApproveList',
      payload: {
        type: 'strategy', // 类型：审批方式
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
  handleAddApprove() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hwfl/setting/approve-way/create`,
      })
    );
  }

  /**
   * 数据列表，头删除
   * @param {obejct} record - 操作对象
   */
  @Bind()
  handleDeleteContent(record) {
    const {
      dispatch,
      tenantId,
      approveWay: { pagination },
    } = this.props;
    dispatch({
      type: 'approveWay/deleteHeader',
      payload: {
        tenantId,
        headerId: record.expressionDefinitionId,
        record,
      },
    }).then((res = {}) => {
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
        pathname: `/hwfl/setting/approve-way/detail/${record.expressionDefinitionId}`,
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
      approveWay: { list = [], pagination = {}, scopeType = [], category = [] },
    } = this.props;
    const filterProps = {
      category,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      scopeType,
      pagination,
      loading,
      dataSource: list,
      onEdit: this.handleEditContent,
      onDelete: this.handleDeleteContent,
      onChange: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.approveWay.view.message.title').d('审批方式管理')}>
          <Button icon="plus" type="primary" onClick={this.handleAddApprove}>
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
