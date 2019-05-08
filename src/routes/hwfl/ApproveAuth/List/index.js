/**
 * ApproveAuto - 流程设置/审批权限
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
 * 审批权限
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} approveAuth - 数据源
 * @reactProps {!Object} fetchApproveListLoading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hwfl.approveAuth', 'hwfl.common'] })
@connect(({ approveAuth, loading }) => ({
  approveAuth,
  fetchApproveListLoading: loading.effects['approveAuth/fetchApproveList'],
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
      approveAuth: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch(page);
    dispatch({
      type: 'approveAuth/fetchCategory',
      payload: {
        tenantId,
      },
    });
    //  数据范围
    dispatch({
      type: 'approveAuth/fetchScopeType',
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
      type: 'approveAuth/fetchApproveList',
      payload: {
        type: 'approve', // 类型：审批权限
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
        pathname: `/hwfl/setting/approve-auth/create`,
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
      approveAuth: { pagination },
    } = this.props;
    dispatch({
      type: 'approveAuth/deleteHeader',
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
        pathname: `/hwfl/setting/approve-auth/detail/${record.expressionDefinitionId}`,
      })
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      fetchApproveListLoading,
      approveAuth: { list = [], pagination, category = [], scopeType = [] },
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
      loading: fetchApproveListLoading,
      onEdit: this.handleEditContent,
      onDelete: this.handleDeleteContent,
      onChange: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.approveAuth.view.message.title').d('审批权限管理')}>
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
