import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';

import intl from 'utils/intl';
import { processStatusRender, dateTimeRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

/**
 * 参与流程数据列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onChange - 分页查询
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {Object} pagination - 分页器
 * @reactProps {Number} pagination.current - 当前页码
 * @reactProps {Number} pagination.pageSize - 分页大小
 * @reactProps {Number} pagination.total - 数据总量
 * @return React.element
 */
export default class ListTable extends PureComponent {
  /**
   * 详情
   * @param {object} record - 头数据
   */
  changeDetail(record) {
    this.props.onDetail(record);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource = [], pagination = {}, onChange } = this.props;
    const columns = [
      {
        title: intl.get('hwfl.common.model.process.ID').d('流程ID'),
        dataIndex: 'id',
        width: 150,
      },
      {
        title: intl.get('hwfl.common.model.process.status').d('流程状态'),
        dataIndex: 'templateCode',
        width: 100,
        render: (val, record) => processStatusRender(record),
      },
      {
        title: intl.get('hwfl.common.model.process.name').d('流程名称'),
        dataIndex: 'processName',
        width: 150,
      },
      {
        title: intl.get('hwfl.common.model.process.description').d('流程描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hwfl.common.view.message.current.stage').d('当前节点'),
        dataIndex: 'taskName',
        width: 150,
      },
      {
        title: intl.get('hwfl.common.model.apply.owner').d('申请人'),
        dataIndex: 'startUserName',
        width: 150,
        render: (val, record) => (
          <span>
            {val}({record.startUserId})
          </span>
        ),
      },
      {
        title: intl.get('hwfl.common.view.message.handler').d('当前处理人'),
        dataIndex: 'currentApprover',
        width: 150,
      },
      {
        title: intl.get('hwfl.involvedTask.model.involvedTask.startTime').d('创建时间'),
        dataIndex: 'startTime',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('hwfl.involvedTask.model.involvedTask.endTime').d('结束时间'),
        dataIndex: 'endTime',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 85,
        fixed: 'right',
        render: (_, record) => (
          <span className="action-link">
            <a onClick={() => this.changeDetail(record)}>
              {intl.get('hwfl.common.view.message.detail').d('详情')}
            </a>
          </span>
        ),
      },
    ];
    return (
      <Table
        bordered
        rowKey="id"
        loading={loading}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onChange}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
      />
    );
  }
}
