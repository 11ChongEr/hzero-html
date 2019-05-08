/**
 * ApproveRule - 流程设置/审批规则
 * @date: 2018-8-21
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isEmpty, isUndefined } from 'lodash';

import { Header, Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 审批规则
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} approveAuth - 数据源
 * @reactProps {!Object} fetchApproveLoading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hwfl.approveRule', 'hwfl.common'] })
@Form.create({ fieldNameProp: null })
@connect(({ approveRule, loading }) => ({
  approveRule,
  fetchApproveLoading: loading.effects['approveRule/fetchApproveList'],
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
      approveRule: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch(page);
    this.props.dispatch({
      type: 'approveRule/fetchScopeType',
    });
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
    dispatch({
      type: 'approveRule/fetchApproveList',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
        type: 'approve',
        tenantId,
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
        pathname: `/hwfl/setting/approve-rule/create`,
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
      approveRule: { pagination },
    } = this.props;
    dispatch({
      type: 'approveRule/deleteHeader',
      payload: {
        tenantId,
        externalDefinitionId: record.externalDefinitionId,
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
        pathname: `/hwfl/setting/approve-rule/detail/${record.externalDefinitionId}`,
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
      form,
      tenantId,
      fetchApproveLoading,
      approveRule: { list = [], scopeTypeList = [], pagination },
    } = this.props;
    const filterProps = {
      tenantId,
      form,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      scopeTypeList,
      pagination,
      loading: fetchApproveLoading,
      dataSource: list,
      onEdit: this.handleEditContent,
      onDelete: this.handleDeleteContent,
      onChange: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.approveRule.view.message.title').d('审批规则管理')}>
          <Button icon="plus" type="primary" onClick={this.handleAddApprove}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
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
