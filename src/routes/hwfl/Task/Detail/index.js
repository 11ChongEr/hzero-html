/**
 * Detail - 待办事项明细
 * @date: 2018-8-27
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Modal, Button, Tabs, Col, Input, Row, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { forEach } from 'lodash';

import classNames from 'classnames';
import { Header, Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { closeTab } from 'utils/menuTab';
import notification from 'utils/notification';

import ApproveHistory from './ApproveHistory';
import FlowChart from './FlowChart';
import EmployeeDrawer from './EmployeeDrawer';
import ApproveForm from './ApproveForm';
import styles from './index.less';

const { TextArea } = Input;

@Form.create({
  fieldNameProp: null,
})
@formatterCollections({
  code: ['hwfl.task', 'entity.position', 'entity.department', 'entity.employee', 'hwfl.common'],
})
@connect(({ task, loading }) => ({
  task,
  fetchForecastLoading: loading.effects['task/fetchForecast'],
  fetchDetailLoading: loading.effects['task/fetchDetail'],
  fetchEmployeeLoading: loading.effects['task/fetchEmployeeList'],
  approveLoading: loading.effects['task/taskAgree'],
  refuseLoading: loading.effects['task/taskRefuse'],
  tenantId: getCurrentOrganizationId(),
}))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delegateOrAddUser: '',
      drawerVisible: false, // 侧边框是否可见
      // organizationName: '我不是',
      taskId: this.props.match.params.id,
      // approveResult: [{ action: 'Approved', name: intl.get('hwfl.task.view.option.agree').d('同意') }, { action: 'Rejected', name: intl.get('hwfl.task.view.option.refuse').d('拒绝') }],
      approveResult: [],
      formInvokeFlag: false,
      isLoadApproveResult: false,
      isCarbon: false,
      carbonCopyUser: [],
      currentDetailData: {},
    };

    this.selectedCarbonCopyUsers = null;
    this.selectedCopyUsersCode = null;
    this.selectedCopyUsersId = null;
    this.approveFormChildren = null;

    this.executionVariables = {};
    this.approveResultWithForm = '';
  }

  /**
   * 生命周期函数
   *render调用后，获取页面展示数据
   */
  componentDidMount() {
    // const { dispatch, tenantId, match, detail } = this.props;
    this.handleSearch();

    // dispatch({
    //   type: 'task/fetchForecast',
    //   payload: {
    //     tenantId,
    //     id: match.params.id,
    //   },
    // });
  }

  @Bind()
  handleSearch() {
    const { dispatch, tenantId } = this.props;
    const { taskId, isLoadApproveResult } = this.state;
    const { approveResult } = this.state;
    dispatch({
      type: 'task/fetchDetail',
      payload: {
        tenantId,
        id: taskId,
      },
    }).then(res => {
      if (res) {
        const { formProperties } = res.formData;
        if (isLoadApproveResult) {
          return;
        }
        forEach(formProperties, prop => {
          if (prop.id === 'CUSTOM_APPROVE_RESULT' && prop.type === 'enum') {
            // approveResult = [];
            forEach(prop.enumValues, result => {
              //
              const approve = {};
              approve.action = result.id;
              approve.name = result.name;
              approveResult.push(approve);
            });
          }
          if (prop.id === 'APPROVAL_ACTION' && prop.type === 'enum') {
            forEach(prop.enumValues, result => {
              //
              if (result.id === 'DELEGATE_FLAG' && result.name === 'Y') {
                const approve = {};
                approve.action = 'delegate';
                approve.name = intl.get('hwfl.task.view.option.delegate').d('转交');
                approveResult.push(approve);
              } else if (result.id === 'ADD_SIGN_FLAG' && result.name === 'Y') {
                const approve = {};
                approve.action = 'addSign';
                approve.name = intl.get('hwfl.task.view.option.addUser').d('加签');
                approveResult.push(approve);
              }
            });
          }
          if (res.formKey && prop.id === 'FORM_INVOKE_FLAG') {
            this.setState({
              formInvokeFlag: true,
            });
          }
        });
        this.setState({
          approveResult,
          isLoadApproveResult: true,
          currentDetailData: res,
        });
      }
    });
  }

  @Bind()
  taskAction(dataParams) {
    const {
      tenantId,
      task: { detail = {} },
      form,
      dispatch,
      match,
    } = this.props;
    const taskDetails = detail;
    const data = dataParams || {};
    data.action = data.action || 'complete';
    if (taskDetails.delegationState === 'pending' && data.action !== 'delegate') {
      data.action = 'resolve';
    }
    const variables = [];
    if (data.action !== 'delegate') {
      const formVars = {};
      formVars.approveResult = data.approveResult || 'Approved';
      formVars.comment = form.getFieldValue('comment') || '';
      for (const k in formVars) {
        if ({}.hasOwnProperty.call(formVars, k)) {
          variables.push({ name: k, value: formVars[k] });
        }
      }
    }
    const params = {
      type: 'task/taskAgree',
      payload: {
        tenantId,
        variables,
        carbonCopyUsers: this.selectedCopyUsersCode,
        currentTaskId: taskDetails.id,
        assignee: data.targetUser || null,
        action: data.action,
        comment: form.getFieldValue('comment') || '',
        jumpTarget: data.jumpTarget || null,
        jumpTargetName: data.jumpTargetName || null,
      },
    };
    dispatch(params).then(res => {
      if (res) {
        notification.success();
        // todo审批完跳转到列表页面(并要刷新) 当列表界面和办理页面之间还有其他Tab标签页时，会跳到那个标签页
        this.setState(
          {
            drawerVisible: false,
          },
          () => {
            closeTab(`/hwfl/workflow/task/detail/${match.params.id}`);
            dispatch(routerRedux.push({ pathname: `/hwfl/workflow/task` }));
            // this.props.history.push( `/hwfl/workflow/task`);
          }
        );
      }
    });
  }

  // 渲染审批按钮
  @Bind()
  renderApproveBtn() {
    const { approveResult } = this.state;
    return (
      <React.Fragment>
        {approveResult.map(result => {
          let typeValue = 'default';
          if (result.action === 'Rejected') {
            typeValue = 'danger';
          } else if (result.action === 'Approved') {
            typeValue = 'primary';
          }
          return (
            <Button
              key={result.action}
              type={typeValue}
              // loading={approveLoading || refuseLoading}
              onClick={() => this.executeTaskAction(result.action)}
              style={{ marginRight: 12 }}
            >
              {result.name}
            </Button>
          );
        })}
      </React.Fragment>
    );
  }

  // 获取审批动作名称
  @Bind()
  getActionName(action) {
    const { approveResult } = this.state;
    let actionName = action;
    for (const result in approveResult) {
      if (action === approveResult[result].action) {
        actionName = approveResult[result].name;
        break;
      }
    }
    return actionName;
  }

  // 处理选择的抄送人显示格式
  @Bind()
  processCarbonCopy() {
    const {
      task: { changeEmployee = [] },
    } = this.props;
    this.setState({
      drawerVisible: false,
      carbonCopyUser: changeEmployee.slice(),
    });
    const carbonCopyUserNameList = changeEmployee.map(item => `${item.name}(${item.employeeNum})`);
    const carbonCopyUserCodeList = changeEmployee.map(item => item.employeeNum);
    this.selectedCarbonCopyUsers = carbonCopyUserNameList.toString();
    this.selectedCopyUsersCode = carbonCopyUserCodeList.toString();
    this.selectedCopyUsersId = changeEmployee.map(item => item.employeeId);
  }

  @Bind()
  handleCancel() {
    this.setState({
      drawerVisible: false,
    });
  }

  @Bind()
  showCarbonCopyModal() {
    const { carbonCopyUser } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'task/updateState',
      payload: { changeEmployee: carbonCopyUser },
    });
    this.setState({
      isCarbon: true,
      drawerVisible: true,
      delegateOrAddUser: intl.get('hwfl.task.view.option.addCc').d('添加抄送'),
    });
  }

  /**
   * 执行审批动作.
   * @param action 执行审批动作
   */
  executeTaskAction(action) {
    this.props.form.validateFields(err => {
      if (!err) {
        if (action === 'delegate' || action === 'addSign') {
          this.setState({
            drawerVisible: true,
            isCarbon: false,
            delegateOrAddUser: action,
          });
        } else {
          Modal.confirm({
            title: intl.get('hwfl.common.view.message.confirm').d('确认'),
            content: intl
              .get('hwfl.task.view.message.title.confirmTip', {
                actionName: this.getActionName(action),
              })
              .d(`确认${this.getActionName(action)}吗?`),
            onOk: () => {
              const { formInvokeFlag } = this.state;
              // 如果没有审批表单或不需要回调 直接执行审批动作；否则向审批表单界面发送审批意见消息,监听审批表单返回消息后再执行审批动作
              if (!formInvokeFlag) {
                this.taskAction({ approveResult: action });
              } else if (this.approveFormChildren) {
                // 向审批表单界面 发送审批意见消息
                this.approveFormChildren.iframePostMessage(action);
              }
            },
          });
        }
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator },
      approveLoading = false,
      fetchDetailLoading,
      fetchForecastLoading,
      fetchEmployeeLoading,
      task: {
        pagination = {},
        detail = {},
        employeeList = [],
        forecast = [],
        changeEmployee,
        uselessParam,
      },
      location = {},
      tenantId,
      match,
      dispatch,
    } = this.props;
    const { processInstance = {} } = detail;
    const { drawerVisible, delegateOrAddUser, isCarbon, currentDetailData } = this.state;

    const historyProps = {
      detail,
      loading: fetchDetailLoading,
    };
    const flowProps = {
      dispatch,
      location,
      forecast,
      tenantId,
      match,
      processInstance,
      uselessParam,
      loading: fetchForecastLoading,
    };
    const formProps = {
      tenantId,
      currentDetailData,
      ref: ref => {
        this.approveFormChildren = ref;
      },
      onAction: this.taskAction,
    };

    const employeeProps = {
      pagination,
      drawerVisible,
      tenantId,
      isCarbon,
      employeeList,
      changeEmployee,
      dispatch,
      delegateOrAddUser,
      approveLoading,
      disabledUserList: this.selectedCopyUsersId,
      loading: fetchEmployeeLoading,
      anchor: 'right',
      onCancel: this.handleCancel,
      getActionName: this.getActionName,
      processCarbonCopy: this.processCarbonCopy,
      taskAction: this.taskAction,
    };

    const priority =
      detail.priority < 34
        ? intl.get('hzero.common.priority.low').d('低')
        : detail.priority > 66
        ? intl.get('hzero.common.priority.high').d('高')
        : intl.get('hzero.common.priority.medium').d('中');
    const name = `${detail.assigneeName}(${detail.assignee})`;

    return (
      <Fragment>
        <Header
          title={intl.get('hwfl.task.view.message.title.detail').d('待办明细')}
          // backPath="/hwfl/workflow/task/"
        >
          {/* <Button icon="sync" onClick={() => this.handleSearch()}>
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button> */}
        </Header>

        <Content>
          <Spin spinning={fetchDetailLoading || approveLoading}>
            {/* 审批事项 */}
            <div className={classNames(styles['label-col'])}>
              {intl.get('hwfl.common.model.approval.item').d('审批事项')}
            </div>
            <Row
              style={{ borderBottom: '1px dashed #dcdcdc', paddingBottom: 4, marginBottom: 20 }}
              type="flex"
              justify="space-between"
              align="bottom"
            >
              <Col md={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hwfl.common.model.process.name').d('流程名称')}:
                  </Col>
                  <Col md={16}> {processInstance.processDefinitionName}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hwfl.common.model.process.ID').d('流程ID')}:
                  </Col>
                  <Col md={16}> {processInstance.id}</Col>
                  {/* <Col md={16}> {detail.processInstanceId}</Col>  猪齿鱼取得是id */}
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hwfl.common.model.apply.owner').d('申请人')}:
                  </Col>
                  <Col md={16}> {name}</Col>
                </Row>
              </Col>
            </Row>
            <Row
              style={{ borderBottom: '1px dashed #dcdcdc', paddingBottom: 4, marginBottom: 40 }}
              type="flex"
              justify="space-between"
              align="bottom"
            >
              <Col md={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hwfl.common.model.apply.time').d('申请时间')}:
                  </Col>
                  <Col md={16}> {detail.createTime}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hzero.common.priority').d('优先级')}:
                  </Col>
                  <Col md={16}> {priority}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hwfl.common.model.process.description').d('流程描述')}:
                  </Col>
                  <Col md={16}> {detail.description}</Col>
                </Row>
              </Col>
            </Row>

            {/* 审批表单 */}
            <div className={classNames(styles['label-col'])}>
              {intl.get('hwfl.common.model.approval.form').d('审批表单')}
            </div>
            <ApproveForm {...formProps} />
            <Tabs defaultActiveKey="1" animated={false} style={{ marginBottom: '20px' }}>
              <Tabs.TabPane
                tab={intl.get('hwfl.common.model.approval.history').d('审批历史')}
                key="1"
                forceRender
              >
                <ApproveHistory {...historyProps} />
              </Tabs.TabPane>
              <Tabs.TabPane
                tab={intl.get('hwfl.common.model.process.graph').d('流程图')}
                key="2"
                forceRender
              >
                <FlowChart {...flowProps} />
              </Tabs.TabPane>
            </Tabs>
            <Form style={{ marginTop: 20 }}>
              <div>
                <span
                  style={{
                    marginRight: '24px',
                    lineHeight: '40px',
                    color: 'rgb(0,0,0,0.85)',
                    fontWeight: 'bold',
                  }}
                >
                  {intl.get('hwfl.task.view.message.carbonCopyUsers').d('抄送人')}:
                </span>
                <span>
                  <Button icon="plus" className="label-btn" onClick={this.showCarbonCopyModal}>
                    {intl.get('hwfl.task.view.option.addCc').d('添加抄送')}
                  </Button>
                </span>
              </div>
              <Form.Item>
                {getFieldDecorator('carbonCopyUsers', {
                  initialValue: this.selectedCarbonCopyUsers,
                })(<TextArea disabled />)}
              </Form.Item>
              <Form.Item label={intl.get('hwfl.common.model.approval.opinion').d('审批意见')}>
                {getFieldDecorator('comment', {
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hwfl.task.view.message.comment').d('请求编码'),
                      }),
                    },
                  ],
                })(<TextArea maxLength={200} />)}
              </Form.Item>

              {this.renderApproveBtn()}
            </Form>
            <EmployeeDrawer {...employeeProps} />
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
