/**
 * Event - 事件规则
 * @date: 2018-6-20
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Form, Input, Button, Modal } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { Header } from 'components/Page';
import SearchPage from 'components/SearchPage';
import ExcelExport from 'components/ExcelExport';

import { enableRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { HZERO_PLATFORM } from 'utils/config';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';

import EventCreateForm from './EventCreateForm';

const FormItem = Form.Item;

@formatterCollections({
  code: 'hpfm.event',
})
@connect(({ event, loading }) => ({
  event,
  tenantId: getCurrentOrganizationId(),
  list: event.list,
  loading: loading.effects['event/query'],
  saving: loading.effects['event/action'],
}))
export default class EventList extends SearchPage {
  createForm;

  @Bind()
  pageConfig() {
    const { tenantId } = this.props;
    return {
      modelName: 'event',
      searchDispatch: 'event/query',
      cacheKey: '/hpfm/event/list',
      otherParams: { tenantId },
    };
  }

  @Bind()
  showModal() {
    this.handleModalVisible(true);
  }

  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.handleModalVisible(false);
    }
  }

  handleModalVisible(flag) {
    const { dispatch } = this.props;
    if (flag === false && this.createForm) {
      this.createForm.resetForm();
    }
    dispatch({
      type: 'event/updateState',
      payload: {
        modalVisible: !!flag,
      },
    });
  }

  @Bind()
  handleAdd(fieldsValue) {
    const { history, dispatch, tenantId } = this.props;
    dispatch({
      type: 'event/action',
      method: 'addEvent',
      payload: { tenantId, ...fieldsValue },
    }).then(response => {
      if (response) {
        this.hideModal();
        history.push(`/hpfm/event/detail/${response.eventId}`);
      }
    });
  }

  @Bind()
  deleteEvent() {
    const { selectedRows } = this.state;
    const {
      dispatch,
      tenantId,
      event: { pagination = {} },
    } = this.props;
    const onOk = () => {
      dispatch({
        type: 'event/action',
        method: 'remove',
        payload: { selectedRows, tenantId },
      }).then(() => {
        this.setState({
          selectedRows: [],
        });
        this.handleSearch(pagination);
        notification.success();
      });
    };

    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  renderForm(form) {
    const { getFieldDecorator } = form;
    return (
      <React.Fragment>
        <FormItem label={intl.get('hpfm.event.model.event.code').d('事件编码')}>
          {getFieldDecorator('eventCode')(
            <Input typeCase="upper" trim inputChinese={false} style={{ width: '150px' }} />
          )}
        </FormItem>
        <FormItem label={intl.get('hpfm.event.model.event.description').d('事件描述')}>
          {getFieldDecorator('eventDescription')(<Input style={{ width: '250px' }} />)}
        </FormItem>
      </React.Fragment>
    );
  }

  renderOther() {
    const {
      event: { modalVisible },
      saving,
    } = this.props;
    return (
      <EventCreateForm
        title={intl.get('hpfm.event.view.createForm.title').d('创建事件')}
        onRef={ref => {
          this.createForm = ref;
        }}
        handleAdd={this.handleAdd}
        confirmLoading={saving}
        modalVisible={modalVisible}
        hideModal={this.hideModal}
      />
    );
  }

  renderHeader() {
    const { tenantId } = this.props;
    const { selectedRows = [] } = this.state;
    const form = this.filterForm && this.filterForm.props && this.filterForm.props.form;
    const params = isUndefined(form) ? {} : form.getFieldsValue();
    return (
      <Header title={intl.get('hpfm.event.view.list.title').d('事件管理')}>
        <Button icon="plus" type="primary" onClick={this.showModal}>
          {intl.get('hzero.common.button.create').d('新建')}
        </Button>
        <Button icon="delete" disabled={selectedRows.length === 0} onClick={this.deleteEvent}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
        <ExcelExport
          requestUrl={`${HZERO_PLATFORM}/v1/${
            isTenantRoleLevel() ? `${tenantId}/events/export` : 'events/export'
          }`}
          queryParams={params}
        />
      </Header>
    );
  }

  tableProps() {
    const { history, loading } = this.props;
    const columns = [
      {
        title: intl.get('hpfm.event.model.event.code').d('事件编码'),
        width: 200,
        dataIndex: 'eventCode',
        filterField: true,
      },
      {
        title: intl.get('hpfm.event.model.event.description').d('事件描述'),
        minWidth: 200,
        dataIndex: 'eventDescription',
        filterField: true,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        align: 'center',
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
        filterField: true,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        filterBar: true,
        width: 200,
        render: (_, record) => (
          <span className="action-link">
            <a
              onClick={() => {
                history.push(`/hpfm/event/detail/${record.eventId}`);
              }}
            >
              {intl.get('hpfm.event.model.event.processMaintain').d('事件维护')}
            </a>
            <a
              onClick={() => {
                history.push(`/hpfm/event/message/${record.eventId}`);
              }}
            >
              {intl.get('hpfm.event.model.event.messageMaintain').d('消息维护')}
            </a>
          </span>
        ),
      },
    ];
    return {
      rowKey: 'eventId',
      customCode: 'EVENT_TABLE',
      loading,
      columns,
    };
  }
}
