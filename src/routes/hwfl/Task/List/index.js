/**
 *  List- 待办事项列表
 * @date: 2018-8-27
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import moment from 'moment';

import { Header, Content } from 'components/Page';

import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { openTab } from 'utils/menuTab';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 待办事项列表组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} task - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ task, loading }) => ({
  task,
  fetchListLoading: loading.effects['task/fetchTaskList'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hwfl.task', 'hwfl.common'] })
export default class List extends Component {
  form;

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      task: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch(page);
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

    const { createdBefore, createdAfter, priority, ...others } = filterValues;
    let minimumPriority = null;
    let maximumPriority = null;
    if (priority === 'low') {
      minimumPriority = 0;
      maximumPriority = 33;
    } else if (priority === 'medium') {
      minimumPriority = 34;
      maximumPriority = 66;
    } else if (priority === 'height') {
      minimumPriority = 67;
      maximumPriority = 100;
    }

    dispatch({
      type: 'task/fetchTaskList',
      payload: {
        tenantId,
        createdBefore: createdBefore ? moment(createdBefore).format(DATETIME_MAX) : null,
        createdAfter: createdAfter ? moment(createdAfter).format(DATETIME_MIN) : null,
        minimumPriority,
        maximumPriority,
        page: isEmpty(fields) ? {} : fields,
        ...others,
      },
    });
  }

  /**
   * 详情
   * @param {object} record - 头数据
   */
  @Bind()
  handleDetailContent(record) {
    // dispatch(routerRedux.push({ pathname: `/hwfl/workflow/task/detail/${record.id}` }));
    openTab({
      title: `${record.processName}-${record.assigneeName}`,
      key: `/hwfl/workflow/task/detail/${record.id}`,
      path: `/hwfl/workflow/task/detail/${record.id}`,
      icon: 'edit',
      closable: true,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      fetchListLoading,
      task: { list = [], pagination },
    } = this.props;
    const filterProps = {
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      pagination,
      dataSource: list,
      loading: fetchListLoading,
      detailContent: this.handleDetailContent,
      onChange: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.task.view.message.title').d('我的待办列表')}>
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
