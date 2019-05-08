/**
 * List  - 应用管理 - 首页列表
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Popconfirm, Icon, Tag } from 'hzero-ui';

import intl from 'utils/intl';
import { tableScrollWidth } from 'utils/utils';

const modelPrompt = 'hitf.application.model.application';
const commonPrompt = 'hzero.common';

export default class List extends PureComponent {
  defaultTableRowKey = 'applicationId';

  handleDelete(rowData) {
    const { deleteRow = e => e } = this.props;
    deleteRow(rowData);
  }

  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const {
      dataSource = [],
      pagination,
      loading,
      openEditor = e => e,
      onChange = e => e,
      processingRow,
      tenantRoleLevel,
    } = this.props;
    const tableColumns = [
      {
        title: intl.get(`${modelPrompt}.tenant`).d('所属租户'),
        dataIndex: 'tenantName',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.code`).d('应用代码'),
        dataIndex: 'applicationCode',
        width: 150,
        onCell: this.onCell.bind(this),
      },
      {
        title: intl.get(`${modelPrompt}.name`).d('应用名称'),
        width: 160,
        dataIndex: 'applicationName',
        onCell: this.onCell.bind(this),
      },
      {
        title: intl.get(`${modelPrompt}.clientName`).d('客户端名称'),
        dataIndex: 'clientName',
        width: 200,
        onCell: this.onCell.bind(this),
      },
      {
        title: intl.get(`${modelPrompt}.authorizedGrantTypes`).d('客户端授权类型'),
        dataIndex: 'authorizedGrantTypes',
        render: text => {
          const typeListT = text.split(',') || [];
          return typeListT.map(item => {
            return <Tag key={item}>{item}</Tag>;
          });
        },
      },
      {
        title: intl.get(`${commonPrompt}.table.column.option`).d('操作'),
        width: 110,
        render: (text, record) => (
          <span className="action-link">
            <a onClick={() => openEditor(record)}>
              {intl.get(`${commonPrompt}.button.edit`).d('编辑')}
            </a>
            {processingRow === record.applicationId ? (
              <Icon type="loading" />
            ) : (
              <Popconfirm
                title={intl.get(`${commonPrompt}.confirm.delete`).d('是否删除此条记录')}
                onConfirm={this.handleDelete.bind(this, record)}
              >
                <a>{intl.get(`${commonPrompt}.button.delete`).d('删除')}</a>
              </Popconfirm>
            )}
          </span>
        ),
      },
    ].filter(col => {
      return tenantRoleLevel ? col.dataIndex !== 'tenantName' : true;
    });
    const tableProps = {
      dataSource,
      loading,
      onChange,
      pagination,
      bordered: true,
      columns: tableColumns,
      scroll: { x: tableScrollWidth(tableColumns) },
      rowKey: this.defaultTableRowKey,
    };
    return <Table {...tableProps} />;
  }
}
