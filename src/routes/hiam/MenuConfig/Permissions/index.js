import React, { PureComponent } from 'react';
import { Drawer, Form, Table, Input, Badge } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Button } from 'components/Permission';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth, isTenantRoleLevel } from 'utils/utils';

import PermissionsModal from './PermissionsModal';
import styles from './index.less';

const modelPrompt = 'hiam.menuConfig.model.menuConfig';
const commonPrompt = 'hzero.common';

@Form.create({ fieldNameProp: null })
export default class Permissions extends PureComponent {
  state = {
    tableDataSource: [],
    tablePagination: {},
    tableSelectedRows: [],
    permissionsLovDataSource: [],
    permissionsLovPagination: {},
    permissionsLovVisible: false,
  };

  defautTableRowkey = 'id';

  // getSnapshotBeforeUpdate(prevProps) {
  //   const { visible, permissionSetDataSource } = this.props;
  //   return (
  //     visible &&
  //     isInteger(permissionSetDataSource.key) &&
  //     permissionSetDataSource.key !== prevProps.permissionSetDataSource.key
  //   );
  // }

  // componentDidUpdate(prevProps, prevState, snapshot) {
  //   // If we have a snapshot value, we've just added new items.
  //   // Adjust scroll so these new items don't push the old ones out of view.
  //   // (snapshot here is the value returned from getSnapshotBeforeUpdate)
  //   if (snapshot) {
  //     this.fetchDataSource();
  //   }
  // }
  componentDidMount() {
    this.fetchDataSource();
  }

  // 查询已分配的
  @Bind()
  fetchDataSource(params) {
    const { handleQueryPermissionsBySet = e => e, permissionSetDataSource = {} } = this.props;
    const fields = this.props.form.getFieldsValue();
    handleQueryPermissionsBySet(permissionSetDataSource.id, {
      size: 10,
      page: 0,
      ...fields,
      ...params,
    }).then(res => {
      // const { dataSource, pagination } = res;
      this.setTableDataSource(res);
    });
  }

  @Bind()
  setTableDataSource(res) {
    this.setState({
      tableDataSource: res.dataSource || [],
      tablePagination: res.pagination || {},
    });
  }

  // 查询可分配的
  @Bind()
  fetchPermissionsLovDataSource(params) {
    const { handleQueryPermissions = e => e, permissionSetDataSource = {} } = this.props;
    handleQueryPermissions(permissionSetDataSource.id, {
      size: 10,
      page: 0,
      ...params,
      permissionSetId: permissionSetDataSource.id,
    }).then(res => {
      const { dataSource, pagination } = res;
      this.setState({
        permissionsLovDataSource: dataSource,
        permissionsLovPagination: pagination,
      });
    });
  }

  @Bind()
  onDrawerClose() {
    const { close = e => e } = this.props;
    this.setState({
      tableDataSource: [],
      tablePagination: {},
      tableSelectedRows: [],
      permissionsLovDataSource: [],
      permissionsLovPagination: {},
    });
    close();
  }

  @Bind()
  onTableSelectedRowsChange(tableSelectedRowKeys, tableSelectedRows) {
    this.setState({
      tableSelectedRows,
    });
  }

  @Bind()
  deletePermissions() {
    const { tableSelectedRows } = this.state;
    const { onDeletePermissions, permissionSetDataSource } = this.props;
    const permissionCodes = [];
    tableSelectedRows.forEach(n => {
      permissionCodes.push(n.code);
    });
    const params = {
      menuId: permissionSetDataSource.id,
      permissionCodes,
    };
    if (onDeletePermissions) {
      onDeletePermissions(params).then(res => {
        if (res) {
          notification.success();
          this.fetchDataSource();
        }
      });
    }
  }

  @Bind()
  openPermissionsLov() {
    this.fetchPermissionsLovDataSource();
    this.setState({
      permissionsLovVisible: true,
    });
  }

  @Bind()
  closePermissionsLov() {
    this.setState({
      permissionsLovVisible: false,
    });
  }

  @Bind()
  onPermissionsLovOk(selectedRows) {
    if (!(selectedRows.length > 0)) {
      notification.warning({
        message: intl.get(' hzero.common.message.confirm.remove').d('请至少选择一条数据'),
      });
      return;
    }
    const { onAssignPermissions, permissionSetDataSource } = this.props;
    const permissionCodes = [];
    selectedRows.forEach(n => {
      permissionCodes.push(n.code);
    });
    const params = {
      menuId: permissionSetDataSource.id,
      permissionType: 'PERMISSION',
      permissionCodes,
    };
    if (onAssignPermissions) {
      onAssignPermissions(params).then(res => {
        if (res) {
          notification.success();
          this.setState({ permissionsLovVisible: false }, () => {
            this.fetchDataSource();
          });
        }
      });
    }
  }

