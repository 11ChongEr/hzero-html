import React, { PureComponent } from 'react';
import { Table, Popconfirm, Icon } from 'hzero-ui';
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
    this.props.onEdit(record);
  }

  /**
   * 分配权限
   * @param {object} record - 数据对象
   */
  assignPermission(record) {
    this.props.onAssign(record);
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
    const { loading, dataSource, pagination, onChange, tenantRoleLevel } = this.props;
    const columns = [
      {
        title: intl.get('hrpt.reportDefinition.model.reportDefinition.orderSeq').d('序号'),
        dataIndex: 'orderSeq',
        width: 70,
      },
      {
        title: intl.get('entity.tenant.tag').d('租户'),
        dataIndex: 'tenantName',
        width: 150,
      },
      {
        title: intl.get('hrpt.reportDefinition.model.reportDefinition.reportCode').d('报表代码'),
        dataIndex: 'reportCode',
        width: 150,
      },
      {
        title: intl.get('hrpt.reportDefinition.modal.reportDefinition.reportName').d('报表名称'),
        dataIndex: 'reportName',
      },
      {
        title: intl
          .get('hrpt.reportDefinition.modal.reportDefinition.reportTypeCode')
          .d('报表类型'),
        dataIndex: 'reportTypeMeaning',
        width: 150,
        render: (text, record) => {
          let component = '';
          switch (record.reportTypeCode) {
            case 'T': // 表格报表
              component = (
                <span>
                  <Icon type="table" style={{ color: '#2B975C', marginRight: 5, fontSize: 16 }} />
                  {text}
                </span>
              );
              break;
            case 'C': // 图形报表
              component = (
                <span>
                  <Icon
                    type="pie-chart"
                    style={{ color: '#AB82FF', marginRight: 5, fontSize: 16 }}
                  />
                  {text}
                </span>
              );
              break;
            case 'D': // 模板报表
              component = (
                <span>
                  <Icon type="profile" style={{ color: '#E95D3B', marginRight: 5, fontSize: 16 }} />
                  {text}
                </span>
              );
              break;
            default:
              component = (
                <span>
                  <Icon type="table" />
                  {text}
                </span>
              );
              break;
          }
          return component;
        },
      },
      {
        title: intl.get('hrpt.reportDefinition.modal.reportDefinition.datasetId').d('数据集'),
        dataIndex: 'datasetName',
        width: 150,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 180,
        render: (val, record) => (
          <span className="action-link">
            <a onClick={() => this.editOption(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
            <a onClick={() => this.assignPermission(record)}>
              {intl
                .get('hrpt.reportDefinition.modal.reportDefinition.assignPermission')
                .d('分配权限')}
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
    ].filter(col => {
      return tenantRoleLevel ? col.dataIndex !== 'tenantName' : true;
    });
    return (
      <Table
        bordered
        rowKey="reportId"
        loading={loading}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
        dataSource={dataSource}
        pagination={pagination}
        onChange={page => onChange(page)}
      />
    );
  }
}
