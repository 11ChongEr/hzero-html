/**
 * roleManagement - 角色管理model
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { isEmpty } from 'lodash';
import {
  getResponse,
  createPagination,
  getCurrentOrganizationId,
  getCurrentRole,
  isTenantRoleLevel,
} from 'utils/utils';
import { queryIdpValue } from '../../services/api';
import {
  queryCode,
  queryRole,
  queryOrganizationRole,
  enableRole,
  queryLabels,
  createRole,
  createOrganizationRole,
  editRole,
  editOrganizationRole,
  copyRole,
  copyOrganizationRole,
  inheritRole,
  inheritOrganizationRole,
  queryPermissionSets,
  queryLevelPermissions,
  queryOrganizationLevelPermissions,
  queryHrunitsTree,
  queryMemberRolesUsers,
  queryOrganizationMemberRolesUsers,
  saveMembers,
  saveOrganizationMembers,
  deleteMember,
  deleteOrganizationMember,
  queryRoleAuth,
  saveRoleAuth,
  deleteRoleAuth,
  queryPermissionMenus,
  queryCurrentRole,
  batchAssignPermissionSets,
  batchAssignOrganizationPermissionSets,
  batchUnassignPermissionSets,
  batchUnassignOrganizationPermissionSets,
  queryCreatedSubroles,
  // 角色分配卡片相关
  roleCardsQuery,
  roleCardsDelete,
  roleCardsInsertOrUpdate,
  // 角色分配卡片相关 租户级
  orgRoleCardsQuery,
  orgRoleCardsDelete,
  orgRoleCardsInsertOrUpdate,
} from '../../services/hiam/roleManagementService';

/**
 * tableState - table默认属性配置
 */
const tableState = {
  dataSource: [],
  pagination: {
    pageSize: 10,
    total: 0,
    current: 1,
  },
};

/**
 * 对象property属性定义方法
 * @function defineProperty
 * @param {!object} obj - 目标对象
 * @param {!string} property - 对象属性名称
 * @param {any} value - 属性值
 * @returns
 */
function defineProperty(obj, property, value) {
  Object.defineProperty(obj, property, {
    value,
    writable: true,
    enumerable: false,
    configurable: true,
  });
}

