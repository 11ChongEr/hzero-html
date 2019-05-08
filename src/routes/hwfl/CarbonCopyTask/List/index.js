/**
 * List - 抄送流程
 * @date: 2018-8-14
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
// import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import moment from 'moment';

import { Header, Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';

import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { openTab } from 'utils/menuTab';

import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 抄送流程组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} carbonCopyTask - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ carbonCopyTask, loading }) => ({
  carbonCopyTask,
  fetchList: loading.effects['carbonCopyTask/fetchTaskList'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hwfl.carbonCopyTask', 'hwfl.common'] })
export default class List extends Component {
  form;

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      carbonCopyTask: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch({ carbonCopy: true, page });
    this.props.dispatch({ type: 'carbonCopyTask/queryProcessStatus' });
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

    const {
      startedAfter,
      startedBefore,
      processStatus,
      processInstanceId,
      processDefinitionNameLike,
      startUserName,
      readFlag,
      ...others
    } = filterValues;
    let suspended = null;
    let finished = null;
    if (processStatus === 'PROCESSIONG') {
      finished = false;
    } else if (processStatus === 'OVER') {
      finished = true;
    } else if (processStatus === 'SUSPENDED') {
      suspended = true;
      finished = false;
    }
    dispatch({
      type: 'carbonCopyTask/fetchTaskList',
      payload: {
        tenantId,
        startedAfter: startedAfter ? moment(startedAfter).format(DATETIME_MIN) : null,
        startedBefore: startedBefore ? moment(startedBefore).format(DATETIME_MAX) : null,
        startUserName,
        processDefinitionNameLike,
        processInstanceId,
        carbonCopy: true,
        suspended,
        finished,
        readFlag,
        page: isEmpty(fields) ? {} : fields,
        ...others,
      },
    });
  }

  /**
   * 跳转到详情页面
   * @param {object} record - 头数据
   */
  @Bind()
  handleDetailContent(record) {
    // const { dispatch } = this.props;
    // dispatch(routerRedux.push({ pathname: `/hwfl/workflow/carbon-copy-task/detail/${record.id}` }));
    openTab({
      title: `${record.processName}`,
      key: `/hwfl/workflow/carbon-copy-task/detail/${record.id}`,
      path: `/hwfl/workflow/carbon-copy-task/detail/${record.id}`,
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
      fetchList,
      carbonCopyTask: { list, pagination, processStatus = [] },
    } = this.props;
    const filterProps = {
      processStatus,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      pagination,
      dataSource: list,
      loading: fetchList,
      onDetail: this.handleDetailContent,
      onChange: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.carbonCopyTask.view.message.title').d('我的抄送流程')}>
          {/* <Button
            icon="sync"
            onClick={() => {
              this.handleSearch();
            }}
          >
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
