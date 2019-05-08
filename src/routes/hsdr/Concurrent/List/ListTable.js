import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';

import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

/**
 * 跳转条件数据列表
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
   * 编辑
   * @param {object} record - 数据对象
   */
  editOption(record) {
    this.props.editContent(record);
  }

  /**
   * 分配权限
   * @param {object} record - 数据对象
   */
  assignPermission(record) {
    this.props.onAssign(record);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, onChange, tenantRoleLevel } = this.props;
    const columns = [
      {
        title: intl.get('hsdr.concurrent.model.concurrent.concCode').d('请求编码'),
        dataIndex: 'concCode',
        width: 150,
      },
      {
        title: intl.get('hsdr.concurrent.model.concurrent.concName').d('请求名称'),
        dataIndex: 'concName',
        width: 200,
      },
      {
        title: intl.get('hsdr.concurrent.model.concurrent.concDescription').d('请求描述'),
        dataIndex: 'concDescription',
        // width: 200,
        // render: text => (
        //   <Tooltip title={text}>
        //     <p
        //       style={{
        //         width: 200,
        //         overflow: 'hidden',
        //         textOverflow: 'ellipsis',
        //         whiteSpace: 'nowrap',
        //         margin: 0,
        //       }}
        //     >
        //       {text}
        //     </p>
        //   </Tooltip>
        // ),
      },
      // {
      //   title: intl.get('entity.tenant.name').d('租户名称'),
      //   width: 200,
      //   dataIndex: 'tenantName',
      // },
      {
        title: intl.get('hsdr.concurrent.model.concurrent.executableCode').d('可执行编码'),
        dataIndex: 'executableCode',
        width: 150,
      },
      {
        title: intl.get('hsdr.concurrent.model.concurrent.executableName').d('可执行名称'),
        dataIndex: 'executableName',
        width: 150,
      },
      {
        title: intl.get('hsdr.concurrent.model.concurrent.alarmEmail').d('报警邮件'),
        dataIndex: 'alarmEmail',
        width: 200,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 100,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 150,
        fixed: 'right',
        render: (val, record) => (
          <span className="action-link">
            <a onClick={() => this.editOption(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <a onClick={() => this.assignPermission(record)}>
              {intl.get('hsdr.concurrent.model.concurrent.assignPermission').d('分配权限')}
            </a>
          </span>
        ),
      },
    ].filter(col => {
      return tenantRoleLevel ? col.dataIndex !== 'tenantName' : true;
    });
    return (
      <Table
        bordered
        rowKey="concurrentId"
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
