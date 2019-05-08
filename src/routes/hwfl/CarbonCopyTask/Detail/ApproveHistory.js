import React, { PureComponent } from 'react';
import { Form, Table } from 'hzero-ui';

import intl from 'utils/intl';
import { dateRender, approveNameRender } from 'utils/renderer';

@Form.create({ fieldNameProp: null })
export default class ApproveHistory extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { detail = {} } = this.props;

    const columns = [
      {
        title: intl.get('hwfl.common.model.approval.action').d('审批动作'),
        dataIndex: 'action',
        width: 100,
        align: 'center',
        render: approveNameRender,
      },
      {
        title: intl.get('hwfl.common.model.approval.step').d('审批环节'),
        dataIndex: 'name',
      },
      {
        title: intl.get('hwfl.common.model.approval.owner').d('	审批人'),
        dataIndex: 'assigneeName',
        width: 150,
      },
      {
        title: intl.get('hwfl.common.model.approval.opinion').d('审批意见'),
        dataIndex: 'comment',
        width: 150,
        align: 'center',
      },
      {
        title: intl.get('hwfl.common.model.approval.time').d('审批时间'),
        dataIndex: 'endTime',
        width: 180,
        align: 'center',
        render: dateRender,
      },
    ];
    return (
      <Table
        bordered
        rowKey="id"
        // loading={loading}
        columns={columns}
        dataSource={detail.historicTaskList}
        pagination={false}
      />
    );
  }
}
