import React, { PureComponent } from 'react';
import { Table, Popconfirm } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { enableRender, yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';

/**
 * 表单管理数据列表
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
export default class TableList extends PureComponent {
  /**
   * 编辑
   *
   * @param {*} record
   * @memberof ListTable
   */
  @Bind()
  editData(record) {
    const { onGetRecordData } = this.props;
    onGetRecordData(record);
  }

  /**
   * 删除
   *
   * @param {*} record
   * @memberof ListTable
   */
  @Bind()
  deleteData(record) {
    const { onDelete } = this.props;
    onDelete(record);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { databaseData = {}, loading, pagination, onChange } = this.props;

    const columns = [
      {
        title: intl.get('hpfm.database.model.database.databaseCode').d('数据库代码'),
        dataIndex: 'databaseCode',
        width: 150,
      },
      {
        title: intl.get('hpfm.database.model.database.databaseName').d('数据库名称'),
        dataIndex: 'databaseName',
        width: 150,
      },
      {
        title: intl.get('hpfm.database.model.database.datasourceId').d('数据源代码'),
        dataIndex: 'datasourceId',
        width: 150,
        render: (val, record) => <span>{record.datasourceCode}</span>,
      },
      {
        title: intl.get('hpfm.database.model.database.description').d('数据源描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hpfm.database.model.database.tablePrefix').d('表前缀'),
        dataIndex: 'tablePrefix',
        width: 150,
      },
      {
        title: intl.get('hpfm.database.model.database.publicFlag').d('公共库标识'),
        dataIndex: 'publicFlag',
        width: 100,
        align: 'center',
        render: yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 80,
        align: 'center',
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 120,
        align: 'center',
        render: (val, record) => (
          <span className="action-link">
            <a onClick={() => this.editData(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <Popconfirm
              title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
              onConfirm={() => this.deleteData(record)}
            >
              <a>{intl.get('hezor.common.button.delete').d('删除')}</a>
            </Popconfirm>
          </span>
        ),
      },
    ];
    return (
      <Table
        bordered
        rowKey="databaseId"
        loading={loading}
        columns={columns}
        dataSource={databaseData.content}
        pagination={pagination}
        onChange={page => onChange(page)}
      />
    );
  }
}
