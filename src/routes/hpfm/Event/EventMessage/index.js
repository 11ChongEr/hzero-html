/**
 * Event - 事件消息界面
 * @date: 2018-6-20
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Form, Table, Col, Row, Input, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { filter } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';
import Switch from 'components/Switch';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { enableRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';

import EventMessageForm from './EventMessageForm';

@formatterCollections({
  code: ['hpfm.event'],
})
@connect(({ event, loading }) => ({
  event,
  tenantId: getCurrentOrganizationId(),
  getMessageListLoading: loading.effects['event/getMessageList'],
  saving: loading.effects['event/createMessage'] || loading.effects['event/updateMessage'],
}))
@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  state = {
    selectedRowKeys: [],
    messageVisible: false,
    itemData: {},
    event: {},
  };

  componentDidMount() {
    this.fetchMessageTypeCode();
    this.loadEvent();
  }

  /**
   *获取消息类型
   */
  @Bind()
  fetchMessageTypeCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'event/fetchMessageTypeCode',
    });
  }

  /**
   * 查询消息列表
   *
   * @memberof EditForm
   */
  @Bind()
  queryMessageList() {
    const { dispatch, tenantId } = this.props;
    const { event } = this.state;
    dispatch({
      type: 'event/getMessageList',
      payload: { eventCode: event.eventCode, tenantId },
    });
  }

  /**
   * 查询事件
   *
   * @memberof EditForm
   */
  @Bind()
  loadEvent() {
    const { form, dispatch, match, tenantId } = this.props;
    dispatch({
      type: 'event/getEvent',
      payload: { id: match.params.id, tenantId },
    }).then(res => {
      if (res) {
        this.setState({
          event: res,
        });
        const formValues = {
          eventCode: res.eventCode,
          eventDescription: res.eventDescription,
          enabledFlag: res.enabledFlag,
        };
        form.setFieldsValue(formValues);
        this.queryMessageList();
      }
    });
  }

  /**
   * 新增消息模态框
   *
   * @memberof EditForm
   */
  @Bind()
  showCreateModal() {
    this.setState({
      messageVisible: true,
    });
  }

  /**
   * 打开编辑模态框
   * @param {*} record
   * @memberof EditForm
   */
  @Bind()
  showEditModal(record) {
    this.setState({
      itemData: { ...record },
      messageVisible: true,
    });
  }

  /**
   * 关闭模态框
   *
   * @memberof EditForm
   */
  @Bind()
  hideModal() {
    this.setState({
      messageVisible: false,
      itemData: {},
    });
  }

  /**
   * 新增消息
   *
   * @param {*} fieldsValue
   * @memberof EditForm
   */
  @Bind()
  handleAdd(fieldsValue) {
    const { dispatch, match, tenantId } = this.props;
    const { event } = this.state;
    const data = {
      tenantId,
      eventId: match.params.id,
      eventCode: event.eventCode,
      ...fieldsValue,
    };
    dispatch({
      type: 'event/createMessage',
      payload: data,
    }).then(res => {
      if (res) {
        this.hideModal();
        notification.success();
        this.queryMessageList();
      }
    });
  }

  /**
   * 更新消息
   *
   * @param {*} fieldsValue
   * @memberof EditForm
   */
  @Bind()
  handleEdit(fieldsValue) {
    const { dispatch, tenantId } = this.props;
    const { objectVersionNumber, eventId } = this.state.itemData;
    const data = {
      tenantId,
      eventId,
      objectVersionNumber,
      ...fieldsValue,
    };
    dispatch({
      type: 'event/updateMessage',
      payload: data,
    }).then(res => {
      if (res) {
        this.hideModal();
        notification.success();
        this.queryMessageList();
      }
    });
  }

  /**
   * 批量删除消息
   *
   * @memberof EditForm
   */
  @Bind()
  deleteEventMessage() {
    const {
      dispatch,
      tenantId,
      event: { messageList = {} },
    } = this.props;
    const { content } = messageList;
    const { selectedRowKeys } = this.state;
    const newMessageList = filter(content, item => {
      return selectedRowKeys.indexOf(item.messageEventId) >= 0;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        dispatch({
          type: 'event/deleteMessages',
          payload: {
            tenantId,
            messageEvents: newMessageList,
          },
        }).then(res => {
          if (res) {
            notification.success();
            this.queryMessageList();
            this.setState({
              selectedRowKeys: [],
            });
          }
        });
      },
    });
  }

  /**
   * 获取删除选中行
   *
   * @param {*} selectedRowKeys
   * @memberof EditForm
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  render() {
    const {
      match,
      saving,
      getMessageListLoading,
      event: { messageList = {}, messageTypeCode = [] },
    } = this.props;
    const { selectedRowKeys, messageVisible, itemData = {} } = this.state;

    const { getFieldDecorator } = this.props.form;
    const basePath = match.path.substring(0, match.path.indexOf('/message'));

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
    };
    const messageProps = {
      messageVisible,
      itemData,
      messageTypeCode,
      saving,
      onOk: this.handleAdd,
      onEditOk: this.handleEdit,
      onCancel: this.hideModal,
    };
    const columns = [
      {
        title: intl.get('hpfm.event.model.eventMessage.receiverTypeId').d('接收者类型'),
        dataIndex: 'receiverTypeName',
        width: 200,
      },
      {
        title: intl.get('hpfm.event.model.eventMessage.tempServerId').d('消息模板账户'),
        dataIndex: 'messageName',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        align: 'center',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        width: 100,
        render: (_, record) => (
          <a
            onClick={() => {
              this.showEditModal(record);
            }}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];
    return (
      <React.Fragment>
        <Header
          title={intl.get('hpfm.event.view.message.title').d('事件消息')}
          backPath={`${basePath}/list`}
        />
        <Content>
          <Form layout="vertical" style={{ width: '440px' }}>
            <Row>
              <Col span={12}>
                <Form.Item label={intl.get('hpfm.event.model.event.code').d('事件编码')}>
                  {getFieldDecorator('eventCode')(<Input disabled style={{ width: '220px' }} />)}
                </Form.Item>
              </Col>
              <Col span={4} offset={2}>
                <Form.Item label={intl.get('hzero.common.status.enable').d('启用')}>
                  {getFieldDecorator('enabledFlag')(<Switch disabled />)}
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label={intl.get('hpfm.event.model.event.description').d('事件描述')}>
              {getFieldDecorator('eventDescription')(<Input disabled />)}
            </Form.Item>
          </Form>
          <div className="table-list-operator">
            <Button icon="plus" onClick={this.showCreateModal}>
              {intl.get('hpfm.event.view.message.button.create').d('新增消息')}
            </Button>
            <Button
              icon="minus"
              onClick={this.deleteEventMessage}
              disabled={selectedRowKeys.length === 0}
            >
              {intl.get('hpfm.event.view.message.button.remove').d('删除消息')}
            </Button>
          </div>
          <Table
            bordered
            rowKey="messageEventId"
            rowSelection={rowSelection}
            dataSource={messageList.content}
            columns={columns}
            pagination={false}
            loading={getMessageListLoading}
          />
        </Content>
        <EventMessageForm {...messageProps} />
      </React.Fragment>
    );
  }
}
