import { isEmpty } from 'lodash';
// import uuid from 'uuid/v4';

import { createPagination, getResponse } from 'utils/utils';
import {
  querySubAccountOrgList,
  subAccountOrgQuery,
  subAccountOrgUpdateOne,
  subAccountOrgCreateOne,
  // enumSetQueryByCode,
  subAccountOrgRoleQueryAll,
  subAccountOrgRoleCurrent,
  queryUnitsTree,
  subAccountOrgUpdatePassword,
  subAccountOrgUpdateSelfPassword,
  subAccountSiteUserUnlock,
  deleteRoles,
  subAccountOrgGroupCurrent,
  subAccountOrgGroupQueryAll,
  addUserGroup,
  deleteUserGroup,
} from '../../services/hiam/subAccountOrgService';

import { queryMapIdpValue } from '../../services/api'; // 相对路径

export default {
  namespace: 'subAccountOrg',
  state: {
    enumMap: {},
    // 可分配角色
    createSubRoles: [],
    dataSource: [],
    pagination: {}, // 分页信息
    editFormProps: {},
    editModalProps: {},
    passwordProps: {},
    // 组织树
    unitsTree: [],
  },
  effects: {
    *fetchList({ payload }, { call, put }) {
      const res = getResponse(yield call(querySubAccountOrgList, payload));
      if (!isEmpty(res)) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: res.content,
            pagination: createPagination(res),
          },
        });
      }
    },

    *fetchDetail({ payload }, { call }) {
      const { userId } = payload;
      const subAccountDetail = yield call(subAccountOrgQuery, userId);
      return getResponse(subAccountDetail);
    },
    // 更新帐号信息
    *updateOne({ payload }, { call }) {
      const { userInfo } = payload;
      const res = getResponse(yield call(subAccountOrgUpdateOne, userInfo));
      return res;
    },
    // 创建新的帐号
    *createOne({ payload }, { call }) {
      const { userInfo } = payload;
      const res = getResponse(yield call(subAccountOrgCreateOne, userInfo));
      return res;
    },
    // 当前登录用户所拥有的id
    *roleQueryAll({ payload }, { call, put }) {
      const res = yield call(subAccountOrgRoleQueryAll, payload);
      const createSubRoles = getResponse(res);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            createSubRoles,
          },
        });
      }
      return createSubRoles;
    },
    // 查询当前用户所拥有的角色
    *roleCurrent({ payload }, { call }) {
      const res = yield call(subAccountOrgRoleCurrent, payload);
      return getResponse(res);
    },
    // 获取快码
    *fetchEnum(_, { call, put }) {
      const res = getResponse(
        yield call(queryMapIdpValue, {
          level: 'HIAM.RESOURCE_LEVEL',
          authorityType: 'HIAM.AUTHORITY_TYPE_CODE',
          idd: 'HPFM.IDD', // 国际化手机号前缀
          gender: 'HPFM.GENDER', // 性别
        })
      );
      if (!isEmpty(res)) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap: res,
          },
        });
      }
    },
    // 查询 组织
    *queryUnitsTree(
      {
        payload: { params },
      },
      { call, put }
    ) {
      const res = yield call(queryUnitsTree, params);
      const response = getResponse(res);
      yield put({
        type: 'updateState',
        payload: {
          unitsTree: !isEmpty(response) ? response : [],
        },
      });
    },
    // 打开修改密码
    *openPassword({ payload }, { put }) {
      const { userInfo, isSameUser } = payload;
      yield put({
        type: 'updateState',
        payload: {
          passwordProps: {
            visible: true,
            userInfo,
            isSameUser,
          },
        },
      });
    },
    // 关闭修改密码
    *closePassword(_, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          passwordProps: {
            visible: false,
            userInfo: {},
          },
        },
      });
    },
    // 更新密码
    *updatePassword({ payload }, { call }) {
      const { id, userOrganizationId, antherPassword, isSameUser, ...params } = payload;
      let res;
      if (isSameUser) {
        // todo 先把接口改了 多余参数 之后再改
        res = getResponse(yield call(subAccountOrgUpdateSelfPassword, params));
      } else {
        res = getResponse(yield call(subAccountOrgUpdatePassword, id, userOrganizationId, params));
      }
      return res;
    },
    // 解锁用户
    *unlockUser({ payload }, { call }) {
      const { userId } = payload;
      const res = getResponse(yield call(subAccountSiteUserUnlock, userId));
      return res;
    },
    // 删除角色
    *deleteRoles({ payload }, { call }) {
      const { memberRoleList } = payload;
      const res = getResponse(yield call(deleteRoles, memberRoleList));
      return res;
    },

    // 查询 当前用户 已分配的用户组
    *getCurrentUserGroups({ payload }, { call }) {
      const res = yield call(subAccountOrgGroupCurrent, payload);
      return getResponse(res);
      // // 同时查询 层级的 值集
    },
    // 查询当前租户可分配的用户组
    *fetchGroups({ payload }, { call }) {
      const rolesRes = yield call(subAccountOrgGroupQueryAll, payload);
      return getResponse(rolesRes);
    },
    // 添加用户组
    *addUserGroup({ payload }, { call }) {
      const res = yield call(addUserGroup, payload);
      return getResponse(res);
    },
    // 删除用户组
    *deleteUserGroup({ payload }, { call }) {
      const res = yield call(deleteUserGroup, payload);
      return getResponse(res);
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
