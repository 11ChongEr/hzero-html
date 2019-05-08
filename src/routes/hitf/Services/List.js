/**
 * List  - 应用管理 - 首页列表
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Table, Popconfirm, Icon } from 'hzero-ui';

import { enableRender } from 'utils/renderer';
import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

const modelPrompt = 'hitf.services.model.services';
const commonPrompt = 'hzero.common';

export default class List extends Component {
  defaultTableRowKey = 'interfaceServerId';

  handleDelete(record) {
    const { deleteRow = e => e } = this.props;
    deleteRow(record);
  }

  render() {
    const {
      dataSource = [],
      pagination,
      processing = {},
      openEditor = e => e,
      onChange = e => e,
      currentProcessedRow,
      tenantRoleLevel,
    } = this.props;
    const tableColumns = [
      {
        title: intl.get(`${modelPrompt}.tenant`).d('所属租户'),
        dataIndex: 'tenantName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.code`).d('服务代码'),
        dataIndex: 'serverCode',
        width: 160,
      },
      {
        title: intl.get(`${modelPrompt}.name`).d('服务名称'),
        dataIndex: 'serverName',
        width: 200,
      },
      {
        title: intl.get(`${modelPrompt}.address`).d('服务地址'),
        dataIndex: 'domainUrl',
      },
      {
        title: intl.get(`${modelPrompt}.type`).d('服务类型'),
        width: 120,
        dataIndex: 'serviceType',
      },
      {
        title: intl.get(`${commonPrompt}.status`).d('状态'),
        dataIndex: 'enabledFlag',
        render: enableRender,
        width: 80,
      },
      {
        title: intl.get(`${modelPrompt}.table.column.option`).d('操作'),
        width: 120,
        fixed: 'right',
        render: (text, record) => {
          return (
            <span className="action-link">
              <a className="edit" onClick={() => openEditor(record)}>
                {intl.get(`${commonPrompt}.button.edit`).d('编辑')}
              </a>
              {currentProcessedRow === record.interfaceServerId && processing.delete ? (
                <Icon type="loading" />
              ) : (
                <Popconfirm
                  title={intl.get(`${commonPrompt}.message.confirm.delete`).d('是否删除此条记录')}
                  onConfirm={this.handleDelete.bind(this, record)}
                >
                  <a className="delete">{intl.get(`${commonPrompt}.button.delete`).d('删除')}</a>
                </Popconfirm>
              )}
            </span>
          );
        },
      },
    ].filter(col => {
      return tenantRoleLevel ? col.dataIndex !== 'tenantName' : true;
    });
    const tableProps = {
      dataSource,
      onChange,
      pagination,
      bordered: true,
      loading: processing.query,
      columns: tableColumns,
      scroll: { x: tableScrollWidth(tableColumns) },
      rowKey: this.defaultTableRowKey,
    };
    return <Table {...tableProps} />;
  }
}
