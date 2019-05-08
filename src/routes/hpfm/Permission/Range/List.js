/**
 * Platform - 菜单管理 - 平台tab页
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { Table, Popconfirm, Badge, Tag } from 'hzero-ui';

import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';

export default class List extends PureComponent {
  state = {
    currentTenantId: getCurrentOrganizationId(),
  };

  defaultTableRowKey = 'rangeId';

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
          width: 150,
          align: 'center',
          dataIndex: 'tenantId',
          onCell: this.onCell.bind(this),
          render: (text, record) => record.tenantName,
        },
        {
          title: intl.get('hpfm.permission.model.permission.tableName').d('屏蔽表名'),
          dataIndex: 'tableName',
          width: 160,
          onCell: this.onCell.bind(this),
        },
        {
          title: intl.get('hpfm.permission.model.permission.sqlId').d('SQLID'),
          dataIndex: 'sqlId',
          width: 120,
        },
        {
          title: intl.get('hpfm.permission.model.permission.serviceName').d('服务名'),
          dataIndex: 'serviceName',
        },
        {
          title: intl.get('hzero.common.status').d('状态'),
          dataIndex: 'enabledFlag',
          align: 'center',
          width: 80,
          render: enableRender,
        },
        {
          title: intl.get('hpfm.permission.model.permission.customRuleFlag').d('自定义规则标识'),
          dataIndex: 'customRuleFlag',
          align: 'center',
          width: 130,
          render: (text, record) => (
            <Badge
              status={record.customRuleFlag === 1 ? 'success' : 'error'}
              text={
                record.customRuleFlag === 1
                  ? intl.get('hzero.common.status.yes').d('是')
                  : intl.get('hzero.common.status.no').d('否')
              }
            />
          ),
        },
        {
          title: intl.get('hpfm.permission.model.permission.description').d('描述'),
          dataIndex: 'description',
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
          render: (text, record) => (
            <span className="action-link">
              <a className="edit" onClick={() => openEditor(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              {currentTenantId === record.tenantId && (
                <Popconfirm
                  title={intl.get('view.message.confirm.delete').d('确定删除该屏蔽范围吗?')}
                  onConfirm={this.deleteRecord.bind(this, record)}
                >
                  <a className="delete">{intl.get('hzero.common.button.delete').d('删除')}</a>
                </Popconfirm>
              )}
            </span>
          ),
        },
      ].filter(Boolean),
      pagination: false,
      rowKey: this.defaultTableRowKey,
      bordered: true,
      ...others,
    };
    return <Table {...tableProps} />;
  }
}
