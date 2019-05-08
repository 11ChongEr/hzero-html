/**
 * model 邮箱
 * @date: 2018-7-25
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchEmail,
  createEmail,
  updateEmail,
  queryEmailServers,
} from '../../services/hmsg/emailService';

export default {
  namespace: 'email',

  state: {
    emailList: [], // 邮箱数据
    emailProperties: [], // 服务器配置项列表
    tenantId: 0, // 租户id
    pagination: {},
  },

  effects: {
    // 获取邮箱账户
    *fetchEmail({ payload }, { put, call }) {
      const res = yield call(fetchEmail, parseParameters(payload));
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            emailList: data.content,
            pagination: createPagination(data),
          },
        });
      }
    },
    *queryEmailServers({ payload }, { put, call }) {
      const res = yield call(queryEmailServers, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            emailProperties: data.emailProperties,
          },
        });
      }
      return data;
    },
    *createEmail({ payload }, { call }) {
      const res = yield call(createEmail, payload);
      return getResponse(res);
    },
    *updateEmail({ payload }, { call }) {
      const res = yield call(updateEmail, payload);
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
