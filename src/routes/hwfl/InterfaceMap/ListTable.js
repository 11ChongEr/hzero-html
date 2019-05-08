import React, { PureComponent } from 'react';
import { Table, Popconfirm } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { valueMapMeaning } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

/**
 * 接口映射管理数据列表
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
    const { scopeList, interfaceMapData, loading, pagination, onChange } = this.props;

    const columns = [
      {
        title: intl.get('hwfl.interfaceMap.model.interfaceMap.code').d('接口编码'),
        dataIndex: 'code',
        width: 150,
      },
      {
        title: intl.get('hwfl.interfaceMap.model.interfaceMap.serviceId').d('服务Id'),
        dataIndex: 'serviceId',
        width: 150,
      },
      {
        title: intl.get('hwfl.interfaceMap.model.interfaceMap.url').d('接口地址'),
        dataIndex: 'url',
        width: 200,
      },
      {
        title: intl.get('hwfl.interfaceMap.model.interfaceMap.description').d('接口说明'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hwfl.interfaceMap.model.interfaceMap.scope').d('数据范围'),
        dataIndex: 'scope',
        width: 100,
        render: val => valueMapMeaning(scopeList, val),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 110,
        render: (val, record) => (
          <span className="action-link">
            <a
              onClick={() => {
                this.editModal(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            {record.scope === 0 ? (
              <Popconfirm
                placement="topRight"
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                onConfirm={() => this.deleteData(record)}
              >
                <a>{intl.get('hezor.common.button.delete').d('删除')}</a>
              </Popconfirm>
            ) : (
              ''
            )}
          </span>
        ),
      },
    ];
    return (
      <Table
        bordered
        rowKey="interfaceMappingId"
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
        dataSource={interfaceMapData.content || []}
        pagination={pagination}
        loading={loading}
        onChange={page => onChange(page)}
      />
    );
  }
}
