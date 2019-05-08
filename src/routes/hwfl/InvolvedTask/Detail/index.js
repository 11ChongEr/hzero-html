/**
 * Detail - 我参与的流程 明细
 * @date: 2018-8-31
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Form, Modal, Button, Tabs, Row, Col, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';

import { Header, Content } from 'components/Page';

import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { closeTab } from 'utils/menuTab';

import ApproveHistory from './ApproveHistory';
import ApproveForm from './ApproveForm';
import FlowChart from './FlowChart';
import styles from './index.less';

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['hwfl.involvedTask', 'hwfl.common', 'entity.position', 'entity.department'],
})
@connect(({ involvedTask, loading }) => ({
  involvedTask,
  fetchDetailLoading: loading.effects['involvedTask/fetchDetail'],
  fetchForecast: loading.effects['involvedTask/fetchForecast'],
  tenantId: getCurrentOrganizationId(),
}))
export default class Detail extends Component {
  state = {
    detailData: {},
  };

  approveFormChildren;

  /**
   * 生命周期函数
   *render调用后，获取页面展示数据
   */
  componentDidMount() {
    // const { dispatch, tenantId, match } = this.props;
    this.handleSearch();

    // dispatch({
    //   type: 'involvedTask/fetchForecast',
    //   payload: {
    //     tenantId,
    //     id: match.params.id,
    //   },
    // });
  }

  @Bind()
  handleSearch() {
    const { dispatch, match, tenantId } = this.props;
    dispatch({
      type: 'involvedTask/fetchDetail',
      payload: {
        tenantId,
        id: match.params.id,
      },
    }).then(res => {
      if (res) {
        this.setState({ detailData: res });
      }
    });
  }

  @Bind()
  executeTaskAction() {
    const { tenantId, match, dispatch } = this.props;
    Modal.confirm({
      title: intl.get('hwfl.common.view.message.confirm').d('确认'),
      content: intl.get('hwfl.involvedTask.view.message.title.confirmBack').d(`确认撤回吗?`),
      onOk: () => {
        const params = {
          type: 'involvedTask/taskRecall',
          payload: {
            tenantId,
            processInstanceId: match.params.id,
          },
        };
        dispatch(params).then(res => {
          if (res) {
            notification.success();
            this.props.history.push(`/hwfl/workflow/involved-task`);
            closeTab(`/hwfl/workflow/involved-task/detail/${match.params.id}`);
          }
        });
      },
    });
  }

  renderApproveBtn() {
    const { detailData } = this.state;
    if (detailData.recall && detailData.recall === true) {
      return (
        <Button type="primary" onClick={() => this.executeTaskAction('recall')}>
          {intl.get('hwfl.common.view.message.recall').d('撤回')}
        </Button>
      );
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      dispatch,
      fetchDetailLoading,
      fetchForecast,
      tenantId,
      match,
      involvedTask: { detail = {}, forecast = [], uselessParam },
    } = this.props;

    const historyProps = {
      detail,
      loading: fetchDetailLoading,
    };
    const flowProps = {
      dispatch,
      match,
      tenantId,
      forecast,
      detail,
      uselessParam,
      loading: fetchForecast,
    };
    const formProps = {
      detail,
      ref: ref => {
        this.approveFormChildren = ref;
      },
      onAction: this.taskAction,
    };

    const priority =
      detail.priority < 34
        ? intl.get('hzero.common.priority.low').d('低')
        : detail.priority > 66
        ? intl.get('hzero.common.priority.high').d('高')
        : intl.get('hzero.common.priority.medium').d('中');
    const name = `${detail.startUserName}(${detail.startUserId})`;

    return (
      <Fragment>
        <Header
          title={intl.get('hwfl.common.model.process.detail').d('流程明细')}
          // backPath="/hwfl/workflow/involved-task/"
        >
          {/* <Button icon="sync" onClick={() => this.handleSearch()}>
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button> */}
        </Header>
        <Content>
          <Spin spinning={fetchDetailLoading}>
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
                  <Col md={16}> {detail.processName}</Col>
                </Row>
              </Col>
              <Col md={8}>
                <Row>
                  <Col md={6} style={{ color: '#999' }}>
                    {intl.get('hwfl.common.model.process.ID').d('流程ID')}:
                  </Col>
                  <Col md={16}> {detail.id}</Col>
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
                  <Col md={16}> {detail.startTime}</Col>
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

            <Tabs defaultActiveKey="1" animated={false}>
              <Tabs.TabPane
                tab={intl.get('hwfl.common.model.approval.history').d('审批历史')}
                key="1"
              >
                <ApproveHistory {...historyProps} />
              </Tabs.TabPane>
              <Tabs.TabPane tab={intl.get('hwfl.common.model.process.graph').d('流程图')} key="2">
                <FlowChart {...flowProps} />
              </Tabs.TabPane>
            </Tabs>
            {this.renderApproveBtn()}
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
