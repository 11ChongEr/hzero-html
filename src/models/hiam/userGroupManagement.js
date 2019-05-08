/**
 * UserGroupManagement 用户组管理
 * @date: 2019-1-14
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  deleteUserGroup,
  fetchUserGroupList,
  createUserGroup,
  updateUserGroup,
  getUserGroupDetail,
} from '../../services/hiam/userGroupManagementService';

export default {
  namespace: 'userGroupManagement',
  state: {
    userGroupList: [], // 用户组列表
    pagination: {}, // 分页对象
    userGroupDetail: {}, // 查询列表
  },
  effects: {
    // 获取用户组列表
    *fetchUserGroupList({ payload }, { call, put }) {
      const res = yield call(fetchUserGroupList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            userGroupList: list.content,
            pagination: createPagination(list),
          },
        });
      }
    },

    // 查询用户组列表
    *getUserGroupDetail({ payload }, { call, put }) {
      const res = yield call(getUserGroupDetail, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            userGroupDetail: list,
          },
        });
      }
    },

    // 新增用户组
    *createUserGroup({ payload }, { call }) {
      const res = yield call(createUserGroup, payload);
      return getResponse(res);
    },

    // 更新用户组
    *updateUserGroup({ payload }, { call }) {
      const res = yield call(updateUserGroup, payload);
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
