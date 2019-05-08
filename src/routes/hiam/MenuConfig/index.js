/**
 * MenuConfig - 菜单配置
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { isEmpty } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getCurrentRole } from 'utils/utils';
import Editor from './Editor';
import MenuImport from './MenuImport';
import PermissionSet from './PermissionSet';
import QueryForm from './Form';
import List from './List';
import styles from './index.less';

const viewMessagePrompt = 'hiam.menuConfig.view.message';
const commonPrompt = 'hzero.common';

/**
 * index - 菜单配置
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} menuConfig - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading = {}, menuConfig }) => ({
  loading: {
    effects: {
      saveDir: loading.effects['menuConfig/saveDir'],
      createDir: loading.effects['menuConfig/createDir'],
      queryPermissions: loading.effects['menuConfig/queryPermissions'],
      queryParentDir: loading.effects['menuConfig/queryParentDir'],
      deleteMenu: loading.effects['menuConfig/deleteMenu'],
      queryTreeList: loading.effects['menuConfig/queryTreeList'],
      setMenuEnable: loading.effects['menuConfig/setMenuEnable'],
      queryPermissionSetTree: loading.effects['menuConfig/queryPermissionSetTree'],
      queryPermissionsById: loading.effects['menuConfig/queryPermissionsById'],
      queryPermissionsByIdAll: loading.effects['menuConfig/queryPermissionsByIdAll'], // 已分配的权限
      queryPermissionsByMenuId: loading.effects['menuConfig/queryPermissionsByMenuId'], // 可分配的权限
      queryLovsByIdAll: loading.effects['menuConfig/queryLovsByIdAll'], // 已分配的Lov
      queryLovByMenuId: loading.effects['menuConfig/queryLovByMenuId'], // 可分配的Lov
      assignPermissions: loading.effects['menuConfig/assignPermissions'], // 分配权限
      deletePermissions: loading.effects['menuConfig/deletePermissions'], // 删除权限
    },
  },
  menuConfig,
  currentRoleCode: getCurrentRole().code,
}))
@formatterCollections({ code: 'hiam.menuConfig' })
export default class MenuConfig extends PureComponent {
  constructor(props) {
    super(props);
    this.fetchList = this.fetchList.bind(this);
    this.closeMenuImportDrawer = this.closeMenuImportDrawer.bind(this);
  }

  state = {
    editorVisible: false,
    menuImportVisible: false,
    permissionSetVisible: false,
    currentRowData: {},
    expandedRowKeys: [],
    processingDeleteRow: null,
    processingEnableRow: null,
  };

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    this.fetchList();
    this.fetchAssignLevelCode();
    const lovCodes = {
      menuPrefix: 'HIAM.MENU_PREFIX', // 目录编码前缀
      menuType: 'HIAM.MENU_TYPE', // 菜单类型
    };
    // 初始化 值集
    this.props.dispatch({
      type: 'menuConfig/init',
      payload: {
        lovCodes,
      },
    });
  }

  /**
   * fetchList - 查询列表数据
   * @param {object} [params = {}] - 查询参数
   * @param {string} params.name - 目录/菜单名
   * @param {string} params.parentName - 上级目录
   */
  fetchList(params = {}) {
    const { dispatch } = this.props;
    dispatch({ type: 'menuConfig/queryTreeList', params }).then(() => {
      const { menuConfig } = this.props;
      const { list } = menuConfig;
      const { name, parentName } = params || {};
      if (!isEmpty(name) || !isEmpty(parentName)) {
        this.setState({
          expandedRowKeys: list.rowKeys || [],
        });
      } else {
        this.setState({
          expandedRowKeys: [],
        });
      }
    });
  }

  /**
   * fetchAssignLevelCode - 查询层级<HIAM.RESOURCE_LEVEL>code
   * @return {Array}
   */
  fetchAssignLevelCode() {
    const { dispatch } = this.props;
    return dispatch({ type: 'menuConfig/queryCode', payload: { lovCode: 'HIAM.RESOURCE_LEVEL' } });
  }

  /**
   * fetchDir - 查询上级目录
   * @param {object} [params = {}] - 查询参数
   * @param {!string} params.level - 层级
   * @param {Function} cb - 获取成功的回调函数
   */
  fetchDir(params, cb = e => e) {
    const { dispatch } = this.props;
    dispatch({ type: 'menuConfig/queryParentDir', params }).then(res => {
      if (res) {
        cb(res);
      }
    });
  }

  /**
   * fetchMenuPermissions - 查询菜单权限
   * @param {object} [params = {}] - 查询参数
   * @param {!string} params.level - 层级
   * @param {!number} [params.size=10] - 分页数目
   * @param {!number} [params.page=0] - 当前页
   * @return {Array}
   */
  fetchMenuPermissions(params) {
    const { dispatch } = this.props;
    const { currentRowData } = this.state;
    return dispatch({
      type: 'menuConfig/queryPermissions',
      params: { ...params, excludeHasAssignedMenuId: currentRowData.id },
    });
  }

  /**
   * fetchPermissionSetTree - 查询菜单权限集树
   * @param {!number} menuId - 菜单ID
   * @param {object} [params = {}] - 查询参数
   * @return {Array}
   */
  fetchPermissionSetTree(menuId, params) {
    const { dispatch } = this.props;
    return dispatch({ type: 'menuConfig/queryPermissionSetTree', menuId, params });
  }

  // 查询权限集下可分配的所有权限
  fetchPermissionsByMenuId(menuId, params) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'menuConfig/queryPermissionsByMenuId',
      menuId,
      params,
    });
  }

  // 可分配的Lov
  fetchLovByMenuId(menuId, params) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'menuConfig/queryLovByMenuId',
      menuId,
      params,
    });
  }

  assignPermissions(params = {}) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'menuConfig/assignPermissions',
      payload: {
        ...params,
      },
    });
  }

  deletePermissions(params = {}) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'menuConfig/deletePermissions',
      payload: {
        ...params,
      },
    });
  }

  fetchPermissionsById(permissionSetId, params) {
    const { dispatch } = this.props;
    return dispatch({ type: 'menuConfig/queryPermissionsById', permissionSetId, params });
  }

  // 查询权限集下已分配的权限
  fetchPermissionsByIdAll(permissionSetId, params) {
    const { dispatch } = this.props;
    return dispatch({ type: 'menuConfig/queryPermissionsByIdAll', permissionSetId, params });
  }

  // 查询权限集下已分配的Lov
  fetchLovsByIdAll(permissionSetId, params) {
    const { dispatch } = this.props;
    return dispatch({ type: 'menuConfig/queryLovsByIdAll', permissionSetId, params });
  }

  /**
   * importMenu - 菜单导入
   * @param {object} [params = {}] - 附件上传formData
   */
  importMenu(params) {
    const { dispatch } = this.props;
    const { getFieldsValue = e => e } = this.search || {};
    dispatch({ type: 'menuConfig/importMenu', params }).then(res => {
      if (res === 'success') {
        notification.success({
          message: intl.get(`${viewMessagePrompt}.importSuccess`).d('导入成功'),
        });
        this.closeMenuImportDrawer();
        this.fetchList(getFieldsValue());
      } else {
        notification.error({
          description: (JSON.parse(res) || {}).message,
        });
      }
    });
  }

  /**
   * create - 创建菜单/打开编辑右侧弹窗
   */
  create() {
    this.setState({
      editorVisible: true,
      currentRowData: {},
    });
  }

  /**
   * createDir - 创建目录
   * @param {!object} [params = {}] - form数据
   * @param {Function} cb - 获取成功的回调函数
   */
  createDir(params, cb = e => e) {
    const { dispatch } = this.props;
    const { getFieldsValue = e => e } = this.search || {};
    dispatch({ type: 'menuConfig/createDir', params }).then(res => {
      if (res) {
        notification.success();
        cb();
        this.fetchList(getFieldsValue());
      }
    });
  }

  /**
   * createPermissionSet - 新建权限集
   * @param {!object} [params = {}] - form数据
   * @param {Function} cb - 获取成功的回调函数
   */
  createPermissionSet(params, cb = e => e) {
    const { dispatch } = this.props;
    dispatch({ type: 'menuConfig/createDir', params }).then(res => {
      if (res) {
        notification.success();
        cb();
      }
    });
  }

  /**
   * saveDir - 保存目录
   * @param {!object} [params = {}] - form数据
   * @param {Function} cb - 获取成功的回调函数
   */
  saveDir(params, cb = e => e) {
    const { dispatch } = this.props;

    const { getFieldsValue = e => e } = this.search || {};
    dispatch({ type: 'menuConfig/saveDir', params }).then(res => {
      if (res) {
        notification.success();
        cb();
        this.fetchList(getFieldsValue());
      }
    });
  }

  /**
   * savePermissionSet - 更新权限集
   * @param {!object} [params = {}] - form数据
   * @param {Function} cb - 获取成功的回调函数
   */
  savePermissionSet(params, cb = e => e) {
    const { dispatch } = this.props;
    dispatch({ type: 'menuConfig/saveDir', params }).then(res => {
      if (res) {
        notification.success();
        cb();
      }
    });
  }

  /**
   * edit - 编辑菜单/打开编辑右侧弹窗
   * @param {!object} [record = {}] - 当前行数据
   */
  edit(record) {
    this.setState({
      editorVisible: true,
      currentRowData: record,
    });
  }

  /**
   * delete - 编辑菜单/打开编辑右侧弹窗
   * @param {!object} [record = {}] - 当前行数据
   */
  delete(record) {
    const { dispatch } = this.props;
    const { getFieldsValue = e => e } = this.search || {};
    this.setState({
      processingDeleteRow: record.id,
    });
    dispatch({
      type: 'menuConfig/deleteMenu',
      id: record.id,
    }).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        notification.success();
        this.fetchList(getFieldsValue());
      }
      this.setState({
        processingDeleteRow: null,
      });
    });
  }

  setPermissionSetEnable(record, paramType, cb = e => e) {
    const { dispatch } = this.props;
    dispatch({
      type: 'menuConfig/setPermissionSetEnable',
      payload: {
        id: record.id,
        _token: record._token,
        paramType,
      },
    }).then(res => {
      if (res) {
        notification.success();
        cb();
      }
    });
  }

  setMenuEnable(record, paramType) {
    const { dispatch } = this.props;
    const { getFieldsValue = e => e } = this.search || {};
    this.setState({
      processingEnableRow: record.id,
    });
    dispatch({
      type: 'menuConfig/setMenuEnable',
      payload: {
        id: record.id,
        _token: record._token,
        paramType,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchList(getFieldsValue());
      }
      this.setState({
        processingEnableRow: record.id,
      });
    });
  }

  /**
   * closeEditor - 关闭编辑右侧弹窗
   */
  closeEditor() {
    this.setState({
      editorVisible: false,
      currentRowData: {},
    });
  }

  /**
   * checkMenuDirExists - 校验目录编码是否存在
   * @param {!object} [params = {}] - 条件
   * @param {!string} params.code - 编码
   * @param {!string} params.level - 层级
   * @param {!number} params.tenantId - 租户编码
   * @param {!string} params.type - 类别
   * @return {null|object}
   */
  checkMenuDirExists(params) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'menuConfig/checkMenuDirExists',
      params,
    });
  }

  /**
   * openMenuImportDrawer - 打开菜单导入抽屉
   */
  openMenuImportDrawer() {
    this.setState({
      menuImportVisible: true,
    });
  }

  /**
   * closeMenuImportDrawer - 关闭菜单导入抽屉
   */
  closeMenuImportDrawer() {
    this.setState({
      menuImportVisible: false,
    });
  }

  /**
   * expandAll - 全部展开
   */
  expandAll() {
    const { menuConfig } = this.props;
    const { list } = menuConfig;
    this.setState({
      expandedRowKeys: list.rowKeys,
    });
  }

  /**
   * collapseAll - 全部收起
   */
  collapseAll() {
    this.setState({
      expandedRowKeys: [],
    });
  }

  /**
   * onTableRowExpand - 展开选中行
   */
  onTableRowExpand(expanded, record) {
    const { expandedRowKeys } = this.state;
    this.setState({
      expandedRowKeys: expanded
        ? expandedRowKeys.concat(record.id)
        : expandedRowKeys.filter(o => o !== record.id),
    });
  }

  openPermissionSetDrawer(record) {
    this.setState({
      currentRowData: record,
      permissionSetVisible: true,
    });
  }

  closePermissionSetDrawer() {
    this.setState({
      currentRowData: {},
      permissionSetVisible: false,
    });
  }

  render() {
    const { menuConfig = {}, loading = {}, currentRoleCode } = this.props;
    const {
      editorVisible,
      currentRowData,
      menuImportVisible,
      expandedRowKeys,
      processingDeleteRow,
      processingEnableRow,
      permissionSetVisible,
    } = this.state;
    const { code = {}, list, menuPrefixList = [], menuTypeList = [] } = menuConfig;
    const { effects = {} } = loading;
    const organizationId = getCurrentOrganizationId();

    const formProps = {
      ref: ref => {
        this.search = ref;
      },
      handleQueryList: this.fetchList.bind(this),
      levelCode: code['HIAM.RESOURCE_LEVEL'],
    };
    const editorProps = {
      menuPrefixList,
      menuTypeList,
      visible: editorVisible,
      handleCheckMenuDirExists: this.checkMenuDirExists.bind(this),
      levelCode: code['HIAM.RESOURCE_LEVEL'],
      onCancel: this.closeEditor.bind(this),
      dataSource: currentRowData,
      handleQueryDir: this.fetchDir.bind(this),
      handleSave: this.saveDir.bind(this),
      handleCreate: this.createDir.bind(this),
      handleQueryPermissions: this.fetchMenuPermissions.bind(this),
      handleQueryPermissionsBySet: this.fetchPermissionsById.bind(this),
      processing: {
        save: effects.saveDir,
        create: effects.createDir,
        queryPermissions: effects.queryPermissions,
        queryDir: effects.queryParentDir,
      },
    };
    const menuImportProps = {
      visible: menuImportVisible,
      onCancel: this.closeMenuImportDrawer.bind(this),
      handleImport: this.importMenu.bind(this),
    };
    const listProps = {
      levelCode: code['HIAM.RESOURCE_LEVEL'],
      dataSource: list.dataSource,
      handleEdit: this.edit.bind(this),
      handleDelete: this.delete.bind(this),
      handleEditPermissionSet: this.openPermissionSetDrawer.bind(this),
      handleEnable: this.setMenuEnable.bind(this),
      processing: {
        delete: effects.deleteMenu,
        query: effects.queryTreeList,
        setEnable: effects.setMenuEnable,
      },
      expandedRowKeys,
      uncontrolled: true,
      // onExpand: this.onTableRowExpand.bind(this),
      processingDeleteRow,
      processingEnableRow,
      organizationId,
    };
    const permissionSetProps = {
      currentRoleCode,
      visible: permissionSetVisible,
      menuDataSource: currentRowData,
      close: this.closePermissionSetDrawer.bind(this),
      handleQueryList: this.fetchPermissionSetTree.bind(this),
      handleQueryPermissionsBySet: this.fetchPermissionsByIdAll.bind(this), // 查询权限集下已分配的权限
      handleQueryPermissions: this.fetchPermissionsByMenuId.bind(this), // 查询权限集下可分配的所有权限
      handleQueryLovsBySet: this.fetchLovsByIdAll.bind(this), // 查询权限集下已分配的Lov
      handleQueryLovs: this.fetchLovByMenuId.bind(this), // 查询权限集下可分配的所有Lov
      onAssignPermissions: this.assignPermissions.bind(this),
      onDeletePermissions: this.deletePermissions.bind(this),
      handleSave: this.savePermissionSet.bind(this),
      handleCreate: this.createPermissionSet.bind(this),
      handleEnable: this.setPermissionSetEnable.bind(this),
      processing: {
        query: effects.queryPermissionSetTree,
        save: effects.saveDir,
        create: effects.createDir,
        queryPermissionsById: effects.queryPermissionsById,
        queryPermissionsByIdAll: effects.queryPermissionsByIdAll, // 已分配的权限
        queryPermissionsByMenuId: effects.queryPermissionsByMenuId, // 可分配的权限
        queryLovsByIdAll: effects.queryLovsByIdAll, // 已分配的Lov
        queryLovByMenuId: effects.queryLovByMenuId, // 可分配的Lov
        assignPermissions: effects.assignPermissions, // 分配权限
        deletePermissions: effects.deletePermissions, // 删除权限
      },
      // save:
    };

    return (
      <div className={styles['hiam-menu-config']}>
        <Header title={intl.get('hiam.menu.view.message.title').d('菜单配置')}>
          <Button type="primary" icon="plus" onClick={this.create.bind(this)}>
            {intl.get('hzero.common.button.create')}
          </Button>
          <Button icon="to-top" onClick={this.openMenuImportDrawer.bind(this)}>
            {intl.get('hiam.menu.view.button.importMenu').d('导入客户化菜单')}
          </Button>
          <Button icon="up" onClick={this.collapseAll.bind(this)} disabled={effects.queryTreeList}>
            {intl.get(`${commonPrompt}.button.collapseAll`).d('全部收起')}
          </Button>
          <Button icon="down" onClick={this.expandAll.bind(this)} disabled={effects.queryTreeList}>
            {intl.get(`${commonPrompt}.button.expandAll`).d('全部展开')}
          </Button>
        </Header>
        <Content>
          <QueryForm {...formProps} />
          <br />
          <List {...listProps} />
        </Content>
        <Editor {...editorProps} />
        <MenuImport {...menuImportProps} />
        <PermissionSet {...permissionSetProps} />
      </div>
    );
  }
}
