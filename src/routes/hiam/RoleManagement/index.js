/**
 * RoleManagement - 角色管理
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { stringify } from 'qs';
import { isEmpty, isFunction, isArray, isNumber, isObject, isString } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';

import notification from 'utils/notification';
import { getCurrentOrganizationId, createPagination, isTenantRoleLevel } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import MembersDrawer from './Members';
import Search from './Search';
import List from './List';
import AuthDrawer from './Auth';
import DetailDrawer from './Detail';
import PermissionDrawer from './Permissions';
import RoleAssignCardsEditModal from './Cards';

import styles from './index.less';

const viewTitlePrompt = 'hiam.roleManagement.view.title';
const viewButtonPrompt = 'hiam.roleManagement.view.button';
const commonPrompt = 'hzero.common';

function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}

/**
 * index - 角色管理
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} roleManagement - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading = {}, roleManagement }) => ({
  loading: {
    effects: {
      queryList: loading.effects['roleManagement/queryList'],
      saveMembers: loading.effects['roleManagement/saveMembers'],
      deleteMembers: loading.effects['roleManagement/deleteMembers'],
      queryMemberRolesUsers: loading.effects['roleManagement/queryMemberRolesUsers'],
      queryDetailForm: loading.effects['roleManagement/queryDetailForm'],
      saveRole: loading.effects['roleManagement/saveRole'],
      createRole: loading.effects['roleManagement/createRole'],
      copyRole: loading.effects['roleManagement/copyRole'],
      inheritRole: loading.effects['roleManagement/inheritRole'],
      queryPermissionMenus: loading.effects['roleManagement/queryPermissionMenus'],
      batchAssignPermissionSets: loading.effects['roleManagement/batchAssignPermissionSets'],
      batchUnassignPermissionSets: loading.effects['roleManagement/batchUnassignPermissionSets'],
      queryRoleAuth: loading.effects['roleManagement/queryRoleAuth'],
      queryRoleAuthType: loading.effects['roleManagement/queryRoleAuthType'],
      fetchRoleCards: loading.effects['roleManagement/fetchRoleCards'],
      removeRoleCards: loading.effects['roleManagement/removeRoleCards'],
      saveRoleCards: loading.effects['roleManagement/saveRoleCards'],
    },
  },
  roleManagement,
  tenantRoleLevel: isTenantRoleLevel(),
}))
@formatterCollections({ code: 'hiam.roleManagement' })
export default class RoleManagement extends PureComponent {
  constructor(props) {
    super(props);
    this.fetchList = this.fetchList.bind(this);
    this.fetchRoleSourceCode = this.fetchRoleSourceCode.bind(this);
    this.fetchAssignLevelCode = this.fetchAssignLevelCode.bind(this);
    this.fetchMemberRolesUsers = this.fetchMemberRolesUsers.bind(this);
    this.fetchCurrentRole = this.fetchCurrentRole.bind(this);
    this.redirectCreate = this.redirectCreate.bind(this);
    this.setMembersDrawerVisible = this.setMembersDrawerVisible.bind(this);
    this.openMembersDrawer = this.openMembersDrawer.bind(this);
    this.openPermissions = this.openPermissions.bind(this);
  }

  state = {
    membersDrawerVisible: false,
    membersDrawerDataSource: [],
    membersDrawerPagination: {},
    currentRowData: {},
    selectedRoleId: null,
    actionType: null,
    detailDrawerVisible: false,
    permissionDrawerVisible: false,
    currentRole: {},
    expandedRowKeys: [],
    roleAssignCardsEditModalProps: {
      visible: false,
      role: {}, // 编辑的角色
    },
  };

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    const { roleManagement = {}, location = {} } = this.props;
    const { code, list = {} } = roleManagement;

    this.fetchAssignLevelCode();

    this.fetchCurrentRole();
    if (isEmpty(list.dataSource) || (location.state || {}).refresh) {
      this.fetchList();
    }

    if (isEmpty(code['HIAM.ROLE_SOURCE'])) {
      this.fetchRoleSourceCode();
    }
  }

  /**
   * fetchList - 查询列表数据
   * @param {object} [params = {}] - 查询参数
   * @param {string} params.name - 目录/菜单名
   * @param {string} params.parentName - 上级目录
   */
  fetchList(params) {
    const { dispatch } = this.props;
    dispatch({ type: 'roleManagement/queryList', params }).then(() => {
      const { roleManagement } = this.props;
      const { list } = roleManagement;
      const { name, tenantId, roleSource } = params || {};
      if (!isEmpty(name) || !isEmpty(roleSource) || isNumber(tenantId)) {
        this.setState({
          expandedRowKeys: list.rowKeys || [],
        });
      }
    });
  }

  /**
   * fetchRoleSourceCode - 查询角色来源值集
   */
  fetchRoleSourceCode() {
    const { dispatch } = this.props;
    dispatch({ type: 'roleManagement/queryCode', payload: { lovCode: 'HIAM.ROLE_SOURCE' } });
  }

  /**
   * fetchRoleSourceCode - 查询层级值集
   */
  fetchAssignLevelCode() {
    const { dispatch } = this.props;
    return dispatch({
      type: 'roleManagement/queryCode',
      payload: { lovCode: 'HIAM.RESOURCE_LEVEL' },
    });
  }

  /**
   * fetchHrunitsTree - 查询组织
   * @param {!number} organizationId - 租户ID
   * @param {object} payload - 查询参数
   * @param {!number} payload.userId - 用户ID
   */
  fetchHrunitsTree(organizationId, payload) {
    const { dispatch } = this.props;

    return dispatch({
      type: 'roleManagement/queryHrunitsTree',
      organizationId,
      payload,
    });
  }

  /**
   * fetchMemberRolesUsers - 查询角色成员
   * @param {object} payload - 查询参数
   * @param {!number} payload.roleId - 用户ID
   * @param {!number} [payload.size=10] - 分页数目
   * @param {!number} [payload.page=0] - 当前页
   */
  fetchMemberRolesUsers(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'roleManagement/queryMemberRolesUsers',
      payload,
    });
  }

  fetchDetailForm(roleId) {
    const { dispatch } = this.props;
    return dispatch({ type: 'roleManagement/queryDetailForm', roleId });
  }

  fetchPermissionMenus(roleId, params = {}) {
    const { dispatch } = this.props;
    return dispatch({ type: 'roleManagement/queryPermissionMenus', roleId, params });
  }

  fetchCurrentRole() {
    const { dispatch } = this.props;
    return dispatch({ type: 'roleManagement/queryCurrentRole' }).then(res => {
      if (res) {
        this.setState({
          currentRole: res,
        });
      }
    });
  }

  saveRoleDetail(roleId, data, cb = e => e) {
    const {
      dispatch,
      roleManagement: { list },
    } = this.props;
    const { getFieldsValue = e => e } = this.queryForm;
    return dispatch({
      type: 'roleManagement/saveRole',
      roleId,
      data,
    }).then(res => {
      if (res) {
        notification.success({
          message: intl.get(`${commonPrompt}.notification.success.save`).d('保存成功'),
        });
        this.fetchList({
          page: list.pagination,
          ...getFieldsValue(),
        });
        cb();
      }
    });
  }

  createRole(data, cb = e => e) {
    const { dispatch } = this.props;
    const { getFieldsValue = e => e } = this.queryForm;
    return dispatch({ type: 'roleManagement/createRole', data }).then(res => {
      if (res) {
        notification.success({
          message: intl.get(`${commonPrompt}.notification.success.create`).d('创建成功'),
        });
        this.fetchList(getFieldsValue());
        cb();
      }
    });
  }

  copyRole(data, cb = e => e) {
    const {
      dispatch,
      roleManagement: { list },
    } = this.props;
    const { getFieldsValue = e => e } = this.queryForm;
    return dispatch({ type: 'roleManagement/copyRole', data }).then(res => {
      if (res) {
        notification.success({
          message: intl.get(`${commonPrompt}.notification.success.create`).d('创建成功'),
        });
        this.fetchList({ page: list.pagination, ...getFieldsValue() });
        cb();
      }
    });
  }

  inheritRole(data, cb = e => e) {
    const {
      dispatch,
      roleManagement: { list },
    } = this.props;
    const { getFieldsValue = e => e } = this.queryForm;
    return dispatch({ type: 'roleManagement/inheritRole', data }).then(res => {
      if (res) {
        notification.success({
          message: intl.get(`${commonPrompt}.notification.success.create`).d('创建成功'),
        });
        this.fetchList({ page: list.pagination, ...getFieldsValue() });
        cb();
      }
    });
  }

  batchUnassignPermissionSets(roleId, data, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'roleManagement/batchUnassignPermissionSets',
      roleId,
      data,
    }).then(res => {
      if (res) {
        notification.success();
        cb();
      }
    });
  }

  batchAssignPermissionSets(roleId, data, cb = e => e) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'roleManagement/batchAssignPermissionSets',
      roleId,
      data,
    }).then(res => {
      if (res && res.failed) {
        notification.error({
          description: res.message,
        });
      } else {
        notification.success();
        cb();
      }
    });
  }

  /**
   * onExpand - 展开树
   * @param {boolean} expanded - 是否展开
   * @param {record} record - 当前行数据
   */
  onExpand(expanded, record) {
    const { expandedRowKeys } = this.state;

    this.setState({
      expandedRowKeys: expanded
        ? expandedRowKeys.concat(record.id)
        : expandedRowKeys.filter(o => o !== record.id),
    });
  }

  /**
   * openMembersDrawer - 打开分配用户抽屉
   * @param {object} [role={}] - 当前行数据
   */
  openMembersDrawer(role) {
    this.setState({
      currentRowData: role,
    });
    this.setMembersDrawerVisible(true);
  }

  /**
   * closeMembersDrawer - 关闭分配用户抽屉
   */
  closeMembersDrawer() {
    this.setState({
      currentRowData: {},
    });
    this.setMembersDrawerVisible(false);
  }

  /**
   * redirectCreate - 跳转创建角色页面
   * @param {object} [params={}] - 查询参数
   * @param {number} params.copy_from - 复制并创建角色ID
   * @param {number} params.inherit_from - 继承自角色ID
   * @param {string} params.name - 继承自角色名称
   */
  redirectCreate(params = {}) {
    const { dispatch } = this.props;
    dispatch(routerRedux.push({ pathname: '/hiam/role/create', search: stringify(params) }));
  }

  /**
   * redirectEdit - 跳转编辑角色页面
   * @param {number} id - 角色ID
   */
  redirectEdit(id) {
    const { dispatch } = this.props;
    dispatch(routerRedux.push({ pathname: `/hiam/role/edit-detail/${id}` }));
  }

  /**
   * redirectView - 跳转查看角色页面
   * @param {number} id - 角色ID
   */
  redirectView(id) {
    const { dispatch } = this.props;
    dispatch(routerRedux.push({ pathname: `/hiam/role/detail/${id}` }));
  }

  /**
   * setMembersDrawerVisible - 控制分配用户抽屉是否打开
   * @param {boolean} [membersDrawerVisible=false] - 分配用户抽屉显示状态
   */
  setMembersDrawerVisible(membersDrawerVisible = false) {
    this.setState({
      membersDrawerVisible,
    });
  }

  /**
   * setMembersDrawerDataSource - 设置分配用户表格数据
   * @param {Array} [dataSource=[]] - 数据源
   * @param {object} [pagination={}] - 分页
   * @param {!number} [pagination.size=10] - 分页数目
   * @param {!number} [pagination.page=0] - 当前页
   */
  setMembersDrawerDataSource(dataSource = [], pagination = {}) {
    const { membersDrawerPagination } = this.state;
    this.setState({
      membersDrawerDataSource: dataSource,
      membersDrawerPagination: isEmpty(pagination)
        ? createPagination({
            number: membersDrawerPagination.current - 1,
            size:
              dataSource.length > membersDrawerPagination.pageSize
                ? dataSource.length
                : membersDrawerPagination.pageSize,
            totalElements: dataSource.length,
          })
        : pagination,
    });
  }

  /**
   * exportList - 导出
   */
  exportList() {}

  /**
   * expandAll - 全部展开
   */
  expandAll() {
    const { roleManagement = {} } = this.props;
    const { list } = roleManagement;
    this.setState({
      expandedRowKeys: list.rowKeys || [],
    });
  }

  /**
   * expandAll - 全部收起
   */
  collapseAll() {
    this.setState({
      expandedRowKeys: [],
    });
  }

  openDetail() {
    this.setState({
      detailDrawerVisible: true,
      actionType: 'create',
    });
  }

  closeDetail() {
    this.setState({
      actionType: null,
      currentRowData: {},
      detailDrawerVisible: false,
    });
  }

  openPermissions(record) {
    this.setState({
      permissionDrawerVisible: true,
      currentRowData: record,
    });
  }

  closePermission() {
    this.setState({
      permissionDrawerVisible: false,
      currentRowData: {},
    });
  }

  /**
   * handleAction - 表格按钮事件函数
   * @param {!string} action - 事件类型
   * @param {!object} record - 当前行数据
   */
  handleAction(action, record) {
    const {
      dispatch = e => e,
      roleManagement: { list },
    } = this.props;
    const { getFieldsValue = e => e } = this.queryForm;
    const openDetail = (actionType, options = {}) => {
      if (!isEmpty(actionType)) {
        this.setState({
          actionType,
          currentRowData: actionType === 'edit' || actionType === 'view' ? record : {},
          detailDrawerVisible: true,
          ...options,
        });
      }
    };
    const defaultAction = {
      edit: () => {
        // this.redirectEdit(record.id);
        openDetail('edit');
      },
      enabled: () => {
        dispatch({
          type: 'roleManagement/setRoleEnabled',
          payload: { id: record.id, _token: record._token, status: !record.enabled },
        }).then(res => {
          const parseResult = isJSON(res) ? JSON.parse(res) : res;
          if (parseResult.failed) {
            notification.error({ description: parseResult.message });
          } else {
            notification.success();
            this.fetchList({ ...getFieldsValue(), page: list.pagination });
          }
        });
      },
      copy: () => {
        // this.redirectCreate({ copy_from: record.id });
        openDetail('copy', { copyFormId: record.id });
      },
      inherit: () => {
        // this.redirectCreate({ inherit_from: record.id, name: record.name });
        openDetail('inherit', { inheritFormId: record.id, inheritedRoleName: record.name });
      },
      view: () => {
        // this.redirectView(record.id);
        openDetail('view');
      },
      editPermission: () => {
        this.showModal(record.id);
      },
      editMembers: () => {
        this.openMembersDrawer(record);
      },
      assignPermissions: () => {
        this.openPermissions(record);
      },
      assignCards: () => {
        this.openRoleAssignCardsEditModal(record);
      },
    };

    if (defaultAction[action]) {
      defaultAction[action]();
    }
  }

  /**
   * handleQueryMembers - 查询角色成员钩子函数
   * @param {object} params - 查询参数
   * @param {!number} params.roleId - 用户ID
   * @param {!number} [params.size=10] - 分页数目
   * @param {!number} [params.page=0] - 当前页
   */
  handleQueryMembers(params = {}) {
    const { currentRowData } = this.state;
    return this.fetchMemberRolesUsers({ roleId: currentRowData.id, ...params });
  }

  /**
   * handleSaveMembers - 保存角色成员钩子函数
   * @param {object} data - 表单数据
   * @param {!number} isEdit - 后台关键参数
   * @param {!function} cb - 异步事件函数
   */
  handleSaveMembers(data, isEdit = false, cb) {
    const {
      dispatch,
      roleManagement: { list },
    } = this.props;
    const { getFieldsValue = e => e } = this.queryForm;
    dispatch({
      type: 'roleManagement/saveMembers',
      data,
      isEdit,
    }).then(res => {
      if (res) {
        this.fetchList({ page: list.pagination, ...getFieldsValue() } || {});
        if (isFunction(cb)) {
          cb();
        }
      }
    });
  }

  /**
   * handleDeleteMembers - 删除角色成员钩子函数
   * @param {object} data - 表单数据
   * @param {!function} cb - 异步事件函数
   */
  handleDeleteMembers(data, cb = e => e) {
    const { dispatch } = this.props;
    dispatch({
      type: 'roleManagement/deleteMembers',
      data,
    }).then(res => {
      if (res && res.failed) {
        notification.error({ description: res.message });
      } else {
        cb();
      }
    });
  }

  /**
   * 数据权限维护控制
   */
  authDrawer;

  @Bind()
  showModal(roleId) {
    const { dispatch } = this.props;

    this.setState(
      {
        selectedRoleId: roleId,
      },
      () => {
        this.handleModalVisible(true);
        dispatch({
          type: 'roleManagement/queryRoleAuthType',
        });
        dispatch({
          type: 'roleManagement/queryRoleAuth',
          payload: {
            roleId,
            body: {
              page: 0,
              size: 10,
            },
          },
        });
      }
    );
  }

  @Bind()
  hideModal() {
    const { saving = false } = this.props;
    if (!saving) {
      this.authDrawer.resetState();
      this.handleModalVisible(false);
      this.authDrawer.resetState();
    }
  }

  handleModalVisible(flag) {
    if (flag === false && this.authDrawer) {
      this.authDrawer.resetForm();
    }
    this.setState({
      modalVisible: !!flag,
    });
  }

  @Bind()
  queryAuthDocType(
    params = {
      page: 0,
      size: 10,
    }
  ) {
    const { dispatch } = this.props;
    const { selectedRoleId: roleId } = this.state;
    dispatch({
      type: 'roleManagement/queryRoleAuth',
      payload: {
        roleId,
        body: params,
      },
    });
  }

  @Bind()
  saveAuthDocType(data) {
    const { dispatch } = this.props;
    const { selectedRoleId: roleId } = this.state;
    if (!isEmpty(data)) {
      dispatch({
        type: 'roleManagement/saveRoleAuth',
        payload: {
          roleId,
          body: data,
        },
      }).then(res => {
        if (isArray(res)) {
          notification.success();
          this.hideModal();
        } else {
          notification.error();
        }
      });
    } else {
      this.hideModal();
    }
  }

  @Bind()
  deleteAuthDocType(data) {
    const { dispatch } = this.props;
    const { selectedRoleId: roleId } = this.state;
    dispatch({
      type: 'roleManagement/deleteRoleAuth',
      payload: {
        roleId,
        body: data,
      },
    }).then(() => {
      this.queryAuthDocType();
    });
  }

  @Bind()
  onListChange(page) {
    const { getFieldsValue = e => e } = this.queryForm;
    this.fetchList({ page, ...getFieldsValue() });
  }

  // 角色分配卡片
  @Bind()
  fetchRoleCards(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'roleManagement/fetchRoleCards',
      payload,
    });
  }

  @Bind()
  removeRoleCards(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'roleManagement/removeRoleCards',
      payload,
    });
  }

  /**
   * 打开角色分配租户模态框
   */
  openRoleAssignCardsEditModal(editRecord) {
    this.setState({
      roleAssignCardsEditModalProps: {
        role: editRecord,
        visible: true,
      },
    });
  }

  hiddenRoleAssignCardsEditModal() {
    this.setState({
      roleAssignCardsEditModalProps: {
        role: {},
        visible: false,
      },
    });
  }

  // 角色分配卡片 模态框 确认
  @Bind()
  handleRoleAssignOk(payload) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'roleManagement/saveRoleCards',
      payload,
    }).then(res => {
      if (res) {
        notification.success();
        // 成功 关闭模态框
        this.hiddenRoleAssignCardsEditModal();
      }
    });
  }

  // 角色分配卡片 模态框 取消
  @Bind()
  handleRoleAssignCancel() {
    this.hiddenRoleAssignCardsEditModal();
  }

  /**
   * render
   * @return React.element
   */
  render() {
    const { roleManagement = {}, loading = {}, tenantRoleLevel } = this.props;
    const {
      membersDrawerVisible,
      membersDrawerDataSource,
      membersDrawerPagination,
      currentRowData,
      selectedRoleId,
      detailDrawerVisible,
      actionType,
      inheritedRoleName,
      copyFormId,
      inheritFormId,
      permissionDrawerVisible,
      currentRole,
      expandedRowKeys,
      roleAssignCardsEditModalProps,
    } = this.state;
    const {
      code,
      list = {},
      roleAuth = {},
      roleAuthScopeCode = [],
      roleAuthScopeTypeCode = [],
    } = roleManagement;
    const { effects } = loading;
    const organizationId = getCurrentOrganizationId();

    const searchProps = {
      ref: node => {
        this.queryForm = node;
      },
      handleQueryList: this.fetchList,
      code: code['HIAM.ROLE_SOURCE'],
      loading: effects.queryList,
      tenantRoleLevel,
      organizationId,
    };

    const listProps = {
      dataSource: list.dataSource || [],
      pagination: list.pagination || {},
      loading: effects.queryList,
      code: code['HIAM.ROLE_SOURCE'],
      handleAction: this.handleAction.bind(this),
      onExpand: this.onExpand.bind(this),
      expandedRowKeys,
      currentRole,
      organizationId,
      tenantRoleLevel,
      onListChange: this.onListChange,
    };
    const membersDrawerProps = {
      tenantRoleLevel,
      visible: membersDrawerVisible,
      title: intl.get(`${viewTitlePrompt}.members`).d('分配用户'),
      contentTitle: intl
        .get(`${viewTitlePrompt}.content.members`, {
          name: currentRowData.name,
        })
        .d(`给"${currentRowData.name}"分配用户`),
      roleDatasource: currentRowData,
      resourceLevel: code['HIAM.RESOURCE_LEVEL'],
      processing: {
        save: effects.saveMembers,
        delete: effects.deleteMembers,
        query: effects.queryMemberRolesUsers,
      },
      handleSave: this.handleSaveMembers.bind(this),
      close: this.closeMembersDrawer.bind(this),
      handleFetchData: this.handleQueryMembers.bind(this),
      handleFetchHrunitsTree: this.fetchHrunitsTree.bind(this),
      handleSetDataSource: this.setMembersDrawerDataSource.bind(this),
      handleDelete: this.handleDeleteMembers.bind(this),
      dataSource: membersDrawerDataSource,
      pagination: membersDrawerPagination,
    };

    const detailDrawerProps = {
      visible: detailDrawerVisible,
      actionType,
      organizationId: currentRole.tenantId,
      organizationName: currentRole.tenantName,
      roleId: currentRowData.id,
      processing: {
        query: effects.queryDetailForm,
        save: effects.saveRole,
        create: effects.createRole,
        copy: effects.copyRole,
        inherit: effects.inheritRole,
      },
      close: this.closeDetail.bind(this),
      fetchDataSource: this.fetchDetailForm.bind(this),
      save: this.saveRoleDetail.bind(this),
      create: this.createRole.bind(this),
      copy: this.copyRole.bind(this),
      inherit: this.inheritRole.bind(this),
      inheritedRoleName,
      roleSourceCode: code['HIAM.ROLE_SOURCE'] || [],
      roleLevel: code['HIAM.RESOURCE_LEVEL'] || [],
      parentRoleId: currentRole.id,
      parentRoleName:
        actionType === 'edit' || actionType === 'view'
          ? currentRowData.parentRoleName
          : currentRole.name,
      level: currentRole.level,
      copyFormId,
      inheritFormId,
      currentRowData,
      tenantRoleLevel,
    };

    const permissionDrawerProps = {
      tenantRoleLevel,
      visible: permissionDrawerVisible,
      close: this.closePermission.bind(this),
      roleName: currentRowData.name,
      roleId: currentRowData.id,
      processing: {
        query: effects.queryPermissionMenus,
        batchAssignPermissionSets: effects.batchAssignPermissionSets,
        batchUnassignPermissionSets: effects.batchUnassignPermissionSets,
      },
      fetchDataSource: this.fetchPermissionMenus.bind(this),
      batchAssignPermissionSets: this.batchAssignPermissionSets.bind(this),
      batchUnassignPermissionSets: this.batchUnassignPermissionSets.bind(this),
    };

    // 工作台配置的属性
    const roleAssignProps = {
      ...roleAssignCardsEditModalProps,
      tenantRoleLevel,
      onFetchRoleCards: this.fetchRoleCards,
      onRemoveRoleCards: this.removeRoleCards,
      onOk: this.handleRoleAssignOk,
      onCancel: this.handleRoleAssignCancel,
      loading: {
        fetchRoleCards: effects.fetchRoleCards,
        removeRoleCards: effects.removeRoleCards,
        saveRoleCards: effects.saveRoleCards,
      },
    };

    return (
      <div className={styles['hiam-role-list']}>
        <Header title={intl.get(`${viewTitlePrompt}.listHeader`).d('角色管理')}>
          <Button icon="plus" type="primary" onClick={this.openDetail.bind(this)}>
            {intl.get(`${viewButtonPrompt}.addRole`).d('新建角色')}
          </Button>
          {/* <Button icon="export" onClick={this.exportList.bind(this)}>
            {intl.get(`${commonPrompt}.button.export`).d('导出')}
          </Button> */}
          {/* <Button icon="up" onClick={this.collapseAll.bind(this)} disabled={effects.queryList}>
            {intl.get(`${commonPrompt}.button.collapseAll`).d('全部收起')}
          </Button>
          <Button icon="down" onClick={this.expandAll.bind(this)} disabled={effects.queryList}>
            {intl.get(`${commonPrompt}.button.expandAll`).d('全部展开')}
          </Button> */}
        </Header>
        <Content>
          <Search {...searchProps} />
          <br />
          <List {...listProps} />
        </Content>
        <MembersDrawer {...membersDrawerProps} />
        <AuthDrawer
          sideBar
          destroyOnClose
          title={intl.get(`${viewTitlePrompt}.editPermission`).d('维护数据权限')}
          onRef={ref => {
            this.authDrawer = ref;
          }}
          roleId={selectedRoleId}
          roleAuth={roleAuth}
          roleAuthScopeCode={roleAuthScopeCode}
          roleAuthScopeTypeCode={roleAuthScopeTypeCode}
          handleSave={this.saveAuthDocType}
          handleDelete={this.deleteAuthDocType}
          handleQuery={this.queryAuthDocType}
          loading={
            this.props.loading.effects.queryRoleAuth && this.props.loading.effects.queryRoleAuthType
          }
          modalVisible={this.state.modalVisible}
          hideModal={this.hideModal}
          width={800}
        />
        <DetailDrawer {...detailDrawerProps} />
        <PermissionDrawer {...permissionDrawerProps} />
        <RoleAssignCardsEditModal {...roleAssignProps} />
      </div>
    );
  }
}
