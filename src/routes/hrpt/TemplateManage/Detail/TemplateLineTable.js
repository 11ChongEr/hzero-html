import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { valueMapMeaning } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

/**
 * 模板明细行数据列表
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
export default class TemplateLineTable extends PureComponent {
  /**
   * 编辑
   * @param {object} record - 数据对象
   */
  editOption(record) {
    this.props.onEdit(record);
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      dataSource = [],
      templateLineRowSelection,
      supportLanguage,
      linePagination,
      onChange,
      templateTypeCodeValue,
    } = this.props;
    const columns = [
      {
        title: intl.get('entity.lang.tag').d('语言'),
        dataIndex: 'lang',
        width: 200,
        render: val => valueMapMeaning(supportLanguage, val),
      },
      templateTypeCodeValue === 'html'
        ? {}
        : {
            title: intl
              .get('hrpt.templateManage.model.templateManage.templateFileName')
              .d('模板文件名'),
            dataIndex: 'templateFileName',
          },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 85,
        render: (val, record) => (
          <span className="action-link">
            <a onClick={() => this.editOption(record)}>
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          </span>
        ),
      },
    ];
    return (
      <Table
        bordered
        rowKey="templateDtlId"
        rowSelection={templateLineRowSelection}
        loading={loading}
        columns={columns}
        scroll={{ x: tableScrollWidth(columns) }}
        dataSource={dataSource}
        pagination={linePagination}
        onChange={page => onChange(page)}
      />
    );
  }
}
