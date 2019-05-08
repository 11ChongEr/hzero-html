/**
 * Table - 角色管理 - 列表页面表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import pathParse from 'path-parse';
import { isEmpty } from 'lodash';
import { Table, Badge, Menu, Dropdown, Icon } from 'hzero-ui';

import { getCodeMeaning, tableScrollWidth } from 'utils/utils';
import intl from 'utils/intl';
import { VERSION_IS_OP } from 'utils/config';

const modelPrompt = 'hiam.roleManagement.model.roleManagement';
const viewTitlePrompt = 'hiam.roleManagement.view.title';
const viewButtonPrompt = 'hiam.roleManagement.view.button';
const commonPrompt = 'hzero.common';

class List extends PureComponent {
  /**
   * defaultTableRowKey - 默认table rowKey
   */
  defaultTableRowKey = 'id';

  /**
   * onCell - 删除角色成员钩子函数
   * @param {number} maxWidth - 单元格最大宽度
   */
  onCell(maxWidth) {
    return {
      style: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: maxWidth || 180,
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

  optionsRender(text, record) {
    const { handleAction = e => e } = this.props;
    const menu = (
      <Menu onClick={({ key }) => handleAction(key, record)}>
        {!record.disadbleCurrentEnabled && (
          <Menu.Item key="enabled">
            <a>
              {record.enabled ? (
                <Fragment>{intl.get(`${commonPrompt}.status.disable`).d('停用')}</Fragment>
              ) : (
                <Fragment>{intl.get(`${commonPrompt}.status.enable`).d('启用')}</Fragment>
              )}
            </a>
          </Menu.Item>
        )}
        {!record.disadbleView && (
          <Menu.Item key="view">
            <a>{intl.get(`${commonPrompt}.button.view`).d('查看')}</a>
          </Menu.Item>
        )}
        {!record.disadbleEdit && (
          <Menu.Item key="edit">
            <a>{intl.get(`${commonPrompt}.button.edit`).d('编辑')}</a>
          </Menu.Item>
        )}
        <Menu.Item key="copy">
          <a>{intl.get(`${commonPrompt}.button.copy`).d('复制')}</a>
        </Menu.Item>
        <Menu.Item key="inherit">
          <a>{intl.get(`${viewTitlePrompt}.button.inherit`).d('继承')}</a>
        </Menu.Item>
        <Menu.Item key="editPermission">
          <a>{intl.get(`${viewButtonPrompt}.button.editPermission`).d('维护数据权限')}</a>
        </Menu.Item>
      </Menu>
    );
    return (
      <Dropdown overlay={menu} placement="bottomCenter">
        <a className="ant-dropdown-link">
          {intl.get(`${commonPrompt}.table.column.option`).d('操作')}
          <Icon type="down" />
        </a>
      </Dropdown>
    );
  }

  render() {
    const {
      code,
      dataSource = [],
      handleAction = e => e,
      loading,
      currentRole = {},
      organizationId,
      onListChange = e => e,
      ...others
    } = this.props;
    // const stempColumns =
    const columns = VERSION_IS_OP
      ? [
          {
            title: intl.get(`${modelPrompt}.members`).d('角色名称'),
            width: 180,
            onCell: this.onCell.bind(this),
            dataIndex: 'name',
          },
          {
            title: intl.get(`${modelPrompt}.members`).d('角色编码'),
            dataIndex: 'viewCode',
            width: 150,
            onCell: this.onCell.bind(this, 150),
            render: text => pathParse(text || '').base,
          },
          {
            title: intl.get(`${modelPrompt}.parentRole`).d('父级角色'),
            width: 150,
            onCell: this.onCell.bind(this, 150),
            dataIndex: 'parentRoleName',
          },
          {
            title: intl.get(`${modelPrompt}.members`).d('角色来源'),
            width: 120,
            onCell: this.onCell.bind(this, 70),
            dataIndex: 'roleSource',
            render: text => getCodeMeaning(text, code),
          },
          {
            title: intl.get(`${modelPrompt}.members`).d('继承自'),
            width: 150,
            onCell: this.onCell.bind(this, 150),
            dataIndex: 'inheritedRoleName',
          },
          {
            title: intl.get(`${commonPrompt}.status`).d('状态'),
            width: 90,
            dataIndex: 'enabled',
            render: (text, record) => (
              <Badge
                status={record.enabled ? 'success' : 'error'}
                text={
                  record.enabled
                    ? intl.get(`${commonPrompt}.status.enable`).d('启用')
                    : intl.get(`${viewTitlePrompt}.disable`).d('禁用')
                }
              />
            ),
          },
          {
            title: intl.get(`${commonPrompt}.table.column.option`).d('操作'),
            width: 85,
            render: this.optionsRender.bind(this),
          },
          {
            title: intl.get(`${viewTitlePrompt}.assignPermissions`).d('分配权限'),
            width: 120,
            render: (text, record) =>
              currentRole.id !== record.id && (
                <a onClick={() => handleAction('assignPermissions', record)}>
                  {intl.get(`${viewButtonPrompt}.assignPermissions`).d('分配权限')}
                </a>
              ),
          },
          {
            title: intl.get(`${viewTitlePrompt}.members`).d('分配用户'),
            width: 120,
            render: (text, record) => {
              return (
                record.enabled &&
                record.id !== currentRole.id && (
                  <a onClick={() => handleAction('editMembers', record)}>
                    {intl.get(`${viewTitlePrompt}.members`).d('分配用户')}
                  </a>
                )
              );
            },
          },
          {
            key: 'assignCard',
            title: intl.get(`${viewTitlePrompt}.assignCards`).d('工作台配置'),
            width: 120,
            render: (text, record) => {
              return (
                record.enabled &&
                record.id !== currentRole.id && (
                  <a onClick={() => handleAction('assignCards', record)}>
                    {intl.get(`${viewTitlePrompt}.assignCards`).d('工作台配置')}
                  </a>
                )
              );
            },
          },
          // 【租户层】角色管理功能：角色来源/所属租户/角色层级字段不需要
        ].filter(o =>
          organizationId !== 0
            ? isEmpty(['roleSource', 'tenantName', 'levelMeaning'].filter(m => m === o.dataIndex))
            : o
        )
      : [
          {
            title: intl.get(`${modelPrompt}.members`).d('角色名称'),
            width: 180,
            onCell: this.onCell.bind(this),
            dataIndex: 'name',
          },
          {
            title: intl.get(`${modelPrompt}.members`).d('角色编码'),
            dataIndex: 'viewCode',
            width: 150,
            onCell: this.onCell.bind(this, 150),
            render: text => pathParse(text || '').base,
          },
          {
            title: intl.get(`${modelPrompt}.members`).d('角色层级'),
            width: 120,
            onCell: this.onCell.bind(this, 70),
            dataIndex: 'levelMeaning',
          },
          {
            title: intl.get(`${modelPrompt}.parentRole`).d('父级角色'),
            width: 150,
            onCell: this.onCell.bind(this, 150),
            dataIndex: 'parentRoleName',
          },
          {
            title: intl.get(`${modelPrompt}.members`).d('角色来源'),
            width: 120,
            onCell: this.onCell.bind(this, 70),
            dataIndex: 'roleSource',
            render: text => getCodeMeaning(text, code),
          },
          {
            title: intl.get(`${modelPrompt}.members`).d('所属租户'),
            width: 150,
            onCell: this.onCell.bind(this, 150),
            dataIndex: 'tenantName',
          },
          {
            title: intl.get(`${modelPrompt}.members`).d('继承自'),
            width: 150,
            onCell: this.onCell.bind(this, 150),
            dataIndex: 'inheritedRoleName',
          },
          {
            title: intl.get(`${commonPrompt}.status`).d('状态'),
            width: 90,
            dataIndex: 'enabled',
            render: (text, record) => (
              <Badge
                status={record.enabled ? 'success' : 'error'}
                text={
                  record.enabled
                    ? intl.get(`${commonPrompt}.status.enable`).d('启用')
                    : intl.get(`${viewTitlePrompt}.disable`).d('禁用')
                }
              />
            ),
          },
          {
            title: intl.get(`${commonPrompt}.table.column.option`).d('操作'),
            width: 85,
            render: this.optionsRender.bind(this),
          },
          {
            title: intl.get(`${viewTitlePrompt}.assignPermissions`).d('分配权限'),
            width: 90,
            render: (text, record) =>
              currentRole.id !== record.id && (
                <a onClick={() => handleAction('assignPermissions', record)}>
                  {intl.get(`${viewButtonPrompt}.assignPermissions`).d('分配权限')}
                </a>
              ),
          },
          {
            title: intl.get(`${viewTitlePrompt}.members`).d('分配用户'),
            width: 90,
            render: (text, record) => {
              return (
                record.enabled &&
                record.id !== currentRole.id && (
                  <a onClick={() => handleAction('editMembers', record)}>
                    {intl.get(`${viewTitlePrompt}.members`).d('分配用户')}
                  </a>
                )
              );
            },
          },
          {
            key: 'assignCard',
            title: intl.get(`${viewTitlePrompt}.assignCards`).d('工作台配置'),
            width: 100,
            render: (text, record) => {
              return (
                record.enabled &&
                record.id !== currentRole.id && (
                  <a onClick={() => handleAction('assignCards', record)}>
                    {intl.get(`${viewTitlePrompt}.assignCards`).d('工作台配置')}
                  </a>
                )
              );
            },
          },
          // 【租户层】角色管理功能：角色来源/所属租户/角色层级字段不需要
        ].filter(o =>
          organizationId !== 0
            ? !['roleSource', 'tenantName', 'levelMeaning'].some(item => item === o.dataIndex)
            : o
        );
    const tableProps = {
      rowKey: this.defaultTableRowKey,
      columns,
      dataSource,
      pagination: false,
      loading,
      onChange: onListChange,
      bordered: true,
      childrenColumnName: 'childRoles',
      ...others,
    };
    tableProps.scroll = {
      x: tableScrollWidth(columns),
    };
    return <Table {...tableProps} />;
  }
}

export default List;
