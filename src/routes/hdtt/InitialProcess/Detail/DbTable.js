import React, { PureComponent, Fragment } from 'react';
import { Table } from 'hzero-ui';

import { statusRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

/**
 * 数据初始化-DB处理-数据列表
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
export default class DbTable extends PureComponent {
  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, onChange } = this.props;
    const columns = [
      {
        title: intl.get('hdtt.initProcess.model.initProcess.consumerService').d('分发服务'),
        dataIndex: 'consumerService',
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.consumerDb').d('分发DB'),
        dataIndex: 'dbCode',
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.consumerOffset').d('消费偏移数'),
        dataIndex: 'consumerOffset',
        width: 120,
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.processDate').d('处理日期'),
        dataIndex: 'processDate',
        width: 150,
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.processStatus').d('处理状态'),
        dataIndex: 'processStatus',
        width: 150,
        render: (val, record) => <span>{statusRender(val, record.processStatusMeaning)}</span>,
      },
      {
        title: intl.get('hdtt.initProcess.model.initProcess.processMsg').d('处理消息'),
        dataIndex: 'processMsg',
      },
    ];
    return (
      <Fragment>
        <Table
          bordered
          rowKey="dbProcessId"
          loading={loading}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          dataSource={dataSource}
          pagination={pagination}
          onChange={onChange}
        />
      </Fragment>
    );
  }
}
