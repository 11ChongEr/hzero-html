import React, { PureComponent, Fragment } from 'react';
import { Table } from 'hzero-ui';
import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';

/**
 * 日历数据展示列表
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 分页查询
 * @reactProps {Function} editDetail - 查看详情
 * @reactProps {Function} editRow - 编辑行
 * @reactProps {Boolean} loading - 数据加载完成标记
 * @reactProps {Array} dataSource - Table数据源
 * @reactProps {object} pagination - 分页器
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
    const { loading, dataSource, pagination, onSearch, onEditRow, onEditDetail } = this.props;

    const columns = [
      {
        title: intl.get('hpfm.calendar.model.calendar.calendarName').d('描述'),
        dataIndex: 'calendarName',
      },
      {
        title: intl.get('hpfm.calendar.model.calendar.country').d('国家/地区'),
        dataIndex: 'countryName',
      },
      {
        title: intl.get('hpfm.calendar.model.calendar.maintain').d('日历维护'),
        dataIndex: 'maintain',
        width: 120,
        align: 'center',
        render: (val, record) => (
          <a onClick={() => onEditDetail(record)}>
            {intl.get('hpfm.calendar.model.calendar.maintain').d('日历维护')}
          </a>
        ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        align: 'center',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 100,
        align: 'center',
        render: (val, record) => (
          <a onClick={() => onEditRow(record)}>{intl.get('hzero.common.button.edit').d('编辑')}</a>
        ),
      },
    ];
    return (
      <Fragment>
        <Table
          bordered
          rowKey="calendarId"
          loading={loading}
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          onChange={page => onSearch(page)}
        />
      </Fragment>
    );
  }
}
