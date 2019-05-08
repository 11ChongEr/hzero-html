/**
 * client.js - 客户端 model
 * @date: 2018-12-24
 * @author: LZY <zhuyan.luo02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchClientList,
  fetchDetail,
  fetchRandomData,
  checkClient,
  createClient,
  updateClient,
  deleteClient,
  subAccountOrgRoleQueryAll,
  subAccountOrgRoleCurrent,
  saveRoleSet,
  deleteRoles,
} from '../../services/hiam/clientService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'client',

  state: {
    clientList: [], // 列表数据
    pagination: {}, // 分页器
    detailData: {}, // 详情数据
    typeList: [], // 授权类型
    randomInfoData: [], // 需新建客户端时生成的随机数据
    ownedRoleList: [], // 拥有的角色
    paginationRole: {},
  },

  effects: {
    // 获取授权类型信息
    *queryType(_, { call, put }) {
      const res = yield call(queryIdpValue, 'HIAM.GRANT_TYPE');
      const typeList = getResponse(res);
      yield put({
        type: 'updateState',
        payload: { typeList },
      });
    },
    // 查询Client列表数据
    *fetchClientList({ payload }, { call, put }) {
      const res = yield call(fetchClientList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            clientList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },
    // 查询详情
    *fetchDetail({ payload }, { call, put }) {
      const res = yield call(fetchDetail, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            detailData: list,
          },
        });
      }
      return list;
    },
    // 获取 生成的随机数据
    *fetchRandomData({ payload }, { call, put }) {
      const res = yield call(fetchRandomData, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            randomInfoData: list,
          },
        });
      }
      return list;
    },
    // 校验
    *checkClient({ payload }, { call }) {
      const res = yield call(checkClient, payload);
      return getResponse(res);
    },
    // 创建
    *createClient({ payload }, { call }) {
      const res = yield call(createClient, payload);
      return getResponse(res);
    },
    // 更新LDAP
    *updateClient({ payload }, { call }) {
      const res = yield call(updateClient, payload);
      return getResponse(res);
    },
    // 删除
    *deleteClient({ payload }, { call }) {
      const res = yield call(deleteClient, payload);
      return getResponse(res);
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
    *roleCurrent({ payload }, { call, put }) {
      const res = yield call(subAccountOrgRoleCurrent, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            ownedRoleList: list.content, // list.content
            paginationRole: createPagination(list),
          },
        });
      }
      return list;
    },

    // 保存角色
    *saveRoleSet({ payload }, { call }) {
      const res = yield call(saveRoleSet, payload);
      return getResponse(res);
    },
    // 删除角色
    *deleteRoles({ payload }, { call }) {
      const { memberRoleList } = payload;
      const res = getResponse(yield call(deleteRoles, memberRoleList));
      return res;
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