export default {
  namespace: 'roleManagement',
  state: {
    code: {}, // 值集集合
    list: {
      // 列表页面数据集合
      expandedRowKeys: [], // 可展开的行数据key集合
      dataSource: [], // 表格数据
      rowKeys: [], // 用于控制是否全部展开/收起的行数据key集合
    },
    detail: {
      // 角色管理明细编辑页面数据逻辑集合
      form: {}, // 表单数据集合
      permissions: {
        ...tableState,
      },
      permissionSets: [],
    },
    roleAuth: {},
    roleAuthScopeCode: [],
    roleAuthScopeTypeCode: [],
  },
  effects: {
    // 查询角色列表数据
    *queryList({ params }, { put, call }) {
      // const organizationId = getCurrentOrganizationId();
      const { id } = getCurrentRole();
      const res = yield call(queryCreatedSubroles, id, params);
      const response = getResponse(res);
      const rowKeys = [];

      /**
       * 组装新dataSource
       * @function assignListData
       * @param {!Array} [collections = []] - 树节点集合
       * @returns {Array} - 新的dataSourcee
       */
      function assignListData(collections = []) {
        return collections.map(n => {
          const m = n;
          if (id === m.id) {
            defineProperty(m, 'disadbleCurrentEnabled', true);
            defineProperty(m, 'disadbleEdit', true);
          } else {
            defineProperty(m, 'disadbleView', true);
          }
          if (isEmpty(m.childRoles)) {
            m.childRoles = null;
          } else {
            m.childRoles = assignListData(m.childRoles);
            rowKeys.push(m.id);
          }
          return m;
        });
      }

      if (response) {
        const dataSource = assignListData(isEmpty(response) ? [] : response.content);
        yield put({
          type: 'updateRoleListReducer',
          payload: {
            dataSource,
            pagination: createPagination(response),
            rowKeys,
          },
        });
      }
    },
    // 查询角色管理明细页面表单
    *queryDetailForm({ roleId }, { call }) {
      const organizationId = getCurrentOrganizationId();
      let res;
      if (isTenantRoleLevel()) {
        res = yield call(queryOrganizationRole, roleId, organizationId);
      } else {
        res = yield call(queryRole, roleId);
      }
      const response = getResponse(res);
      // if (response) {
      //   yield put({
      //     type: 'updateRoleDetailReducer',
      //     payload: {
      //       form: response,
      //     },
      //   });
      // }
      return response || {};
    },
    // 设置角色是否启用
    *setRoleEnabled({ payload }, { call }) {
      const response = yield call(enableRole, payload);
      return response;
    },
    // 查询值集
    *queryCode({ payload }, { put, call }) {
      const response = yield call(queryCode, payload);
      if (response && !response.failed) {
        yield put({
          type: 'setCodeReducer',
          payload: {
            [payload.lovCode]: response,
          },
        });
      }
    },
    *queryRole({ payload }, { put, call }) {
      const response = yield call(queryRole, payload);
      if (response && !response.failed) {
        yield put({
          type: 'updateRoleDetailReducer',
          payload: {
            form: response,
          },
        });
      }
    },
    *queryLabels({ payload }, { call }) {
      const response = yield call(queryLabels, payload);
      return response && !response.failed ? response : [];
    },
    // 查询可分配的所有权限层级
    *queryAvailablePermissionSets({ roleId, params }, { call }) {
      const res = yield call(queryPermissionSets, roleId, params);
      return getResponse(res);
    },
    *queryLevelPermissions({ id, params = {} }, { call }) {
      const organizationId = getCurrentOrganizationId();
      let res;
      if (isTenantRoleLevel()) {
        res = yield call(queryOrganizationLevelPermissions, id, params, organizationId);
      } else {
        res = yield call(queryLevelPermissions, id, params);
      }
      return getResponse(res);
    },

    // 创建角色
    *createRole({ data }, { call }) {
      const organizationId = getCurrentOrganizationId();
      let response;
      if (isTenantRoleLevel()) {
        response = yield call(createOrganizationRole, data, organizationId);
      } else {
        response = yield call(createRole, data);
      }
      return getResponse(response);
    },

    // 修改角色
    *saveRole({ data }, { call }) {
      const organizationId = getCurrentOrganizationId();
      let response;
      if (isTenantRoleLevel()) {
        response = yield call(editOrganizationRole, data, organizationId);
      } else {
        response = yield call(editRole, data);
      }
      return getResponse(response);
    },

    // 复制并创建角色
    *copyRole({ data }, { call }) {
      const organizationId = getCurrentOrganizationId();
      let response;
      if (isTenantRoleLevel()) {
        response = yield call(copyOrganizationRole, data, organizationId);
      } else {
        response = yield call(copyRole, data);
      }
      return getResponse(response);
    },

    // 继承并创建角色
    *inheritRole({ data }, { call }) {
      const organizationId = getCurrentOrganizationId();
      let response;
      if (isTenantRoleLevel()) {
        response = yield call(inheritOrganizationRole, data, organizationId);
      } else {
        response = yield call(inheritRole, data);
      }
      return getResponse(response);
    },

    // 查询组织架构,用于分配成员时的弹出框选择
    *queryHrunitsTree({ organizationId, payload }, { call }) {
      const res = yield call(queryHrunitsTree, payload, organizationId);

      function assignListData(collections = []) {
        return collections.map(n => {
          const m = n;
          if (isEmpty(m.childHrUnits)) {
            m.childHrUnits = null;
          } else {
            m.childHrUnits = assignListData(m.childHrUnits);
          }
          return m;
        });
      }

      const response = getResponse(res);
      return assignListData(isEmpty(response) ? [] : response);
    },

    // 查询成员角色
    *queryMemberRolesUsers({ payload }, { call }) {
      const organizationId = getCurrentOrganizationId();
      let res;
      if (isTenantRoleLevel()) {
        res = yield call(queryOrganizationMemberRolesUsers, payload, organizationId);
      } else {
        res = yield call(queryMemberRolesUsers, payload);
      }
      const response = getResponse(res);
      return response
        ? {
            dataSource: (response.content || []).map(n => ({ key: n.id, ...n })),
            pagination: createPagination(res),
          }
        : null;
    },

    // 保存成员
    *saveMembers({ data, isEdit }, { call }) {
      const organizationId = getCurrentOrganizationId();
      let res;
      if (isTenantRoleLevel()) {
        res = yield call(saveOrganizationMembers, data, isEdit, organizationId);
      } else {
        res = yield call(saveMembers, data, isEdit);
      }
      return getResponse(res);
    },

    // 删除成员
    *deleteMembers({ data }, { call }) {
      const organizationId = getCurrentOrganizationId();
      let res;
      if (isTenantRoleLevel()) {
        res = yield call(deleteOrganizationMember, data, organizationId);
      } else {
        res = yield call(deleteMember, data);
      }
      return res;
    },
    *queryPermissionMenus({ roleId, params }, { call }) {
      const res = yield call(queryPermissionMenus, roleId, params);
      const response = getResponse(res);
      const defaultExpandedRowKeys = [];

      /**
       * 组装新dataSource
       * @function assignListData
       * @param {!Array} [collections = []] - 树节点集合
       * @returns {Array} - 新的dataSourcee
       */
      function assignListData(collections = []) {
        return collections.map(n => {
          const m = n;
          m.key = n.id;
          if (isEmpty(m.subMenus)) {
            m.subMenus = null;
          } else {
            m.subMenus = assignListData(m.subMenus);
            defaultExpandedRowKeys.push(m.id);
            const checkedCount = m.subMenus.filter(o => o.checkedFlag === 'Y').length;
            const indeterminateCount = m.subMenus.filter(o => o.checkedFlag === 'P').length;
            m.checkedFlag =
              checkedCount === m.subMenus.length
                ? 'Y'
                : checkedCount === 0
                ? indeterminateCount === 0
                  ? null
                  : 'P'
                : 'P';
          }
          return m;
        });
      }

      return { dataSource: assignListData(response || []), defaultExpandedRowKeys };
    },

    *batchAssignPermissionSets({ roleId, data }, { call }) {
      const organizationId = getCurrentOrganizationId();
      let res;
      if (isTenantRoleLevel()) {
        res = yield call(batchAssignOrganizationPermissionSets, roleId, data, organizationId);
      } else {
        res = yield call(batchAssignPermissionSets, roleId, data);
      }
      return res;
    },

    *batchUnassignPermissionSets({ roleId, data }, { call }) {
      const organizationId = getCurrentOrganizationId();
      let res;
      if (isTenantRoleLevel()) {
        res = yield call(batchUnassignOrganizationPermissionSets, roleId, data, organizationId);
      } else {
        res = yield call(batchUnassignPermissionSets, roleId, data);
      }
      return res;
    },

    // 查询权限维度类型及所有权限维度
    *queryRoleAuthType(_, { call, put, all }) {
      const [roleAuthScopeCode, roleAuthScopeTypeCode] = yield all([
        call(queryIdpValue, 'HIAM.AUTHORITY_SCOPE_CODE'),
        call(queryIdpValue, 'HIAM.AUTHORITY_TYPE_CODE'),
      ]);
      yield put({
        type: 'updateStateReducer',
        payload: {
          roleAuthScopeCode: getResponse(roleAuthScopeCode),
          roleAuthScopeTypeCode: getResponse(roleAuthScopeTypeCode),
        },
      });
    },
    // 查询角色单据权限
    *queryRoleAuth({ payload }, { call, put }) {
      const res = yield call(queryRoleAuth, payload);
      const roleAuth = getResponse(res);
      yield put({
        type: 'updateStateReducer',
        payload: { roleAuth },
      });
      return roleAuth;
    },
    // 保存当前角色权限
    *saveRoleAuth({ payload }, { call }) {
      const res = yield call(saveRoleAuth, payload);
      return getResponse(res);
    },
    // 删除角色全新啊
    *deleteRoleAuth({ payload }, { call }) {
      const res = yield call(deleteRoleAuth, payload);
      return getResponse(res);
    },
    *queryCurrentRole(action, { call }) {
      const res = yield call(queryCurrentRole);
      return getResponse(res);
    },
    // 查询角色已经分配的卡片
    *fetchRoleCards({ payload }, { call }) {
      const organizationId = getCurrentOrganizationId();
      let res;
      if (isTenantRoleLevel()) {
        res = yield call(orgRoleCardsQuery, organizationId, payload);
      } else {
        res = yield call(roleCardsQuery, payload);
      }
      return getResponse(res);
    },
    // 删除角色已经分配的卡片
    *removeRoleCards({ payload }, { call }) {
      const organizationId = getCurrentOrganizationId();
      let res;
      if (isTenantRoleLevel()) {
        res = yield call(orgRoleCardsDelete, organizationId, payload);
      } else {
        res = yield call(roleCardsDelete, payload);
      }
      return getResponse(res);
    },
    // 新增或更新角色已经分配的卡片
    *saveRoleCards({ payload }, { call }) {
      const organizationId = getCurrentOrganizationId();
      let res;
      if (isTenantRoleLevel()) {
        res = yield call(orgRoleCardsInsertOrUpdate, organizationId, payload);
      } else {
        res = yield call(roleCardsInsertOrUpdate, payload);
      }
      return getResponse(res);
    },
  },
  reducers: {
    updateStateReducer(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    setCodeReducer(state, { payload }) {
      return {
        ...state,
        code: Object.assign(state.code, payload),
      };
    },
    updateRoleDetailReducer(state, { payload }) {
      return {
        ...state,
        detail: {
          ...state.detail,
          ...payload,
        },
      };
    },
    updateRoleListReducer(state, { payload }) {
      return {
        ...state,
        list: {
          ...state.list,
          ...payload,
        },
      };
    },
    initRoleDetailReducer(state) {
      return {
        ...state,
        detail: Object.assign(state.detail, {
          form: {},
          permissions: {
            ...tableState,
          },
          permissionSets: [],
        }),
      };
    },
  },
};
