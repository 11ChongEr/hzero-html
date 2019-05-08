import React, { PureComponent } from 'react';
import { Table, Icon } from 'hzero-ui';
import intl from 'utils/intl';

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
   * 查看
   * @param {object} record - 数据对象
   */
  viewOption(record) {
    this.props.onView(record);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, dataSource, pagination, onChange } = this.props;
    const columns = [
      {
        title: intl.get('hrpt.reportQuery.model.reportQuery.orderSeq').d('序号'),
        dataIndex: 'orderSeq',
        width: 70,
      },
      {
        title: intl.get('hrpt.reportQuery.model.reportQuery.reportCode').d('报表代码'),
        dataIndex: 'reportCode',
        width: 250,
      },
      {
        title: intl.get('hrpt.reportQuery.model.reportQuery.reportName').d('报表名称'),
        dataIndex: 'reportName',
        width: 200,
      },
      {
        title: intl.get('hrpt.reportQuery.model.reportQuery.reportTypeCode').d('报表类型'),
        dataIndex: 'reportTypeMeaning',
        width: 120,
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
        title: intl.get('hrpt.reportQuery.model.reportQuery.remark').d('备注'),
        dataIndex: 'remark',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 85,
        render: (val, record) => (
          <span className="action-link">
            <a onClick={() => this.viewOption(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          </span>
        ),
      },
    ];
    return (
      <Table
        bordered
        rowKey="reportId"
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        pagination={pagination}
        onChange={onChange}
      />
    );
  }
}
