import React, { PureComponent, Fragment } from 'react';
import { Drawer, Table, Form, Icon } from 'hzero-ui';
import { isNumber, uniqBy, isEmpty, isInteger } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuidv4 from 'uuid/v4';

import { Button } from 'components/Permission';

import { tableScrollWidth, isTenantRoleLevel } from 'utils/utils';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';

import Permissions from '../Permissions';
import Lovs from '../Lovs';
import EditableCell from './EditableCell';
import QueryForm from './QueryForm';
import styles from './index.less';

const viewMessagePrompt = 'hiam.menuConfig.view.message';
const modelPrompt = 'hiam.menuConfig.model.menuConfig';
const commonPrompt = 'hzero.common';

const EditableContext = React.createContext();
const EditableRow = ({ form, index, ...props }) => {
  return (
    <EditableContext.Provider value={form}>
      <tr {...props} />
    </EditableContext.Provider>
  );
};

const EditableFormRow = Form.create({ fieldNameProp: null })(EditableRow);

function defineProperty(obj, property, value) {
  Object.defineProperty(obj, property, {
    value,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

export default class PermissionSet extends PureComponent {
  state = {
    tableDataSource: [],
    currentRowData: {},
    permissionsDrawerVisible: false,
    editingRows: [],
    expandedRowKeys: [],
    processingRowKeys: [],
    lovsDrawerVisible: false,
  };

  getSnapshotBeforeUpdate(prevProps) {
    const { visible, menuDataSource } = this.props;
    return (
      visible && isNumber(menuDataSource.id) && menuDataSource.id !== prevProps.menuDataSource.id
    );
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    // If we have a snapshot value, we've just added new items.
    // Adjust scroll so these new items don't push the old ones out of view.
    // (snapshot here is the value returned from getSnapshotBeforeUpdate)
    if (snapshot) {
      this.fetchDataSource();
    }
  }

  @Bind()
  fetchDataSource(params) {
    const { handleQueryList = e => e, menuDataSource = {} } = this.props;
    handleQueryList(menuDataSource.id, params).then(res => {
      const { dataSource, defaultExpandedRowKeys } = res;
      this.setState({
        tableDataSource: dataSource,
        defaultExpandedRowKeys,
      });
    });
  }

  @Bind()
  onDrawerClose() {
    const { close = e => e } = this.props;
    this.setState({
      tableDataSource: [],
      currentRowData: {},
      editingRows: [],
      expandedRowKeys: [],
    });
    close();
  }

  @Bind()
  save(record, form) {
    const { handleSave = e => e, handleCreate = e => e, menuDataSource = {} } = this.props;
    const { processingRowKeys = [] } = this.state;
    const { validateFields = e => e } = form;
    const defaultCode = menuDataSource.code;
    const codePrefix = `${defaultCode}.ps.`;
    validateFields((err, values) => {
      if (isEmpty(err)) {
        const newRecord = {
          ...record,
          ...values,
          icon: 'link',
        };
        this.setState({
          processingRowKeys: uniqBy(processingRowKeys.concat(record.key)),
        });
        if (!isInteger(Number(record.key))) {
          newRecord.code = `${codePrefix}${values.code}`;
          handleCreate(newRecord, () => {
            this.fetchDataSource();
            // this.cancel(record);
            this.setState({
              processingRowKeys: processingRowKeys.filter(o => o !== record.key),
            });
          });
        } else {
          handleSave(newRecord, () => {
            this.fetchDataSource();
            this.cancel(record);
            this.setState({
              processingRowKeys: processingRowKeys.filter(o => o !== record.key),
            });
          });
        }
      }
    });
  }

  @Bind()
  operationRender(text, record) {
    const { handleEnable = e => e, processing = {}, currentRoleCode } = this.props;
    const { editingRows = [], processingRowKeys = [] } = this.state;
    const editing = !isEmpty(editingRows.filter(o => o.key === record.key));
    return (
      <EditableContext.Consumer>
        {form => (
          <span className="action-link">
            {editing ? (
              (processing.save || processing.create) &&
              !isEmpty(processingRowKeys.filter(o => o === record.key)) ? (
                <Icon type="loading" />
              ) : (
                <Fragment>
                  <a onClick={() => this.save(record, form)}>
                    {intl.get(`${commonPrompt}.button.save`).d('保存')}
                  </a>
                  <a onClick={() => this.cancel(record)}>
                    {intl.get(`${commonPrompt}.button.cancel`).d('取消')}
                  </a>
                </Fragment>
              )
            ) : (
              <Fragment>
                {(currentRoleCode === 'role/site/default/administrator' ||
                  currentRoleCode === 'role/organization/default/administrator') && (
                  <a onClick={() => this.addChild(record)}>
                    {intl.get(`${commonPrompt}.button.create`).d('新建')}
                  </a>
                )}
                <a onClick={() => this.edit(record)}>
                  {intl.get(`${commonPrompt}.button.edit`).d('编辑')}
                </a>
                {record.enabledFlag === 1 ? (
                  <a onClick={() => handleEnable(record, 'disable', this.fetchDataSource)}>
                    {intl.get(`${commonPrompt}.status.disable`).d('禁用')}
                  </a>
                ) : (
                  <a onClick={() => handleEnable(record, 'enable', this.fetchDataSource)}>
                    {intl.get(`${commonPrompt}.status.enable`).d('启用')}
                  </a>
                )}
                <a onClick={() => this.openPermissionsDrawer(record, record.editDetailFlag === 1)}>
                  {intl.get(`${viewMessagePrompt}.title.permissions`).d('权限')}
                </a>
                <a onClick={() => this.openLovsDrawer(record, record.editDetailFlag === 1)}>
                  {intl.get(`${viewMessagePrompt}.title.lovs`).d('Lov')}
                </a>
              </Fragment>
            )}
            {/* {record.newSubnodeFlag === 1 && (
              <a onClick={() => this.addChild(record)}>
                {intl.get(`${commonPrompt}.button.create`).d('新建')}
              </a>
            )} */}
          </span>
        )}
      </EditableContext.Consumer>
    );
  }

  @Bind()
  openPermissionsDrawer(currentRowData) {
    this.setState({
      currentRowData,
      permissionsDrawerVisible: true,
    });
  }

  @Bind()
  closePermissionsDrawer() {
    this.setState({
      currentRowData: {},
      permissionsDrawerVisible: false,
    });
  }

  @Bind()
  openLovsDrawer(currentRowData) {
    this.setState({
      currentRowData,
      lovsDrawerVisible: true,
    });
  }

  @Bind()
  closeLovsDrawer() {
    this.setState({
      currentRowData: {},
      lovsDrawerVisible: false,
    });
  }

  @Bind()
  add() {
    const { menuDataSource = {} } = this.props;
    const { tableDataSource = [], editingRows } = this.state;
    const item = {
      key: uuidv4(),
      type: 'ps',
      level: menuDataSource.level,
      enabledFlag: 1,
      newSubnodeFlag: 1,
      editDetailFlag: 1,
      parentId: menuDataSource.id,
    };
    this.setState({
      editingRows: uniqBy(editingRows.concat(item), 'key'),
      tableDataSource: [item].concat(tableDataSource),
    });
  }

  @Bind()
  addChild(parentRecord) {
    const { menuDataSource = {} } = this.props;
    const { tableDataSource = [], editingRows, expandedRowKeys = [] } = this.state;

    const item = {
      key: uuidv4(),
      type: 'ps',
      level: menuDataSource.level,
      enabledFlag: 1,
      newSubnodeFlag: 1,
      editDetailFlag: 1,
      parentId: parentRecord.id,
    };
    const getTableDataSource = (collections = [], keyPath = []) => {
      let cacheKeyPath = keyPath;
      return collections.map(n => {
        const m = n;
        if (m.id === cacheKeyPath[0]) {
          cacheKeyPath = cacheKeyPath.filter(o => cacheKeyPath.indexOf(o) !== 0);
          if (!isEmpty(m.subMenus) && !isEmpty(cacheKeyPath)) {
            m.subMenus = getTableDataSource(m.subMenus, cacheKeyPath);
          } else {
            defineProperty(
              item,
              'keyPath',
              !isEmpty(m.keyPath) ? m.keyPath.concat(m.key) : [m.key]
            );
            m.subMenus = uniqBy([item].concat(isEmpty(m.subMenus) ? [] : m.subMenus), 'key');
          }
        }
        return m;
      });
    };
    this.setState({
      editingRows: uniqBy(editingRows.concat(item), 'key'),
      tableDataSource: getTableDataSource(
        tableDataSource,
        (parentRecord.keyPath || []).concat(parentRecord.key)
      ),
      expandedRowKeys: uniqBy(expandedRowKeys.concat(parentRecord.key)),
    });
  }

  @Bind()
  edit(record) {
    const { editingRows } = this.state;
    this.setState({
      editingRows: uniqBy(editingRows.concat(record), 'key'),
    });
  }

  @Bind()
  cancel(record) {
    const { tableDataSource, editingRows } = this.state;
    function filterRecord(collections) {
      return isInteger(record.key)
        ? collections.map(n => (n.key === record.key ? record : n))
        : collections.filter(o => o.key !== record.key);
    }
    function getTableDataSource(collections = [], keyPath = []) {
      let cacheKeyPath = keyPath;
      return collections.map(n => {
        const m = n;
        if (m.id === cacheKeyPath[0]) {
          cacheKeyPath = cacheKeyPath.filter(o => cacheKeyPath.indexOf(o) !== 0);
          if (!isEmpty(m.subMenus) && !isEmpty(cacheKeyPath)) {
            m.subMenus = getTableDataSource(m.subMenus, cacheKeyPath);
          } else {
            m.subMenus = filterRecord(m.subMenus);
          }
          if (isEmpty(m.subMenus)) {
            m.subMenus = null;
          }
        }
        return m;
      });
    }
    const newTableDataSource = !isEmpty(record.keyPath)
      ? getTableDataSource(tableDataSource, record.keyPath)
      : filterRecord(tableDataSource);
    this.setState({
      tableDataSource: newTableDataSource,
      editingRows: editingRows.filter(o => o.key !== record.key),
    });
  }

  /**
   * expandAll - 全部展开
   */
  @Bind()
  expandAll() {
    const { defaultExpandedRowKeys } = this.state;
    this.setState({
      expandedRowKeys: defaultExpandedRowKeys,
    });
  }

  /**
   * collapseAll - 全部收起
   */
  @Bind()
  collapseAll() {
    this.setState({
      expandedRowKeys: [],
    });
  }

  @Bind()
  onTableExpand(expanded, record) {
    const { expandedRowKeys } = this.state;
    this.setState({
      expandedRowKeys: expanded
        ? uniqBy(expandedRowKeys.concat(record.key))
        : expandedRowKeys.filter(o => o !== record.key),
    });
  }

  @Bind()
  getColumns() {
    const { editingRows = [] } = this.state;
    const defaultColumns = [
      {
        title: intl.get(`${modelPrompt}.permissionSetCode`).d('权限集编码'),
        editable: true,
        dataIndex: 'code',
        width: 160,
      },
      {
        title: intl.get(`${modelPrompt}.permissionSetName`).d('权限集名称'),
        editable: true,
        dataIndex: 'name',
        width: 160,
      },
      {
        title: intl.get(`${modelPrompt}.sort`).d('序号'),
        editable: true,
        dataIndex: 'sort',
        width: 80,
      },
      {
        title: intl.get(`${modelPrompt}.description`).d('描述'),
        editable: true,
        dataIndex: 'description',
      },
      // {
      //   title: intl.get(`${modelPrompt}.controllerType`).d('权限集控制类型'),
      //   editable: true,
      //   width: 150,
      //   dataIndex: 'controllerType',
      // },
      {
        title: intl.get(`${commonPrompt}.status`).d('状态'),
        dataIndex: 'enabledFlag',
        render: enableRender,
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.table.column.option`).d('操作'),
        width: 260,
        render: this.operationRender,
      },
    ];
    return defaultColumns.map(n => {
      const { title, dataIndex, render, width, align, editable } = n;
      const column = {
        title,
        dataIndex,
        render,
        width,
        align,
        onCell: () => ({
          style: !isEmpty(editingRows)
            ? {
                whiteSpace: 'nowrap',
              }
            : {},
        }),
      };

      column.render = editable
        ? (text, record) => {
            const editableCellProps = {
              text,
              record,
              dataIndex,
              title,
            };
            return !isEmpty(editingRows.filter(o => o.key === record.key)) ? (
              <EditableContext.Consumer>
                {form => <EditableCell form={form} {...editableCellProps} />}
              </EditableContext.Consumer>
            ) : dataIndex === 'code' ? (
              record.viewCode
            ) : (
              text
            );
          }
        : render;
      return column;
    });
  }

  onPermissionsDrawerOk(key, permissions, keyPath) {
    const { tableDataSource } = this.state;
    const getTableDataSource = (collections = [], newKeyPath = []) => {
      let cacheKeyPath = newKeyPath;
      return collections.map(n => {
        const m = n;
        if (!isEmpty(cacheKeyPath) && !isEmpty(m.subMenus) && m.key === cacheKeyPath[0]) {
          cacheKeyPath = cacheKeyPath.filter(o => cacheKeyPath.indexOf(o) !== 0);
          m.subMenus = getTableDataSource(m.subMenus, cacheKeyPath);
        } else {
          m.permissions = m.key === key ? permissions : m.permissions;
        }
        return m;
      });
    };
    this.setState({
      tableDataSource: getTableDataSource(tableDataSource, keyPath),
    });
  }

  savePermissions(key, permissions, keyPath = [], cb = e => e) {
    const { handleSave = e => e } = this.props;
    const { tableDataSource } = this.state;
    let newRecord = {};
    const findDeep = (collections = [], newKeyPath = []) => {
      let cacheKeyPath = newKeyPath;
      return collections.forEach(n => {
        const m = n;
        if (!isEmpty(cacheKeyPath) && !isEmpty(m.subMenus) && m.key === cacheKeyPath[0]) {
          cacheKeyPath = cacheKeyPath.filter(o => cacheKeyPath.indexOf(o) !== 0);
          findDeep(m.subMenus, cacheKeyPath);
        } else if (m.key === key) {
          newRecord = m;
        }
      });
    };
    findDeep(tableDataSource, keyPath);
    newRecord.permissions = permissions;

    handleSave(newRecord, () => {
      this.fetchDataSource();
      cb();
    });
  }

  render() {
    const {
      currentRoleCode,
      visible,
      processing = {},
      menuDataSource = {},
      handleQueryPermissions = e => e,
      handleQueryPermissionsBySet = e => e,
      handleQueryLovsBySet = e => e,
      handleQueryLovs = e => e,
      onAssignPermissions = e => e,
      onDeletePermissions = e => e,
    } = this.props;
    const {
      tableDataSource,
      permissionsDrawerVisible,
      currentRowData,
      expandedRowKeys,
      // editingRows,
      lovsDrawerVisible,
    } = this.state;
    const drawerProps = {
      title: intl
        .get(`${viewMessagePrompt}.title.decompositionPermissionSetWithParam`, {
          name: menuDataSource.name,
        })
        .d(`"${menuDataSource.name}"的权限集`),
      visible,
      mask: true,
      maskStyle: { backgroundColor: 'rgba(0,0,0,.85)' },
      placement: 'right',
      destroyOnClose: true,
      onClose: this.onDrawerClose,
      width: 980,
      wrapClassName: styles['hiam-menu-config-permission-set'],
    };
    const components = {
      body: {
        row: EditableFormRow,
      },
    };
    const columns = this.getColumns();
    const tableProps = {
      dataSource: tableDataSource,
      components,
      columns,
      scroll: { x: tableScrollWidth(columns) },
      pagination: false,
      childrenColumnName: 'subMenus',
      expandedRowKeys,
      bordered: true,
      loading: processing.query,
      onExpand: this.onTableExpand,
    };

    // FIXME: 已经给定 scroll.x 了
    // if (!isEmpty(editingRows)) {
    //   tableProps.scroll = { x: true };
    // }
    const permissionsDrawerProps = {
      currentRoleCode,
      handleQueryPermissions, // 查询可分配的权限
      handleQueryPermissionsBySet, // 查询已分配的权限
      onAssignPermissions,
      onDeletePermissions,
      processing,
      visible: permissionsDrawerVisible,
      permissionSetDataSource: currentRowData,
      close: this.closePermissionsDrawer,
      menuId: menuDataSource.id,
      title: intl
        .get(`${viewMessagePrompt}.title.viewPermissions`, { name: currentRowData.name })
        .d(`“${currentRowData.name}”的权限`),
      editable: currentRowData.editDetailFlag === 1,
    };
    const lovsDrawerProps = {
      currentRoleCode,
      handleQueryLovs, // 查询可分配的Lov
      handleQueryLovsBySet, // 查询已分配的Lov
      onAssignPermissions,
      onDeletePermissions,
      processing,
      visible: lovsDrawerVisible,
      permissionSetDataSource: currentRowData,
      close: this.closeLovsDrawer,
      menuId: menuDataSource.id,
      title: intl
        .get(`${viewMessagePrompt}.title.viewLovs`, { name: currentRowData.name })
        .d(`“${currentRowData.name}”的Lov`),
      editable: currentRowData.editDetailFlag === 1,
    };
    const permissionCode = isTenantRoleLevel()
      ? ['hzero.bg.sys.menu.ps.create-permission-set']
      : ['hzero.sys.menu.ps.create-permission-set'];
    return (
      <Drawer {...drawerProps}>
        <QueryForm handleQueryList={this.fetchDataSource} />
        <br />
        <div className="action">
          <Button code={permissionCode} icon="plus" style={{ marginRight: 8 }} onClick={this.add}>
            {intl.get(`${commonPrompt}.button.create`).d('新建')}
          </Button>
          <Button icon="up" style={{ marginRight: 8 }} onClick={this.collapseAll}>
            {intl.get(`${commonPrompt}.button.collapseAll`).d('全部收起')}
          </Button>
          <Button icon="down" onClick={this.expandAll}>
            {intl.get(`${commonPrompt}.button.expandAll`).d('全部展开')}
          </Button>
        </div>
        <br />
        <Table {...tableProps} />
        <div className="footer">
          <Button onClick={this.onDrawerClose} type="primary">
            {intl.get(`${commonPrompt}.button.close`).d('关闭')}
          </Button>
        </div>
        {permissionsDrawerVisible && <Permissions {...permissionsDrawerProps} />}
        {lovsDrawerVisible && <Lovs {...lovsDrawerProps} />}
      </Drawer>
    );
  }
}
