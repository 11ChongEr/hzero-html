import React, { PureComponent, Fragment } from 'react';
import { Form, Table } from 'hzero-ui';

import intl from 'utils/intl';
import { dateRender, approveNameRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

@Form.create({ fieldNameProp: null })
export default class TaskDetail extends PureComponent {
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
        render: approveNameRender,
      },
      {
        title: intl.get('hwfl.common.model.approval.step').d('审批环节'),
        dataIndex: 'name',
      },
      {
        title: intl.get('hwfl.common.model.approval.owner').d('审批人'),
        dataIndex: 'assigneeName',
        width: 150,
      },
      {
        title: intl.get('hwfl.common.model.approval.opinion').d('审批意见'),
        dataIndex: 'comment',
        width: 150,
      },
      {
        title: intl.get('hwfl.common.model.approval.time').d('审批时间'),
        dataIndex: 'endTime',
        width: 180,
        render: dateRender,
      },
    ];
    return (
      <Fragment>
        <Table
          bordered
          rowKey="id"
          pagination={false}
          // loading={loading}
          dataSource={detail.historicTaskList}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
        />
      </Fragment>
    );
  }
}
