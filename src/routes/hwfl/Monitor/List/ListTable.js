import React, { PureComponent } from 'react';
import { Table, Icon, Menu, Dropdown } from 'hzero-ui';
import { processStatusRender, dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';

/**
 * 监控流程数据列表
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
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      dataSource = [],
      pagination = {},
      onChange,
      onDetail,
      onSuspendedReason,
      onStop,
      onSuspend,
      onResume,
      onRetry,
      onDelegate,
      onJumpNode,
    } = this.props;

    const columns = [
      {
        title: intl.get('hwfl.common.model.process.ID').d('流程ID'),
        dataIndex: 'id',
        width: 100,
      },
      {
        title: intl.get('hwfl.common.model.process.status').d('流程状态'),
        dataIndex: 'suspended',
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
        title: intl.get('hwfl.monitor.model.monitor.startTime').d('创建时间'),
        dataIndex: 'startTime',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('hwfl.monitor.model.monitor.endTime').d('结束时间'),
        dataIndex: 'endTime',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('hwfl.monitor.model.monitor.exceptionMsgHead').d('挂起原因'),
        dataIndex: 'exceptionMsgHead',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        fixed: 'right',
        render: (_, record) => {
          const result = [];
          const detailDom = (
            <Menu.Item key={`${record.id}_detailDom`}>
              <a onClick={() => onDetail(record)}>
                {intl.get('hwfl.common.view.message.detail').d('详情')}
              </a>
            </Menu.Item>
          );

          const stopDom = (
            <Menu.Item key={`${record.id}_stopDom`}>
              <a
                onClick={() => {
                  onStop(record.id, 'stopProcess');
                }}
              >
                {intl.get('hwfl.monitor.view.option.stop').d('终止流程')}
              </a>
            </Menu.Item>
          );

          const resumeDom = (
            <Menu.Item key={`${record.id}_resumeDom`}>
              <a
                onClick={() => {
                  onResume(record.id, 'resumeProcess');
                }}
              >
                {intl.get('hwfl.monitor.view.option.resume').d('恢复流程')}
              </a>
            </Menu.Item>
          );

          const suspendReasonDom = (
            <Menu.Item key={`${record.id}_suspendReasonDom`}>
              <a
                onClick={() => {
                  onSuspendedReason(record.id);
                }}
              >
                {intl.get('hwfl.monitor.view.option.suspendedDetail').d('挂起详情')}
              </a>
            </Menu.Item>
          );

          const retryDom = (
            <Menu.Item key={`${record.id}_retryDom`}>
              <a
                onClick={() => {
                  onRetry(record);
                }}
              >
                {intl.get('hwfl.monitor.view.option.retry').d('审批重试')}
              </a>
            </Menu.Item>
          );

          const suspendDom = (
            <Menu.Item key={`${record.id}_suspendDom`}>
              <a
                onClick={() => {
                  onSuspend(record.id, 'suspendProcess');
                }}
              >
                {intl.get('hwfl.common.view.option.suspend').d('挂起')}
              </a>
            </Menu.Item>
          );

          const delegateDom = (
            <Menu.Item key={`${record.id}_delegateDom`}>
              <a
                onClick={() => {
                  onDelegate(record);
                }}
              >
                {intl.get('hwfl.monitor.view.option.delegate').d('转交')}
              </a>
            </Menu.Item>
          );

          const jumpDom = (
            <Menu.Item key={`${record.id}_jumpDom`}>
              <a
                onClick={() => {
                  onJumpNode(record);
                }}
              >
                {intl.get('hwfl.monitor.view.option.jumpNode').d('跳转节点')}
              </a>
            </Menu.Item>
          );

          result.push(detailDom);

          if (record.endTime === null) {
            result.push(stopDom);
            if (record.suspended) {
              result.push(resumeDom);
              result.push(suspendReasonDom);
              result.push(retryDom);
            } else {
              result.push(suspendDom);
              result.push(delegateDom);
              result.push(jumpDom);
            }
          }

          return (
            <Dropdown overlay={<Menu>{result.map(item => item)}</Menu>} placement="bottomCenter">
              <a className="ant-dropdown-link">
                {intl.get('hzero.common.button.action').d('操作')} <Icon type="down" />
              </a>
            </Dropdown>
          );
        },
      },
    ];
    return (
      <Table
        bordered
        scroll={{ x: 1701 }}
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onChange}
      />
    );
  }
}