  @Bind()
  onTableChange(pagination = {}) {
    const {
      form: { getFieldsValue = e => e },
    } = this.props;
    const { current = 1, pageSize = 10 } = pagination;
    this.fetchDataSource({ page: current - 1, size: pageSize, ...getFieldsValue() });
  }

  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
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
    const { visible, processing = {}, form, title } = this.props;
    const {
      tableDataSource = [],
      tablePagination = {},
      tableSelectedRows,
      permissionsLovVisible,
      permissionsLovDataSource = [],
      permissionsLovPagination = {},
    } = this.state;
    const drawerProps = {
      title,
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.onDrawerClose,
      width: 800,
      wrapClassName: styles['hiam-menu-config-permissions'],
    };
    const tableColumns = [
      {
        title: intl.get(`${modelPrompt}.permissionCode`).d('权限编码'),
        dataIndex: 'code',
        onCell: this.onCell,
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.description`).d('描述'),
        dataIndex: 'description',
        onCell: this.onCell,
      },
      {
        title: intl.get(`${modelPrompt}.path`).d('路径'),
        dataIndex: 'path',
        onCell: this.onCell,
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.method`).d('方法'),
        dataIndex: 'method',
        width: 80,
      },
      {
        title: intl.get(`${modelPrompt}.loginAccess`).d('登录可访问'),
        dataIndex: 'loginAccess',
        width: 120,
        render: text => {
          if (text) {
            return <Badge status="success" text={intl.get('hzero.common.status.yes')} />;
          } else {
            return <Badge status="error" text={intl.get('hzero.common.status.no')} />;
          }
        },
      },
      {
        title: intl.get(`${modelPrompt}.publicAccess`).d('公开接口'),
        dataIndex: 'publicAccess',
        width: 120,
        render: text => {
          if (text) {
            return <Badge status="success" text={intl.get('hzero.common.status.yes')} />;
          } else {
            return <Badge status="error" text={intl.get('hzero.common.status.no')} />;
          }
        },
      },
    ];
    const tableProps = {
      rowKey: this.defautTableRowkey,
      dataSource: tableDataSource,
      loading: processing.queryPermissionsByIdAll,
      columns: tableColumns,
      scroll: { x: tableScrollWidth(tableColumns) },
      pagination: tablePagination,
      onChange: this.onTableChange,
      bordered: true,
      rowSelection: {
        selectedRowKeys: tableSelectedRows.map(n => n[this.defautTableRowkey]),
        onChange: this.onTableSelectedRowsChange,
      },
    };
    const permissionsLovProps = {
      visible: permissionsLovVisible,
      dataSource: permissionsLovDataSource,
      pagination: permissionsLovPagination,
      selectedRows: tableDataSource,
      handleFetchDataSource: this.fetchPermissionsLovDataSource,
      onCancel: this.closePermissionsLov,
      onOk: this.onPermissionsLovOk,
      queryPermissionsByMenuId: processing.queryPermissionsByMenuId,
      assignPermissions: processing.assignPermissions,
    };
    const permissionCode = isTenantRoleLevel()
      ? ['hzero.bg.sys.menu.ps.assign-permission']
      : ['hzero.sys.menu.ps.assign-permission'];
    return (
      <Drawer {...drawerProps}>
        <Form layout="inline" style={{ marginBottom: 15 }}>
          <Form.Item label={intl.get(`${modelPrompt}.code`).d('目录编码')}>
            {form.getFieldDecorator('code')(<Input />)}
          </Form.Item>
          <Form.Item label={intl.get(`${modelPrompt}.conditionPermission`).d('描述/路径')}>
            {form.getFieldDecorator('condition')(<Input />)}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" onClick={() => this.fetchDataSource()}>
              {intl.get(`${commonPrompt}.button.search`).d('查询')}
            </Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={this.handleFormReset}>
              {intl.get(`${commonPrompt}.button.reset`).d('重置')}
            </Button>
          </Form.Item>
        </Form>
        {/* {(currentRoleCode === 'role/site/default/administrator' ||
          currentRoleCode === 'role/organization/default/administrator') && ( */}
        <div className="action" style={{ marginBottom: 15 }}>
          <Button
            code={permissionCode}
            icon="plus"
            style={{ marginRight: 8 }}
            onClick={this.openPermissionsLov}
          >
            {intl.get(`${modelPrompt}.createPermission`).d('添加权限')}
          </Button>
          <Button
            icon="delete"
            onClick={this.deletePermissions}
            disabled={isEmpty(tableSelectedRows)}
          >
            {intl.get(`${commonPrompt}.button.delete`).d('删除')}
          </Button>
        </div>
        {/* )} */}
        <Table {...tableProps} />
        <div className="footer">
          <Button onClick={this.onDrawerClose} disabled={processing.save} type="primary">
            {intl.get(`${commonPrompt}.button.close`).d('关闭')}
          </Button>
        </div>
        {permissionsLovVisible && <PermissionsModal {...permissionsLovProps} />}
      </Drawer>
    );
  }
}
