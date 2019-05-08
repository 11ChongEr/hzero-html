/**
 * ServiceTask/List - 流程设置/服务任务
 * @date: 2018-8-23
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
 * 服务任务列表
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} serviceTask - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch = e => e] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hwfl.serviceTask', 'hwfl.common'] })
@Form.create({ fieldNameProp: null })
@connect(({ serviceTask, loading }) => ({
  serviceTask,
  loading: loading.effects['serviceTask/fetchApproveList'],
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
      serviceTask: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch(page);
    this.fetchCategory();
    this.fetchScopeType();
  }

  /**
   * 获取流程分类
   * @memberof List
   */
  @Bind()
  fetchCategory() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'serviceTask/queryCategory',
      payload: { tenantId },
    });
  }

  /**
   * 获取数据范围
   * @memberof InterfaceMap
   */
  @Bind()
  fetchScopeType() {
    const { dispatch } = this.props;
    dispatch({
      type: 'serviceTask/fetchScopeType',
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
      type: 'serviceTask/fetchApproveList',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
        type: 'serviceTask',
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
        pathname: `/hwfl/setting/service-task/create`,
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
      serviceTask: { pagination },
    } = this.props;
    dispatch({
      type: 'serviceTask/deleteHeader',
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
        pathname: `/hwfl/setting/service-task/detail/${record.externalDefinitionId}`,
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
      loading,
      serviceTask: { list = [], pagination, category = [], scopeType = [] },
    } = this.props;
    const filterProps = {
      category,
      form,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      loading,
      category,
      pagination,
      scopeType,
      dataSource: list,
      onEdit: this.handleEditContent,
      onDelete: this.handleDeleteContent,
      onChange: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.serviceTask.view.message.title').d('服务任务管理')}>
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
