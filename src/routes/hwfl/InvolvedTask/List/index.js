/**
 * InvolvedTask - 参与流程
 * @date: 2018-8-31
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Radio } from 'hzero-ui';
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

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

/**
 * 参会流程组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} involvedTask - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hwfl.involvedTask', 'hwfl.common'] })
@connect(({ involvedTask, loading }) => ({
  involvedTask,
  fetchListLoading: loading.effects['involvedTask/fetchTaskList'],
  tenantId: getCurrentOrganizationId(),
}))
export default class InvolvedTask extends Component {
  form;

  state = {
    taskType: 'involved',
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      involvedTask: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch({ involved: true, page });
    this.props.dispatch({ type: 'involvedTask/queryProcessStatus' });
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
    const { taskType } = this.state;
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
    const involved = taskType === 'involved' ? true : null;
    const startedBy = taskType === 'startedBy' ? true : null;

    dispatch({
      type: 'involvedTask/fetchTaskList',
      payload: {
        tenantId,
        startedAfter: startedAfter ? moment(startedAfter).format(DATETIME_MIN) : null,
        startedBefore: startedBefore ? moment(startedBefore).format(DATETIME_MAX) : null,
        startUserName,
        processDefinitionNameLike,
        processInstanceId,
        involved,
        startedBy,
        suspended,
        finished,
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
    // dispatch(routerRedux.push({ pathname: `/hwfl/workflow/involved-task/detail/${record.id}` }));
    openTab({
      title: `${record.processName}`,
      key: `/hwfl/workflow/involved-task/detail/${record.id}`,
      path: `/hwfl/workflow/involved-task/detail/${record.id}`,
      icon: 'edit',
      closable: true,
    });
  }

  handleTypeChange(e) {
    this.setState({ taskType: e.target.value }, () => {
      this.handleSearch();
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      fetchListLoading,
      involvedTask: { list, pagination, processStatus = [] },
    } = this.props;
    const filterProps = {
      processStatus,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      pagination,
      dataSource: list,
      onDetail: this.handleDetailContent,
      loading: fetchListLoading,
      onChange: this.handleSearch,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.involvedTask.view.message.title').d('我的参与流程')}>
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
          <div style={{ margin: '20px 0' }}>
            <RadioGroup defaultValue="involved" onChange={e => this.handleTypeChange(e)}>
              <RadioButton value="involved">
                {intl.get('hwfl.involvedTask.view.message.involved').d('我参与的流程')}
              </RadioButton>
              <RadioButton value="startedBy">
                {intl.get('hwfl.involvedTask.view.message.startedBy').d('我发起的流程')}
              </RadioButton>
            </RadioGroup>
          </div>
          <ListTable {...listProps} />
        </Content>
      </React.Fragment>
    );
  }
}
