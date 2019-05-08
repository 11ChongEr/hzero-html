import React, { PureComponent } from 'react';
import { Table, Popconfirm, Tag } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { enableRender, valueMapMeaning } from 'utils/renderer';
import { isTenantRoleLevel } from 'utils/utils';
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
    const { onEdit } = this.props;
    onEdit(record);
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

  @Bind()
  handleAddService(record) {
    const { onAddService = e => e } = this.props;
    onAddService(record);
  }

  render() {
    const { dataSourceData = {}, loading, dataSourceTypeList, pagination, onChange } = this.props;
    const columns = [
      {
        title: intl.get('entity.tenant.tag').d('租户'),
        dataIndex: 'tenantName',
        width: 150,
      },
      {
        title: intl.get('hpfm.dataSource.model.dataSource.datasourceCode').d('数据源编码'),
        dataIndex: 'datasourceCode',
        width: 150,
      },
      {
        title: '数据源名称',
        dataIndex: 'description',
        width: 250,
      },
      {
        title: intl.get('hpfm.dataSource.model.dataSource.dsPurposeCodeMeaning').d('数据源用途'),
        dataIndex: 'dsPurposeCodeMeaning',
        align: 'center',
        width: 100,
        render: (val, record) => {
          let mean = '';
          if (val) {
            switch (record.dsPurposeCode) {
              case 'DI':
                mean = <Tag color="green">{val}</Tag>;
                break;
              case 'DT':
                mean = <Tag color="orange">{val}</Tag>;
                break;
              default:
                mean = <Tag color="red">{val}</Tag>;
                break;
            }
          }
          return mean;
        },
      },
      {
        title: intl.get('hpfm.dataSource.model.dataSource.dbType').d('数据库类型'),
        dataIndex: 'dbType',
        align: 'center',
        width: 100,
        render: val => val && valueMapMeaning(dataSourceTypeList, val),
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
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
        width: 180,
        align: 'center',
        render: (val, record) => (
          <span className="action-link">
            {record.datasourceId !== undefined && record.dsPurposeCode === 'DT' && (
              <a
                onClick={() => {
                  this.handleAddService(record);
                }}
              >
                {intl.get('hzero.dataSource.view.button.add').d('添加服务')}
              </a>
            )}
            <a
              onClick={() => {
                this.editData(record);
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
              <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
            </Popconfirm>
          </span>
        ),
      },
    ].filter(col => {
      return isTenantRoleLevel() ? col.dataIndex !== 'tenantName' : true;
    });
    return (
      <Table
        bordered
        rowKey="datasourceId"
        loading={loading}
        columns={columns}
        dataSource={dataSourceData.content}
        pagination={pagination}
        onChange={page => onChange(page)}
      />
    );
  }
}
