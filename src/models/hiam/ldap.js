/**
 * ldap.js - LDAP model
 * @date: 2018-12-20
 * @author: LZY <zhuyan.luo02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  fetchLDAP,
  updateLDAP,
  testConnect,
  disabledLDAP,
  enabledLDAP,
  fetchSyncInfo,
  syncUser,
  stopSyncUser,
} from '../../services/hiam/ldapService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'ldap',

  state: {
    ldapData: {}, // LDAP数据
    testData: {},
    syncInfo: {},
    directoryTypeList: [], // 目录类型
  },

  effects: {
    // 获取目录类信息
    *queryDirectoryType(_, { call, put }) {
      const res = yield call(queryIdpValue, 'HIAM.LDAP.DIR_TYPE');
      const directoryTypeList = getResponse(res);
      yield put({
        type: 'updateState',
        payload: { directoryTypeList },
      });
    },
    // 查询LDAP数据
    *fetchLDAP({ payload }, { call, put }) {
      const res = yield call(fetchLDAP, payload);
      const ldapData = getResponse(res);
      if (ldapData) {
        yield put({
          type: 'updateState',
          payload: {
            ldapData,
          },
        });
      }
      return ldapData;
    },
    // 更新LDAP
    *updateLDAP({ payload }, { call }) {
      const res = yield call(updateLDAP, payload);
      return getResponse(res);
    },
    // 连接测试
    *testConnect({ payload }, { call, put }) {
      const res = yield call(testConnect, payload);
      const testData = getResponse(res);
      if (testData) {
        yield put({
          type: 'updateState',
          payload: {
            testData,
          },
        });
      }
      return testData;
    },
    // 禁用LDAP
    *disabledLDAP({ payload }, { call }) {
      const res = yield call(disabledLDAP, payload);
      return getResponse(res);
    },
    // 启用LDAP
    *enabledLDAP({ payload }, { call }) {
      const res = yield call(enabledLDAP, payload);
      return getResponse(res);
    },
    // 查询数据同步信息
    *fetchSyncInfo({ payload }, { call, put }) {
      const res = yield call(fetchSyncInfo, payload);
      const syncInfo = getResponse(res);
      if (syncInfo) {
        yield put({
          type: 'updateState',
          payload: {
            syncInfo,
          },
        });
      }
      return syncInfo;
    },
    // 同步用户
    *syncUser({ payload }, { call }) {
      const res = yield call(syncUser, payload);
      return getResponse(res);
    },
    // 终止同步用户
    *stopSyncUser({ payload }, { call }) {
      const res = yield call(stopSyncUser, payload);
      return getResponse(res);
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
