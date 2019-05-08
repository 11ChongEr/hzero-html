/**
 * Table - 菜单配置 - 列表页面表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Icon, Menu, Dropdown /* , Popconfirm */ } from 'hzero-ui';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import { isTenantRoleLevel, tableScrollWidth } from 'utils/utils';

import LazyLoadMenuIcon from 'components/LazyLoadMenuIcon';

const viewButtonPrompt = 'hiam.menuConfig.view.button';
const modelPrompt = 'hiam.menuConfig.model.menuConfig';
const commonPrompt = 'hzero.common';

const tenantRoleLevel = isTenantRoleLevel();

const menuIconStyle = {
  width: 14,
  height: 14,
};

export default class List extends PureComponent {
  defaultTableRowKey = 'id';

  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 220,
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

  operationRender(text, record) {
    const {
      processing = {},
      handleEdit = e => e,
      handleEnable = e => e,
      handleEditPermissionSet = e => e,
      processingEnableRow,
      organizationId,
    } = this.props;
    const menu = (
      <Menu
        onClick={({ key }) => {
          const actionType = {
            edit: () => handleEdit(record),
            enable: () => handleEnable(record, 'enable'),
            disable: () => handleEnable(record, 'disable'),
            decompositionPermissionSet: () => handleEditPermissionSet(record),
          };
          actionType[key]();
        }}
      >
        <Menu.Item key="edit">{intl.get(`${commonPrompt}.button.edit`).d('编辑')}</Menu.Item>
        {processing.setEnable && record.id === processingEnableRow ? (
          <Menu.Item key="loading">
            <Icon type="loading" />
          </Menu.Item>
        ) : record.enabledFlag === 1 ? (
          <Menu.Item key="disable">
            {intl.get(`${commonPrompt}.status.disable`).d('禁用')}
          </Menu.Item>
        ) : (
          <Menu.Item key="enable">{intl.get(`${commonPrompt}.status.enable`).d('启用')}</Menu.Item>
        )}
        {record.type === 'menu' && (
          <Menu.Item key="decompositionPermissionSet">
            {intl.get(`${viewButtonPrompt}.button.permissionSet`).d('权限集')}
          </Menu.Item>
        )}
      </Menu>
    );
    // 租户级应该能看到他的菜单挂载到了哪个目录下了，但是，需要限制，租户层功能只能看到标准菜单，但是不能做任何更改（没有任何操作按钮）
    return (
      (organizationId === 0 || (organizationId !== 0 && record.customFlag === 1)) && (
        <Dropdown overlay={menu}>
          <a className="ant-dropdown-link">
            {intl.get(`${commonPrompt}.table.column.option`).d('操作')} <Icon type="down" />
          </a>
        </Dropdown>
      )
    );
  }

  render() {
    const {
      dataSource = [],
      // handleEdit = e => e,
      // handleDelete = e => e,
      // handleEditPermissionSet = e => e,
      // handleEnable = e => e,
      processing = {},
      processingDeleteRow,
      processingEnableRow,
      levelCode = [],
      ...others
    } = this.props;
    const columns = tenantRoleLevel
      ? [
          {
            title: intl.get(`${modelPrompt}.name`).d('目录/菜单'),
            dataIndex: 'name',
          },
          {
            title: intl.get(`${modelPrompt}.parentName`).d('上级目录'),
            dataIndex: 'parentName',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.quickIndex`).d('快速索引'),
            dataIndex: 'quickIndex',
            width: 120,
          },
          {
            title: intl.get(`${modelPrompt}.icon`).d('图标'),
            dataIndex: 'icon',
            width: 60,
            render: code => <LazyLoadMenuIcon code={code} style={menuIconStyle} />,
          },
          {
            title: intl.get(`${modelPrompt}.code`).d('编码'),
            dataIndex: 'code',
            width: 220,
            onCell: this.onCell.bind(this),
          },
          {
            title: intl.get(`${modelPrompt}.sort`).d('序号'),
            dataIndex: 'sort',
            width: 60,
          },
          {
            title: intl.get(`${modelPrompt}.description`).d('描述'),
            dataIndex: 'description',
            width: 200,
            onCell: this.onCell.bind(this),
          },
          {
            title: intl.get(`${commonPrompt}.status`).d('状态'),
            dataIndex: 'enabledFlag',
            width: 120,
            fixed: 'right',
            render: enableRender,
          },
          {
            title: intl.get(`${commonPrompt}.table.column.option`).d('操作'),
            width: 85,
            fixed: 'right',
            render: this.operationRender.bind(this),
          },
        ]
      : [
          {
            title: intl.get(`${modelPrompt}.name`).d('目录/菜单'),
            dataIndex: 'name',
          },
          {
            title: intl.get(`${modelPrompt}.parentName`).d('上级目录'),
            width: 120,
            dataIndex: 'parentName',
          },
          {
            title: intl.get(`${modelPrompt}.quickIndex`).d('快速索引'),
            width: 120,
            dataIndex: 'quickIndex',
          },
          {
            title: intl.get(`${modelPrompt}.icon`).d('图标'),
            width: 60,
            dataIndex: 'icon',
            render: code => <LazyLoadMenuIcon code={code} style={menuIconStyle} />,
          },
          {
            title: intl.get(`${modelPrompt}.code`).d('编码'),
            dataIndex: 'code',
            width: 200,
            onCell: this.onCell.bind(this),
          },
          {
            title: intl.get(`${modelPrompt}.level`).d('层级'),
            dataIndex: 'level',
            width: 120,
            render: text => {
              let levelMeaning = '';
              levelCode
                .filter(o => o.value !== 'org')
                .forEach(element => {
                  if (text === element.value) {
                    levelMeaning = element.meaning;
                  }
                });
              return levelMeaning;
            },
          },
          {
            title: intl.get(`${modelPrompt}.sort`).d('序号'),
            dataIndex: 'sort',
            width: 60,
          },
          {
            title: intl.get(`${modelPrompt}.description`).d('描述'),
            dataIndex: 'description',
            width: 200,
            onCell: this.onCell.bind(this),
          },
          {
            title: intl.get(`${commonPrompt}.status`).d('状态'),
            dataIndex: 'enabledFlag',
            width: 120,
            fixed: 'right',
            render: enableRender,
          },
          {
            title: intl.get(`${commonPrompt}.table.column.option`).d('操作'),
            width: 85,
            fixed: 'right',
            render: this.operationRender.bind(this),
          },
        ];
    const tableProps = {
      columns,
      dataSource,
      pagination: false,
      bordered: true,
      rowKey: this.defaultTableRowKey,
      loading: processing.query,
      childrenColumnName: 'subMenus',
      scroll: { x: tableScrollWidth(columns) },
      ...others,
    };
    return <Table {...tableProps} />;
  }
}
