import React, { PureComponent } from 'react';
import { Table, Popconfirm } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { valueMapMeaning } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

// import styles from './index.less';

/**
 * 变量类型数据列表
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
  // 编辑
  @Bind()
  editModal(record) {
    const { onGetRecord } = this.props;
    onGetRecord(record);
  }

  // 删除
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
    const { listenerList, loading, category = [], pagination, onChange } = this.props;

    const columns = [
      {
        title: intl.get('hwfl.listenerManage.model.listenerManage.type').d('监听器类型'),
        dataIndex: 'type',
        width: 150,
      },
      {
        title: intl.get('hwfl.listenerManage.model.listenerManage.code').d('监听器编码'),
        dataIndex: 'code',
        width: 200,
      },
      {
        title: intl.get('hwfl.listenerManage.model.listenerManage.name').d('监听器名称'),
        dataIndex: 'name',
      },
      {
        title: intl.get('hwfl.listenerManage.model.listenerManage.event').d('监听事件'),
        dataIndex: 'event',
        width: 100,
      },
      {
        title: intl.get('hwfl.common.model.process.class').d('流程分类'),
        dataIndex: 'category',
        width: 100,
        render: val => val && valueMapMeaning(category, val),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 110,
        render: (val, record) => (
          <span className="action-link">
            <a onClick={() => this.editModal(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <Popconfirm
              placement="topRight"
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
        rowKey="listenerId"
        dataSource={listenerList}
        pagination={pagination}
        loading={loading}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
        onChange={page => onChange(page)}
      />
    );
  }
}
