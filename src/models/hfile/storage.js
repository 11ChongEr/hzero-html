/**
 * model 文件管理配置页面
 * @date: 2018-7-25
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, getUserOrganizationId } from 'utils/utils';
import {
  fetchDefaultStorage,
  fetchStorage,
  updateStorage,
  queryLdpTree,
} from '../../services/hfile/storageService';

export default {
  namespace: 'storage',

  state: {
    storageData: {}, // 文件配置数据
    tenantId: getUserOrganizationId(), // 当前用户所属租户id
    formKey: '',
    serverProviderList: [], // 权限控制父子值集
  },

  effects: {
    *init(_, { put, call }) {
      const serverProviderList = getResponse(
        yield call(queryLdpTree, {
          'HFLE.SERVER_PROVIDER': 1,
          'HFLE.CAPACITY.ACCESS_CONTROL': 2,
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          serverProviderList,
        },
      });
    },

    *fetchDefaultStorage({ payload }, { put, call }) {
      const res = yield call(fetchDefaultStorage, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            storageData: data,
          },
        });
      }
    },

    *fetchStorage({ payload }, { put, call }) {
      const res = yield call(fetchStorage, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            storageData: data,
          },
        });
      }
    },

    *updateStorage({ payload }, { call }) {
      const res = yield call(updateStorage, payload);
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
