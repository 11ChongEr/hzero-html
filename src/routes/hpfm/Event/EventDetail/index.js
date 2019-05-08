/**
 * Event - 事件编辑界面
 * @date: 2018-6-20
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Form, Table, Col, Row, Input, Modal } from 'hzero-ui';
import { connect } from 'dva';
import { omit } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import Switch from 'components/Switch';

import { enableRender, yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';

import EventRuleForm from './EventRuleForm';

@formatterCollections({
  code: 'hpfm.event',
})
@connect(({ event, loading }) => ({
  event,
  tenantId: getCurrentOrganizationId(),
  eventSaving: loading.effects['event/updateEvent'],
  ruleSaving: loading.effects['event/updateRule'],
}))
@Form.create({ fieldNameProp: null })
export default class EditForm extends PureComponent {
  state = {
    selectedRowKeys: [],
    event: {},
    rule: {},
    selectedRows: [],
  };

  eventRuleForm;

  componentDidMount() {
    this.loadEvent();
  }

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
      }
    });
  }

  @Bind()
  showCreateModal() {
    const { match } = this.props;
    this.showEditModal({
      eventId: match.params.id,
    });
  }

  @Bind()
  deleteEventRule() {
    const { dispatch, match, tenantId } = this.props;
    const { selectedRows } = this.state;
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk: () => {
        dispatch({
          type: 'event/action',
          method: 'removeRule',
          payload: {
            tenantId,
            selectedRows,
            eventId: match.params.id,
          },
        }).then(res => {
          if (res) {
            this.setState({
              selectedRowKeys: [],
              selectedRows: [],
            });
            this.loadEvent();
            notification.success();
          }
        });
      },
    });
  }

  @Bind()
  showEditModal(rule) {
    this.setState({
      rule,
    });
    this.showModal();
  }

  @Bind()
  saveEvent() {
    const { form, dispatch, tenantId } = this.props;
    const { event } = this.state;
    if (event.eventId) {
      dispatch({
        type: 'event/updateEvent',
        payload: {
          tenantId,
          ...omit(event, ['ruleList']),
          ...form.getFieldsValue(),
        },
      }).then(response => {
        if (response) {
          notification.success();
          this.loadEvent();
        }
      });
    }
  }

  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  @Bind()
  showModal() {
    this.handleModalVisible(true);
  }

  @Bind()
  hideModal() {
    const { ruleSaving } = this.props;
    if (!ruleSaving) {
      this.handleModalVisible(false);
      // this.setState({
      //   rule:{}
      // })
    }
  }

  handleModalVisible(flag) {
    const { dispatch } = this.props;
    if (flag === false && this.eventRuleForm) {
      this.eventRuleForm.resetForm();
    }

    dispatch({
      type: 'event/updateState',
      payload: {
        ruleModalVisible: !!flag,
      },
    });
  }

  @Bind()
  handleAdd(fieldsValue) {
    const { dispatch, tenantId } = this.props;
    const { rule = {} } = this.state;
    const data = {
      tenantId,
      ...rule,
      ...fieldsValue,
    };
    dispatch({
      type: 'event/updateRule',
      payload: data,
    }).then(res => {
      if (res) {
        this.loadEvent();
        this.hideModal();
        notification.success();
      }
    });
  }

  render() {
    const columns = [
      {
        title: intl.get('hpfm.event.model.eventRule.rule').d('匹配规则'),
        dataIndex: 'matchingRule',
      },
      {
        title: intl.get('hpfm.event.model.eventRule.callType').d('调用类型'),
        align: 'center',
        width: 100,
        dataIndex: 'callTypeMeaning',
      },
      {
        title: intl.get('hpfm.event.model.eventRule.syncFlag').d('是否同步'),
        dataIndex: 'syncFlag',
        align: 'center',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get('hpfm.event.model.eventRule.orderSeq').d('顺序'),
        align: 'center',
        width: 75,
        dataIndex: 'orderSeq',
      },
      {
        title: intl.get('hpfm.event.model.eventRule.resultFlag').d('返回结果'),
        dataIndex: 'resultFlag',
        align: 'center',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        align: 'center',
        width: 75,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        width: 75,
        render: (_, record) => (
          <span className="action-link">
            <a
              onClick={() => {
                this.showEditModal(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          </span>
        ),
      },
    ];

    const {
      event: { ruleModalVisible },
      match,
      eventSaving = false,
      ruleSaving = false,
    } = this.props;

    const { event, selectedRowKeys, rule } = this.state;
    const { ruleList = [] } = event;

    const { getFieldDecorator } = this.props.form;
    const basePath = match.path.substring(0, match.path.indexOf('/detail'));

    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleRowSelectChange,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('hpfm.event.view.detail.title').d('事件规则')}
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
                  {getFieldDecorator('enabledFlag')(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label={intl.get('hpfm.event.model.event.description').d('事件描述')}>
              {getFieldDecorator('eventDescription')(<Input />)}
            </Form.Item>
          </Form>
          <div className="table-list-operator">
            <Button icon="plus" onClick={this.showCreateModal}>
              {intl.get('hpfm.event.view.detail.button.create').d('新建规则')}
            </Button>
            <Button
              icon="delete"
              disabled={selectedRowKeys.length === 0}
              onClick={this.deleteEventRule}
            >
              {intl.get('hpfm.event.view.detail.button.remove').d('删除规则')}
            </Button>
          </div>
          <Table
            rowKey="eventRuleId"
            rowSelection={rowSelection}
            dataSource={ruleList}
            columns={columns}
            bordered
            pagination={false}
          />
          <div style={{ marginTop: '24px' }}>
            <Button loading={eventSaving} type="primary" onClick={this.saveEvent}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </div>
        </Content>
        <EventRuleForm
          title={
            rule.ruleId
              ? intl.get('hpfm.event.view.detail.button.edit').d('编辑规则')
              : intl.get('hpfm.event.view.detail.button.create').d('新增规则')
          }
          eventRule={rule}
          sideBar
          onRef={ref => {
            this.eventRuleForm = ref;
          }}
          handleAdd={this.handleAdd}
          confirmLoading={ruleSaving}
          modalVisible={ruleModalVisible}
          hideModal={this.hideModal}
        />
      </React.Fragment>
    );
  }
}
