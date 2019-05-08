import React, { PureComponent, Fragment } from 'react';
import { Table } from 'hzero-ui';

import { enableRender, valueMapMeaning } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

/**
 * 消息模板数据展示列表
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
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      dataSource,
      pagination,
      onChange,
      onEdit,
      language,
      tenantRoleLevel,
    } = this.props;
    const columns = [
      {
        title: intl.get('entity.tenant.tag').d('租户'),
        dataIndex: 'tenantName',
        width: 200,
      },
      {
        title: intl.get('hmsg.messageTemplate.model.template.templateCode').d('消息模板代码'),
        dataIndex: 'templateCode',
        width: 270,
      },
      {
        title: intl.get('hmsg.messageTemplate.model.template.templateName').d('消息模板名称'),
        dataIndex: 'templateName',
      },
      {
        title: intl.get('entity.lang.tag').d('语言'),
        dataIndex: 'lang',
        width: 150,
        render: val => val && valueMapMeaning(language, val),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'operator',
        width: 85,
        render: (val, record) => (
          <a onClick={() => onEdit(record)}>{intl.get('hzero.common.button.edit').d('编辑')}</a>
        ),
      },
    ].filter(col => {
      return tenantRoleLevel ? col.dataIndex !== 'tenantName' : true;
    });
    return (
      <Fragment>
        <Table
          bordered
          loading={loading}
          rowKey="templateId"
          dataSource={dataSource}
          pagination={pagination}
          columns={columns}
          scroll={{ x: tableScrollWidth(columns) }}
          onChange={page => onChange(page)}
        />
      </Fragment>
    );
  }
}
