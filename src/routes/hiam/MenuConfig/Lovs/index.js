import React, { PureComponent } from 'react';
import { Drawer, Form, Table, Input } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Button } from 'components/Permission';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import notification from 'utils/notification';
import LovModal from './LovModal';
import styles from './index.less';

const modelPrompt = 'hiam.menuConfig.model.menuConfig';
const commonPrompt = 'hzero.common';

@Form.create({ fieldNameProp: null })
export default class Lovs extends PureComponent {
  state = {
    tableDataSource: [],
    tablePagination: {},
    tableSelectedRows: [],
    lovVisible: false,
  };

  defautTableRowkey = 'lovId';

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
    const { handleQueryLovsBySet = e => e, permissionSetDataSource = {} } = this.props;
    const fields = this.props.form.getFieldsValue();
    handleQueryLovsBySet(permissionSetDataSource.id, {
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
  fetchLovDataSource(params) {
    const { handleQueryLovs = e => e, permissionSetDataSource = {} } = this.props;
    handleQueryLovs(permissionSetDataSource.id, {
      size: 10,
      page: 0,
      ...params,
      permissionSetId: permissionSetDataSource.id,
    }).then(res => {
      const { dataSource, pagination } = res;
      this.setState({
        lovDataSource: dataSource,
        lovPagination: pagination,
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
      lovDataSource: [],
      lovPagination: {},
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
      permissionCodes.push(n.lovCode);
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
  openLovModal() {
    this.fetchLovDataSource();
    this.setState({
      lovVisible: true,
    });
  }

  @Bind()
  closeLovModal() {
    this.setState({
      lovVisible: false,
    });
  }

  @Bind()
  onLovOk(selectedRows) {
    if (!(selectedRows.length > 0)) {
      notification.warning({
        message: intl.get(' hzero.common.message.confirm.remove').d('请至少选择一条数据'),
      });
      return;
    }
    const { onAssignPermissions, permissionSetDataSource } = this.props;
    const permissionCodes = [];
    selectedRows.forEach(n => {
      permissionCodes.push(n.lovCode);
    });
    const params = {
      menuId: permissionSetDataSource.id,
      permissionType: 'LOV',
      permissionCodes,
    };
    if (onAssignPermissions) {
      onAssignPermissions(params).then(res => {
        if (res) {
          notification.success();
          this.setState({ lovVisible: false }, () => {
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
      lovVisible,
      lovDataSource = [],
      lovPagination = {},
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
    const tableProps = {
      rowKey: this.defautTableRowkey,
      dataSource: tableDataSource,
      loading: processing.queryPermissionsByIdAll,
      columns: [
        {
          title: intl.get(`${modelPrompt}.lovCode`).d('编码'),
          dataIndex: 'lovCode',
          width: 250,
        },
        {
          title: intl.get(`${modelPrompt}.lovName`).d('名称'),
          dataIndex: 'lovName',
          width: 150,
        },
        {
          title: intl.get(`${modelPrompt}.lovTypeCode`).d('类型'),
          dataIndex: 'lovTypeCode',
          width: 100,
        },
      ],
      pagination: tablePagination,
      onChange: this.onTableChange,
      bordered: true,
      rowSelection: {
        selectedRowKeys: tableSelectedRows.map(n => n[this.defautTableRowkey]),
        onChange: this.onTableSelectedRowsChange,
      },
    };
    const lovProps = {
      visible: lovVisible,
      dataSource: lovDataSource,
      pagination: lovPagination,
      selectedRows: tableDataSource,
      handleFetchDataSource: this.fetchLovDataSource,
      onCancel: this.closeLovModal,
      onOk: this.onLovOk,
      queryLovByMenuId: processing.queryLovByMenuId,
      assignPermissions: processing.assignPermissions,
    };
    const permissionCode = isTenantRoleLevel()
      ? ['hzero.bg.sys.menu.ps.assign-permission']
      : ['hzero.sys.menu.ps.assign-permission'];
    return (
      <Drawer {...drawerProps}>
        <Form layout="inline" style={{ marginBottom: 15 }}>
          <Form.Item label={intl.get(`${modelPrompt}.conditionLov`).d('编码/名称')}>
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
            onClick={this.openLovModal}
          >
            {intl.get(`${modelPrompt}.createLov`).d('添加Lov')}
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
        {lovVisible && <LovModal {...lovProps} />}
      </Drawer>
    );
  }
}
