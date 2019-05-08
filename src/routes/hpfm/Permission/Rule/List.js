/**
 * Platform - 菜单管理 - 平台tab页
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Popconfirm, Tag } from 'hzero-ui';

import intl from 'utils/intl';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import { enableRender } from 'utils/renderer';

export default class List extends PureComponent {
  state = {
    currentTenantId: getCurrentOrganizationId(),
  };

  defaultTableRowKey = 'ruleId';

  deleteRecord(record) {
    const { handleDelete = e => e } = this.props;
    handleDelete(record);
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
    const { dataSource = [], rowKey, openEditor = e => e, ...others } = this.props;
    const { currentTenantId } = this.state;
    const tableProps = {
      dataSource,
      columns: [
        !isTenantRoleLevel() && {
          title: intl.get('hpfm.permission.model.permission.tenant').d('租户'),
          align: 'center',
          width: 150,
          dataIndex: 'tenantId',
          render: (text, record) => record.tenantName,
        },
        {
          title: intl.get('hpfm.permission.model.permission.ruleCode').d('规则编码'),
          width: 160,
          dataIndex: 'ruleCode',
          onCell: this.onCell.bind(this),
        },
        {
          title: intl.get('hpfm.permission.model.permission.ruleName').d('规则名称'),
          dataIndex: 'ruleName',
          width: 120,
          onCell: this.onCell.bind(this),
        },
        {
          title: intl.get('hpfm.permission.model.permission.ruleType').d('规则类型'),
          dataIndex: 'ruleTypeCodeMeaning',
          width: 160,
          onCell: this.onCell.bind(this),
        },
        {
          title: intl.get('hpfm.permission.model.permission.SQL').d('SQL'),
          dataIndex: 'sqlValue',
          width: 180,
          onCell: this.onCell.bind(this),
        },
        {
          title: intl.get('hzero.common.status').d('状态'),
          dataIndex: 'enabledFlag',
          render: enableRender,
          width: 80,
          align: 'center',
        },
        {
          title: intl.get('hpfm.permission.model.permission.description').d('描述'),
          dataIndex: 'description',
          width: 180,
          onCell: this.onCell.bind(this),
        },
        isTenantRoleLevel() && {
          title: intl.get('hzero.common.source').d('来源'),
          align: 'center',
          width: 100,
          render: (_, record) => {
            return currentTenantId === record.tenantId ? (
              <Tag color="green">{intl.get('hzero.common.custom').d('自定义')}</Tag>
            ) : (
              <Tag color="orange">{intl.get('hzero.common.predefined').d('预定义')}</Tag>
            );
          },
        },
        {
          title: intl.get('hzero.common.button.action').d('操作'),
          width: 120,
          align: 'center',
          render: (text, record) => {
            return (
              <span className="action-link">
                <a className="edit" onClick={() => openEditor(record)}>
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
                {currentTenantId === record.tenantId && (
                  <Popconfirm
                    title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                    onConfirm={this.deleteRecord.bind(this, record)}
                  >
                    <a className="delete">{intl.get('hzero.common.button.delete').d('删除')}</a>
                  </Popconfirm>
                )}
              </span>
            );
          },
        },
      ].filter(Boolean),
      rowKey: this.defaultTableRowKey,
      bordered: true,
      ...others,
    };
    return <Table {...tableProps} />;
  }
}
