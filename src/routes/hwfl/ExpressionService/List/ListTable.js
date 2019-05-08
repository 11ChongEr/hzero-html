import React, { PureComponent } from 'react';
import { Table, Popconfirm } from 'hzero-ui';
// import classNames from 'classnames';

import intl from 'utils/intl';
import { yesOrNoRender, valueMapMeaning } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

// import styles from './index.less';

/**
 * 表达式服务数据列表
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
    this.props.onEdit(record);
  }

  /**
   * 删除
   * @param {object} record - 数据对象
   */
  deleteOption(record) {
    this.props.onDelete(record);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource = [], pagination = {}, onChange, category = [] } = this.props;
    const columns = [
      {
        title: intl.get('hwfl.common.model.process.class').d('流程分类'),
        dataIndex: 'category',
        width: 150,
        render: val => val && valueMapMeaning(category, val),
      },
      {
        title: intl.get('hwfl.common.model.common.code').d('编码'),
        dataIndex: 'code',
        width: 150,
      },
      {
        title: intl.get('hwfl.common.model.common.description').d('描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hwfl.common.view.message.invokeRemoteService').d('调用远程服务'),
        dataIndex: 'invokeRemoteService',
        width: 110,
        render: yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 110,
        render: (val, record) => (
          <span className="action-link">
            <a onClick={() => this.editOption(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <Popconfirm
              placement="topRight"
              title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
              onConfirm={() => this.deleteOption(record)}
            >
              <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
            </Popconfirm>
          </span>
        ),
      },
    ];
    return (
      <Table
        bordered
        rowKey="externalDefinitionId"
        loading={loading}
        dataSource={dataSource}
        pagination={pagination}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
        onChange={page => onChange(page)}
      />
    );
  }
}
