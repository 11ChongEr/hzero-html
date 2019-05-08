import React, { PureComponent } from 'react';
import { Table, Tag } from 'hzero-ui';

import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

/**
 * 待办事项列表展示列表
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
    this.props.detailContent(record);
  }

  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 250,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource = [], pagination = {}, onChange } = this.props;

    const columns = [
      {
        title: intl.get('hwfl.common.model.process.class').d('流程分类'),
        dataIndex: 'category',
        width: 150,
      },
      {
        title: intl.get('hwfl.common.model.process.ID').d('流程ID'),
        dataIndex: 'processInstanceId',
        width: 150,
      },
      {
        title: intl.get('hwfl.common.model.process.name').d('流程名称'),
        dataIndex: 'processName',
        width: 150,
      },
      {
        title: intl.get('hwfl.common.model.process.description').d('流程描述'),
        // minWidth: 100,
        dataIndex: 'description',
        // onCell: this.onCell.bind(this),
      },
      {
        title: intl.get('hwfl.common.model.approval.step').d('审批环节'),
        dataIndex: 'name',
        width: 150,
      },
      {
        title: intl.get('hwfl.common.model.apply.owner').d('申请人'),
        dataIndex: 'startUserName',
        width: 150,
        render: (val, record) =>
          val && (
            <span>
              {val}({record.startUserId})
            </span>
          ),
      },
      {
        title: intl.get('hwfl.common.view.message.handler').d('当前处理人'),
        dataIndex: 'assigneeName',
        width: 150,
        render: (val, record) =>
          val && (
            <span>
              {val}({record.assignee})
            </span>
          ),
      },
      {
        title: intl.get('hwfl.task.model.task.creationTime').d('创建时间'),
        dataIndex: 'createTime',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.priority').d('优先级'),
        dataIndex: 'priority',
        width: 100,
        render: (priority, record) => {
          let timeDesc = '';
          if (record.dueTime === null) {
            if (priority < 33) {
              timeDesc = intl.get('hzero.common.priority.low').d('低');
            } else if (priority < 66) {
              timeDesc = intl.get('hzero.common.priority.medium').d('中');
            } else {
              timeDesc = intl.get('hzero.common.priority.high').d('高');
            }
          } else {
            if (record.dueTime < 0) {
              timeDesc = intl.get('hzero.common.message.priority.overTime').d('已超时:');
            } else {
              timeDesc = intl.get('hzero.common.message.priority.remainTime').d('剩余时间:');
            }
            const dueTime = Math.abs(record.dueTime);
            let value = '';
            const days = parseInt(dueTime / 86400, 10);
            const hours = parseInt((dueTime / 3600) % 24, 10);
            const minutes = parseInt((dueTime / 60) % 60, 10);
            if (days > 0) {
              value += `${days}${intl.get('hzero.common.date.unit.day').d('天')}`;
            }
            if (hours > 0) {
              value += `${hours}${intl.get('hzero.common.date.unit.hours').d('小时')}`;
            }
            if (minutes > 0) {
              value += `${minutes}${intl.get('hzero.common.date.unit.minutes').d('分钟')}`;
            }
            timeDesc += value;
          }
          if (priority < 33) {
            return (
              <Tag color="#87d068" style={{ width: '65%' }}>
                {timeDesc}
              </Tag>
            );
          }
          if (priority < 66) {
            return (
              <Tag color="#FFA500" style={{ width: '65%' }}>
                {timeDesc}
              </Tag>
            );
          }
          return (
            <Tag color="#DD0000" style={{ width: '65%' }}>
              {timeDesc}
            </Tag>
          );
        },
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        fixed: 'right',
        render: (_, record) => (
          <span className="action-link">
            <a onClick={() => this.changeDetail(record)}>
              {intl.get('hwfl.task.view.option.deal').d('办理')}
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
