/**
 * List - 流程监控
 * @date: 2018-8-20
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import moment from 'moment';

import { Header, Content } from 'components/Page';

import { openTab } from 'utils/menuTab';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import FilterForm from './FilterForm';
import ListTable from './ListTable';
import EmployeeDrawer from './EmployeeDrawer';
import ExceptionMsgDrawer from './ExceptionMsgDrawer';
import JumpNodeDrawer from './JumpNodeDrawer';

/**
 * 流程监控组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} monitor - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@connect(({ monitor, loading }) => ({
  monitor,
  fetchListLoading: loading.effects['monitor/fetchMonitorList'],
  fetchEmployeeLoading: loading.effects['monitor/fetchEmployeeList'],
  approveLoading: loading.effects['monitor/taskAgree'],
  jumpLoading: loading.effects['monitor/jumpProcess'],
  fetchNodeLoading: loading.effects['monitor/fetchValidNode'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: ['hwfl.monitor', 'entity.position', 'entity.department', 'entity.employee', 'hwfl.common'],
})
export default class List extends Component {
  form;

  state = {
    delegateOrAddUser: '',
    drawerVisible: false, // 选择员工弹窗
    exceptionVisible: false, // 挂起详情弹窗
    jumpNodeVisible: false, // 挂起详情弹窗
    isCarbon: false,
    operationRecord: {},
    validNodeList: [], // 有效节点
    jumpSelected: {},
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      monitor: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch(page);
    this.props.dispatch({ type: 'monitor/queryProcessStatus' });
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
      processInstanceId,
      processDefinitionNameLike,
      startedBy,
      startedBefore,
      startedAfter,
      finishedBefore,
      finishedAfter,
      processStatus,
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
      type: 'monitor/fetchMonitorList',
      payload: {
        tenantId,
        processInstanceId,
        processDefinitionNameLike,
        startedBy,
        startedBefore: startedBefore ? moment(startedBefore).format(DATETIME_MAX) : null,
        startedAfter: startedAfter ? moment(startedAfter).format(DATETIME_MIN) : null,
        finishedBefore: finishedBefore ? moment(finishedBefore).format(DATETIME_MAX) : null,
        finishedAfter: finishedAfter ? moment(finishedAfter).format(DATETIME_MIN) : null,
        suspended,
        finished,
        page: isEmpty(fields) ? {} : fields,
        ...others,
      },
    });
  }

  @Bind()
  handleToDetail(record) {
    openTab({
      title: record.processName,
      key: `/hwfl/workflow/monitor/detail/${record.id}`,
      path: `/hwfl/workflow/monitor/detail/${record.id}`,
      icon: 'edit',
      closable: true,
    });
  }

  @Bind()
  handleSuspendedReason(processInstanceId) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'monitor/fetchExceptionDetail',
      payload: {
        tenantId,
        processInstanceId,
      },
    }).then(res => {
      if (res) {
        // notification.success();
        this.setState({ exceptionVisible: true });
      }
    });
  }

  @Bind()
  handleExceptionCancel() {
    this.setState({
      exceptionVisible: false,
    });
  }

  // 挂起、恢复、终止流程
  @Bind()
  handleOperateProcess(processInstanceId, dispatchType) {
    const {
      dispatch,
      tenantId,
      monitor: { pagination },
    } = this.props;
    dispatch({
      type: `monitor/${dispatchType}`,
      payload: {
        tenantId,
        processInstanceId,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  // 审批重试
  @Bind()
  handleRetry(record) {
    const {
      dispatch,
      tenantId,
      monitor: { pagination },
    } = this.props;
    Modal.confirm({
      title: intl.get('hwfl.common.view.message.confirm').d('确认'),
      content: intl.get('hwfl.monitor.view.message.title.confirmRetry').d(`确认重试吗?`),
      onOk: () => {
        const taskRetryList = [];
        taskRetryList.push({
          processInstanceId: record.id,
          taskName: record.taskName,
          taskId: record.taskId,
        });
        dispatch({
          type: 'monitor/retryProcess',
          payload: {
            tenantId,
            taskRetryList,
          },
        }).then(res => {
          if (res) {
            notification.success();
            this.handleSearch(pagination);
          }
        });
      },
    });
  }

  // 转交
  @Bind()
  handleDelegate(record) {
    if (record.currentTasks && record.currentTasks.length === 1) {
      this.setState({
        drawerVisible: true,
        operationRecord: record,
      });
    } else {
      this.props.history.push(`/hwfl/workflow/delegate`);
    }
  }

  /**
   * 单个节点转交 submit.
   * @param data 任务数据
   */
  @Bind()
  handleAction(data = {}) {
    const {
      tenantId,
      dispatch,
      monitor: { pagination },
    } = this.props;
    const { operationRecord } = this.state;
    dispatch({
      type: 'monitor/delegateProcess',
      payload: {
        tenantId,
        assignee: data.targetUser || null,
        action: 'delegate',
        processInstanceId: operationRecord.id,
        currentTaskId: operationRecord.currentTasks[0].taskId,
        employeeCode: data.targetUser || null,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({
          drawerVisible: false,
        });
        this.handleSearch(pagination);
      }
    });
  }

  @Bind()
  handleCancel() {
    this.setState({
      drawerVisible: false,
    });
  }

  // 跳转节点TODO
  @Bind()
  handleJumpNode(record) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'monitor/fetchValidNode',
      payload: {
        tenantId,
        processInstanceId: record.id,
      },
    }).then(res => {
      if (res) {
        this.setState({
          jumpNodeVisible: true,
          operationRecord: record,
          validNodeList: res,
          jumpSelected: {},
        });
      }
    });
  }

  @Bind()
  handleSelectNode(record) {
    this.setState({
      jumpSelected: record,
    });
  }

  @Bind()
  handleJumpSubmit() {
    const {
      tenantId,
      dispatch,
      monitor: { pagination },
    } = this.props;
    const { jumpSelected, operationRecord } = this.state;
    if (jumpSelected.nodeId) {
      const currentTaskId = operationRecord.currentTasks[0].taskId;
      dispatch({
        type: 'monitor/jumpProcess',
        payload: {
          tenantId,
          action: 'jump',
          currentTaskId,
          jumpTarget: jumpSelected.nodeId,
          jumpTargetName: jumpSelected.name,
          processInstanceId: operationRecord.id,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.setState({
            jumpNodeVisible: false,
          });
          this.handleSearch(pagination);
        }
      });
    } else {
      this.handleJumpCancel();
    }
  }

  @Bind()
  handleJumpCancel() {
    this.setState({
      jumpNodeVisible: false,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      fetchListLoading,
      dispatch,
      tenantId,
      approveLoading,
      fetchNodeLoading,
      jumpLoading,
      fetchEmployeeLoading,
      monitor: {
        exceptionDetail,
        employeeList,
        employeePagination,
        list = [],
        pagination,
        processStatus = [],
      },
    } = this.props;
    const {
      drawerVisible,
      isCarbon,
      delegateOrAddUser,
      exceptionVisible,
      jumpNodeVisible,
      validNodeList,
    } = this.state;
    const filterProps = {
      processStatus,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      pagination,
      dataSource: list,
      loading: fetchListLoading,
      onDetail: this.handleToDetail, // 流程详情
      onSuspendedReason: this.handleSuspendedReason, // 挂起详情
      onStop: this.handleOperateProcess, // 终止流程
      onSuspend: this.handleOperateProcess, // 挂起节点
      onResume: this.handleOperateProcess, // 恢复流程
      onRetry: this.handleRetry, // 审批重试
      onDelegate: this.handleDelegate, // 转交
      onJumpNode: this.handleJumpNode, // 跳转节点
      onChange: this.handleSearch,
    };

    const employeeProps = {
      employeeList,
      employeePagination,
      drawerVisible,
      tenantId,
      isCarbon,
      dispatch,
      delegateOrAddUser,
      approveLoading,
      loading: fetchEmployeeLoading,
      anchor: 'right',
      onCancel: this.handleCancel,
      onAction: this.handleAction,
      getActionName: () => {
        return intl.get('hwfl.monitor.view.option.delegate').d('转交');
      },
    };

    const exceptionMsgProps = {
      exceptionDetail,
      title: intl.get('hwfl.monitor.model.monitor.exceptionDetail').d('挂起详情'),
      visible: exceptionVisible,
      onCancel: this.handleExceptionCancel,
    };

    const jumpNodeProps = {
      validNodeList,
      fetchNodeLoading,
      jumpLoading,
      title: intl.get('hwfl.monitor.model.monitor.jumpNode').d('跳转节点'),
      visible: jumpNodeVisible,
      onSelectNode: this.handleSelectNode,
      onOk: this.handleJumpSubmit,
      onCancel: this.handleJumpCancel,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.monitor.view.message.title').d('流程监控')}>
          {/* <Button icon="sync" onClick={() => this.handleSearch()}>
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button> */}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />

          <EmployeeDrawer {...employeeProps} />
          <ExceptionMsgDrawer {...exceptionMsgProps} />
          <JumpNodeDrawer {...jumpNodeProps} />
        </Content>
      </React.Fragment>
    );
  }
}
