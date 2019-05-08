/**
 * MessageTemplate - 消息模板列表
 * @date: 2018-7-26
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { filterNullValueObject, isTenantRoleLevel } from 'utils/utils';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 消息模板列表组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} messageTemplate - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */

@connect(({ messageTemplate, loading }) => ({
  messageTemplate,
  loading: loading.effects['messageTemplate/fetchTemplate'],
  tenantRoleLevel: isTenantRoleLevel(),
}))
@formatterCollections({ code: ['hmsg.messageTemplate', 'entity.tenant', 'entity.lang'] })
export default class List extends Component {
  form;

  state = {};

  /**
   * componentDidMount 生命周期函数
   * render()执行后获取页面数据
   */
  componentDidMount() {
    const {
      dispatch,
      messageTemplate: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch(page);
    dispatch({
      type: 'messageTemplate/fetchLanguage',
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
   * 新增模板，跳转到明细页面
   */
  @Bind()
  handleAddTemplate() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hmsg/message-template/create`,
      })
    );
  }

  /**
   * 页面查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'messageTemplate/fetchTemplate',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...filterValues,
      },
    });
  }

  /**
   * 修改消息模板信息，跳转到明细页面
   * @param {!object} record - 消息模板对象
   */
  @Bind()
  handleEditContent(record = {}) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hmsg/message-template/detail/${record.templateId}`,
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
      messageTemplate: { list = [], pagination = {}, language = [] },
      tenantRoleLevel,
    } = this.props;
    const filterProps = {
      tenantRoleLevel,
      language,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      tenantRoleLevel,
      pagination,
      language,
      loading,
      dataSource: list,
      onChange: this.handleSearch,
      onEdit: this.handleEditContent,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hmsg.messageTemplate.view.message.title.list').d('消息模板')}>
          <Button icon="plus" type="primary" onClick={this.handleAddTemplate}>
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
