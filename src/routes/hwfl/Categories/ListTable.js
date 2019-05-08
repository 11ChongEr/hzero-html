import React, { PureComponent } from 'react';
import { Table, Popconfirm } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

/**
 * 流程分类数据展示列表
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

  render() {
    const { categoriesData, loading, pagination, onChange } = this.props;
    const columns = [
      {
        title: intl.get('hwfl.categories.model.categories.code').d('流程分类编码'),
        dataIndex: 'code',
        width: 200,
      },
      {
        title: intl.get('hwfl.categories.model.categories.description').d('流程分类描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 110,
        key: 'error',
        render: (val, record) => (
          <span className="action-link">
            <a
              onClick={() => {
                this.editModal(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <Popconfirm
              title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
              onConfirm={() => {
                this.deleteData(record);
              }}
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
        rowKey="processCategoryId"
        loading={loading}
        pagination={pagination}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
        dataSource={categoriesData.content || []}
        onChange={page => onChange(page)}
      />
    );
  }
}
