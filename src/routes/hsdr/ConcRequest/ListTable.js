import React, { PureComponent } from 'react';
import { Table, Popconfirm, Icon, Menu, Dropdown } from 'hzero-ui';

import { yesOrNoRender, dateTimeRender, TagRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';
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
   * 请求ID
   * @param {object} record - 消息模板对象
   */
  concurrentMsgOption(record) {
    this.props.concurrentMsgContent(record);
  }

  // /**
  //  * 日志信息
  //  * @param {object} record - 消息模板对象
  //  */
  // logMsgOption(record) {
  //   this.props.logMsgContent(record);
  // }
  /**
   * 日志
   * @param {object} record - 头数据
   */
  changeLog(record) {
    this.props.logContent(record);
  }

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
      changeOptionContent,
      tenantRoleLevel,
    } = this.props;

    const columns = [
      {
        title: intl.get('hsdr.concRequest.model.concRequest.jobId').d('任务ID'),
        dataIndex: 'jobId',
        width: 100,
      },
      {
        title: intl.get('entity.tenant.tag').d('租户'),
        dataIndex: 'tenantName',
        width: 150,
      },
      {
        title: intl.get('hsdr.concRequest.model.concRequest.concCode').d('请求编码'),
        dataIndex: 'concCode',
        width: 150,
      },
      {
        title: intl.get('hsdr.concRequest.model.concRequest.concName').d('请求名称'),
        dataIndex: 'concName',
      },
      {
        title: intl.get('hsdr.concurrent.model.concurrent.cycleFlag').d('周期性'),
        dataIndex: 'cycleFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get('hsdr.concRequest.model.concRequest.requestParam').d('请求参数'),
        dataIndex: 'requestParam',
        width: 300,
      },
      {
        title: intl.get('hsdr.concRequest.model.concRequest.startDate').d('开始时间'),
        dataIndex: 'startDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('hsdr.concRequest.model.concRequest.endDate').d('结束时间'),
        dataIndex: 'endDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('hsdr.concRequest.model.concRequest.parentId').d('父任务ID'),
        dataIndex: 'parentId',
        width: 100,
      },
      {
        title: intl.get('hsdr.concRequest.model.concRequest.jobStatus').d('状态'),
        dataIndex: 'jobStatusMeaning',
        width: 100,
        fixed: 'right',
        render: (text, record) => {
          const statusList = [
            { status: 'NORMAL', color: 'green' },
            { status: 'PAUSED', color: 'gold' },
            { status: 'BLOCKED', color: 'volcano' },
            { status: 'ERROR', color: 'red' },
            { status: 'COMPLETE', color: '' },
            { status: 'NONE', color: '' },
          ];
          return TagRender(record.jobStatus, statusList, text);
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 85,
        fixed: 'right',
        render: (text, record) => {
          const menu = (
            <Menu style={{ textAlign: 'left' }}>
              {record.jobStatus === 'NORMAL' && (
                <Menu.Item>
                  <Popconfirm
                    title={`${intl
                      .get('hsdr.jobInfo.view.message.confirm.trigger')
                      .d('是否执行该任务')}？`}
                    onConfirm={changeOptionContent.bind(
                      this,
                      { jobId: record.jobId },
                      'triggerJobInfo'
                    )}
                  >
                    <a>
                      <Icon type="play-circle" />{' '}
                      {intl.get('hzero.common.button.trigger').d('执行')}
                    </a>
                  </Popconfirm>
                </Menu.Item>
              )}
              {record.jobStatus === 'NORMAL' && (
                <Menu.Item>
                  <Popconfirm
                    title={`${intl
                      .get('hsdr.jobInfo.view.message.confirm.pause')
                      .d('是否暂停该任务')}？`}
                    onConfirm={changeOptionContent.bind(
                      this,
                      { jobId: record.jobId },
                      'pauseJobInfo'
                    )}
                  >
                    <a>
                      {' '}
                      <Icon type="pause-circle" /> {intl.get('hzero.common.button.pause').d('暂停')}
                    </a>
                  </Popconfirm>
                </Menu.Item>
              )}
              {record.jobStatus !== 'COMPLETE' && record.jobStatus !== 'NONE' && (
                <Menu.Item>
                  <Popconfirm
                    title={`${intl
                      .get('hsdr.jobInfo.view.message.confirm.stop')
                      .d('是否终止该任务')}？`}
                    onConfirm={changeOptionContent.bind(this, { jobId: record.jobId }, 'stopJob')}
                  >
                    <a>
                      <Icon type="close-circle" /> {intl.get('hsdr.jobInfo.option.stop').d('终止')}
                    </a>
                  </Popconfirm>
                </Menu.Item>
              )}
              {record.jobStatus === 'PAUSED' && (
                <Menu.Item>
                  <Popconfirm
                    title={`${intl
                      .get('hsdr.notice.view.message.confirm.resume')
                      .d('是否恢复该任务')}？`}
                    onConfirm={changeOptionContent.bind(
                      this,
                      { jobId: record.jobId },
                      'resumeJobInfo'
                    )}
                  >
                    <a>
                      <Icon type="sync" /> {intl.get('hzero.common.button.resume').d('恢复')}
                    </a>
                  </Popconfirm>
                </Menu.Item>
              )}
              {!record.cycleFlag && record.jobStatus === 'NONE' && (
                <Menu.Item>
                  <Popconfirm
                    title={`${intl
                      .get('hsdr.notice.view.message.confirm.againTrigger')
                      .d('是否再次执行该任务')}？`}
                    onConfirm={changeOptionContent.bind(
                      this,
                      { requestId: record.requestId },
                      'againTrigger'
                    )}
                  >
                    <a>
                      <Icon type="sync" />{' '}
                      {intl.get('hzero.common.button.againTrigger').d('再次执行')}
                    </a>
                  </Popconfirm>
                </Menu.Item>
              )}
              <Menu.Item>
                <a onClick={() => this.changeLog(record)}>
                  <Icon type="exception" /> {intl.get('hsdr.concRequest.view.option.log').d('日志')}
                </a>
              </Menu.Item>
            </Menu>
          );
          return (
            <Dropdown overlay={menu} disabled={record.status === 'operating'}>
              <a>
                {intl.get('hzero.common.button.action').d('操作')}
                <Icon type="down" />
              </a>
            </Dropdown>
          );
        },
      },
    ].filter(col => {
      return tenantRoleLevel ? col.dataIndex !== 'tenantName' : true;
    });
    return (
      <Table
        bordered
        rowKey="requestId"
        loading={loading}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onChange}
      />
    );
  }
}
