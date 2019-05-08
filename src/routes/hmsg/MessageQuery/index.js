/**
 * MessageQuery - 消息查询列表
 * @date: 2018-7-29
 * @author: CJ <juan.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { isTenantRoleLevel } from 'utils/utils';

import ContentView from './ContentView';
import RecipientView from './RecipientView';
import ListTable from './ListTable';
import QueryForm from './QueryForm';

/**
 * 消息查询数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} formValues - 查询表单值
 * @reactProps {Object} recordData - 表格中信息的一条记录
 * @return React.element
 */
@connect(({ messageQuery, loading }) => ({
  messageQuery,
  tenantRoleLevel: isTenantRoleLevel(),
  queryMessageLoading: loading.effects['messageQuery/queryMessageList'],
  queryRecipientLoading: loading.effects['messageQuery/queryRecipient'],
}))
@withRouter
@formatterCollections({ code: ['hmsg.messageQuery', 'entity.tenant'] })
export default class MessageQuery extends PureComponent {
  state = {
    formValues: {},
    contentVisible: false, // 内容和错误模态框是否可见
    recipientVisible: false, // 收件人模态框是否可见
    isContent: true, // 是否为内容
    recordData: {},
  };

  /**
   * 初始化数据
   *
   * @memberof MessageQuery
   */
  componentDidMount() {
    this.handleQueryMessage();
    this.props.dispatch({
      type: 'messageQuery/init',
    });
  }

  /**
   * 获取消息列表
   *
   * @param {*} [params={}]
   * @memberof MessageQuery
   */
  @Bind()
  handleQueryMessage(params = {}) {
    const { dispatch } = this.props;
    dispatch({
      type: 'messageQuery/queryMessageList',
      payload: params,
    });
  }

  /**
   * 点击内容查看模态框
   *
   * @param {*} record
   * @memberof MessageQuery
   */
  @Bind()
  handleOpenContentModal(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'messageQuery/queryContent',
      payload: record.messageId,
    });
    this.setState({
      isContent: true,
      contentVisible: true,
    });
  }

  /**
   * 确认内容和错误模态框
   *
   * @memberof MessageQuery
   */
  @Bind()
  handleOk() {
    const { isContent } = this.state;
    this.setState({
      contentVisible: false,
      isContent: !isContent,
    });
  }

  /**
   * 收件人查看数据
   *
   * @param {*} record
   * @memberof MessageQuery
   */
  @Bind()
  handleOpenRecipientModal(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'messageQuery/queryRecipient',
      payload: record,
    });
    this.setState({
      recipientVisible: true,
      recordData: record,
    });
  }

  /**
   * 确认收件人模态框
   *
   * @memberof MessageQuery
   */
  @Bind()
  handleRecipientOk() {
    this.setState({
      recipientVisible: false,
    });
  }

  /**
   * 点击错误查看模态框
   *
   * @param {*} record
   * @memberof MessageQuery
   */
  @Bind()
  handleOpenErrorModal(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'messageQuery/queryError',
      payload: record.transactionId,
    });
    this.setState({
      isContent: false,
      contentVisible: true,
    });
  }

  /**
   * 重试
   *
   * @param {*} record
   * @memberof MessageQuery
   */
  @Bind()
  handleResendMessage(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'messageQuery/resendMessage',
      payload: record.transactionId,
    }).then(res => {
      if (res) {
        notification.success();
      }
    });
  }

  /**
   * 获取表单的值
   *
   * @param {*} values
   * @memberof MessageQuery
   */
  @Bind()
  storeFormValues(values) {
    this.setState({
      formValues: { ...values },
    });
  }

  render() {
    const {
      queryMessageLoading,
      queryRecipientLoading,
      messageQuery: {
        messageData = {},
        content = {},
        recipientData = {},
        error = {},
        statusList = [],
        messageTypeList = [],
      },
      tenantRoleLevel,
    } = this.props;
    const {
      contentVisible,
      recipientVisible,
      isContent,
      recordData = {},
      formValues = {},
    } = this.state;
    const formProps = {
      messageTypeList,
      statusList,
      tenantRoleLevel,
      onQueryMessage: this.handleQueryMessage,
      onStoreFormValues: this.storeFormValues,
    };
    const tableProps = {
      messageData,
      formValues,
      tenantRoleLevel,
      loading: queryMessageLoading,
      onOpenRecipientModal: this.handleOpenRecipientModal,
      onOpenContentModal: this.handleOpenContentModal,
      onOpenErrorModal: this.handleOpenErrorModal,
      onQueryMessage: this.handleQueryMessage,
      onResendMessage: this.handleResendMessage,
    };
    const contentViewProps = {
      isContent,
      contentVisible,
      content,
      error,
      onOk: this.handleOk,
    };
    const recipientViewProps = {
      recipientVisible,
      recipientData,
      recordData,
      loading: queryRecipientLoading,
      onOk: this.handleRecipientOk,
      onOpenRecipientModal: this.handleOpenRecipientModal,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hmsg.messageQuery.view.message.title').d('消息查询')} />
        <Content>
          <div className="table-list-search">
            <QueryForm {...formProps} />
          </div>
          <ListTable {...tableProps} />
        </Content>
        <ContentView {...contentViewProps} />
        <RecipientView {...recipientViewProps} />
      </React.Fragment>
    );
  }
}
