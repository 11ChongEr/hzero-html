/**
 * ConcRequest - 并发请求
 * @date: 2018-9-14
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
// import { routerRedux } from 'dva/router';
import moment from 'moment';
import { cloneDeep, isUndefined, isEmpty, forEach, isObject } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';

import {
  isTenantRoleLevel,
  getCurrentOrganizationId,
  getCurrentRole,
  filterNullValueObject,
  getDateTimeFormat,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import FilterForm from './FilterForm';
import ListTable from './ListTable';
import Drawer from './Drawer';
import LogDrawer from './LogDrawer';
import LogErrorDrawer from './LogErrorDrawer';

/**
 * 并发请求组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} concRequest - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ concRequest, loading }) => ({
  concRequest,
  fetchList: loading.effects['concRequest/fetchRequestList'],
  fetchJobError: loading.effects['concRequest/fetchJobLogError'],
  fetchJogLoading: loading.effects['concRequest/fetchJobLog'],
  creating: loading.effects['concRequest/createRequest'],
  tenantRoleLevel: isTenantRoleLevel(),
  currentTenantId: getCurrentOrganizationId(),
  roleId: getCurrentRole().id,
}))
@formatterCollections({
  code: ['hsdr.concRequest', 'hsdr.jobInfo', 'hsdr.jobLog', 'entity.tenant'],
})
export default class ConcRequest extends Component {
  form;

  state = {
    jobModalVisible: false,
    jobErrorModalVisible: false,
    jobLogId: '',
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'concRequest/init',
    });
    this.handleSearch();
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
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    this.form.validateFields(err => {
      if (!err) {
        dispatch({
          type: 'concRequest/fetchRequestList',
          payload: {
            page: isEmpty(fields) ? {} : fields,
            ...fieldValues,
          },
        });
      }
    });
  }

  /**
   * @function handleEditJob- 操作job
   * @param {object} record - 行数据
   * @param {string} type - 操作任务的类型
   */
  handleEditJob(params, type) {
    const {
      dispatch,
      concRequest: { pagination },
    } = this.props;
    dispatch({
      type: `concRequest/${type}`,
      payload: { ...params },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * @function handleEditJob- 删除
   * @param {object} record - 行数据
   */
  handleDelete(record) {
    const {
      dispatch,
      concRequest: { pagination },
    } = this.props;
    dispatch({
      type: 'concRequest/deleteJobInfo',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  @Bind()
  hideJobLogErrorDrawer() {
    this.setState({ jobErrorModalVisible: false });
  }

  @Bind()
  handleJobError(data) {
    const { dispatch } = this.props;
    this.setState({ jobErrorModalVisible: true });
    dispatch({
      type: 'concRequest/fetchJobLogError',
      payload: data,
    });
  }

  @Bind()
  handleDeleteJobLog(record) {
    const {
      dispatch,
      concRequest: { jobPagination = {} },
    } = this.props;
    dispatch({
      type: 'concRequest/deleteJobLog',
      payload: {
        logId: record.logId,
        jobId: record.jobId,
        _token: record._token,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchJobLog({
          page: jobPagination.current - 1,
          size: jobPagination.pageSize,
        });
      }
    });
  }

  @Bind()
  showJobDrawer(flag) {
    this.setState({ jobModalVisible: flag });
  }

  @Bind()
  hideJobLogDrawer() {
    this.showJobDrawer(false);
  }

  @Bind()
  fetchJobLog(params) {
    const { dispatch } = this.props;
    const { jobLogId } = this.state;
    dispatch({
      type: 'concRequest/fetchJobLog',
      payload: { jobId: jobLogId, ...params },
    });
  }

  /**
   * 跳转到请求日志页面
   * @param {object} params - 头数据
   */
  handleLogContent(params) {
    this.setState({ jobLogId: params.jobId });
    this.showJobDrawer(true);
    this.fetchJobLog(params);
  }

  /**
   * @function showConcurrentMsg - 请求信息(点击请求ID触发的))
   * @param {object} record - 行数据
   */
  @Bind()
  showConcurrentMsg(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'concRequest/fetchConcurrentMsg',
      payload: {
        executableId: record.requestId,
      },
    });
    this.handleConcurrentVisible(true);
  }

  /**
   * @function showConcurrentMsg - 日志信息
   * @param {object} record - 行数据
   */
  @Bind()
  showLogMsg(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'concRequest/fetchLogMsg',
      payload: {
        executableId: record.requestId,
      },
    });
    this.handleLogVisible(true);
  }

  /**
   * @function handleModalVisible - 控制modal显示与隐藏
   * @param {boolean} flag 是否显示modal
   */
  @Bind()
  handleModalVisible(flag) {
    const { dispatch } = this.props;
    dispatch({
      type: 'concRequest/updateState',
      payload: {
        modalVisible: !!flag,
        paramList: [],
      },
    });
  }

  /**
   * @function showCreateModal - 显示新增modal
   */
  @Bind()
  showCreateModal() {
    this.handleModalVisible(true);
  }

  /**
   * @function handleConcurrentVisible - 控制请求ID处的Modal显示与隐藏
   * @param {boolean} flag 是否显示modal
   */
  @Bind()
  handleConcurrentVisible(flag) {
    const { dispatch } = this.props;
    dispatch({
      type: 'concRequest/updateState',
      payload: {
        concurrentVisible: !!flag,
      },
    });
  }

  /**
   * @function handleConcurrentVisible - 控制日志信息modal显示与隐藏
   * @param {boolean} flag 是否显示modal
   */
  @Bind()
  handleLogVisible(flag) {
    const { dispatch } = this.props;
    dispatch({
      type: 'concRequest/updateState',
      payload: {
        logMsgVisible: !!flag,
      },
    });
  }

  @Bind()
  changeConcurrent(text) {
    const { dispatch } = this.props;
    dispatch({
      type: 'concRequest/fetchParams',
      payload: { concurrentId: text },
    });
  }

  /**
   * @function handleAdd - 新增或编辑可执行数据
   * @param {Object} fieldsValue - 编辑的数据
   * @param {Object} others - 其他参数(fix bug 新增)
   */
  @Bind()
  handleAdd(fieldsValue, others = {}) {
    const {
      dispatch,
      concRequest: { pagination, paramList = [] },
      currentTenantId,
    } = this.props;
    const {
      startDate,
      endDate,
      concurrentId,
      cycleFlag,
      intervalType,
      intervalNumber,
      intervalHour,
      intervalMinute,
      intervalSecond,
      tenantId,
    } = fieldsValue;
    const newFields = cloneDeep(fieldsValue);
    if (paramList.length > 0) {
      const { requestParamNameMap = new Map() } = others;
      [
        'concurrentId',
        'cycleFlag',
        'startDate',
        'endDate',
        'intervalType',
        'intervalNumber',
        'intervalHour',
        'intervalMinute',
        'intervalSecond',
        'tenantId',
      ].forEach(paramCode => {
        if (!requestParamNameMap.has(paramCode)) {
          delete newFields[paramCode];
        }
      });
    }
    if (!newFields) {
      return null;
    }
    forEach(newFields, (value, key) => {
      if (isObject(value)) {
        //  eslint-disable-next-line
        newFields[key] = eval('(' + value + ')');
        if (moment(value).isValid()) {
          //  eslint-disable-next-line
          newFields[key] = moment(value).format(getDateTimeFormat());
        }
      }
    });
    dispatch({
      type: 'concRequest/createRequest',
      payload: {
        startDate: startDate ? moment(startDate).format(DEFAULT_DATETIME_FORMAT) : null,
        endDate: endDate ? moment(endDate).format(DEFAULT_DATETIME_FORMAT) : null,
        requestParam: paramList.length > 0 ? JSON.stringify(newFields) : null,
        concurrentId,
        cycleFlag,
        intervalType,
        intervalNumber,
        intervalHour,
        intervalMinute,
        intervalSecond,
        tenantId: !isUndefined(tenantId) ? tenantId : currentTenantId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleModalVisible(false);
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      fetchList,
      creating,
      fetchJogLoading = false,
      fetchJobError = false,
      concRequest: {
        list = [],
        requestDetail,
        paramList = [],
        pagination,
        modalVisible,
        statusList = [],
        intervalTypeList = [],
        jobLogList = [],
        jobPagination = {},
        jobErrorDetail = {},
        jobLogLdp = {},
      },
      tenantRoleLevel,
      currentTenantId,
      roleId,
      dispatch,
    } = this.props;
    const { jobModalVisible, jobErrorModalVisible } = this.state;
    const filterProps = {
      tenantRoleLevel,
      statusList,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      tenantRoleLevel,
      pagination,
      dataSource: list,
      loading: fetchList,
      concurrentMsgContent: this.showConcurrentMsg,
      logMsgContent: this.showLogMsg,
      changeOptionContent: (record, type) => this.handleEditJob(record, type),
      handleDelete: requestId => this.handleDelete(requestId),
      logContent: record => this.handleLogContent({ jobId: record.jobId }),
      onChange: this.handleSearch,
    };
    const logDrawer = {
      dispatch,
      jobLogLdp,
      jobLogList,
      jobPagination,
      title: intl.get('hsdr.jobLog.view.message.title').d('调度日志'),
      initLoading: fetchJogLoading,
      loading: fetchJogLoading,
      modalVisible: jobModalVisible,
      onSearch: this.fetchJobLog,
      onCancel: this.hideJobLogDrawer,
      onError: this.handleJobError,
      onDelete: this.handleDeleteJobLog,
    };
    const logErrorProps = {
      jobErrorDetail,
      initLoading: fetchJobError,
      modalVisible: jobErrorModalVisible,
      onOk: this.hideJobLogErrorDrawer,
      onCancel: this.hideJobLogErrorDrawer,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hsdr.concRequest.view.message.title').d('并发请求')}>
          <Button icon="plus" type="primary" onClick={this.showCreateModal}>
            {intl.get('hsdr.concRequest.view.option.create').d('提交新请求')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
          <Drawer
            width={1000}
            title={intl.get('hsdr.concRequest.view.option.create').d('提交新请求')}
            loading={creating}
            modalVisible={modalVisible}
            onCancel={() => this.handleModalVisible(false)}
            onOk={this.handleAdd}
            changeConcurrent={this.changeConcurrent}
            initData={requestDetail}
            intervalTypeList={intervalTypeList}
            paramList={paramList}
            tenantId={currentTenantId}
            roleId={roleId}
            tenantRoleLevel={tenantRoleLevel}
          />
          <LogDrawer {...logDrawer} />
          <LogErrorDrawer {...logErrorProps} />
        </Content>
      </React.Fragment>
    );
  }
}
