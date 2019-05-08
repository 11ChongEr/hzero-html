/**
 * PlatformManager.js - 平台管理员 model
 * @date: 2019-01-10
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { fetchMembers } from '../../services/hpfm/platformManagerService';

export default {
  namespace: 'platformManager',
  state: {
    list: [],
    pagination: [],
  },
  effects: {
    // 获取登录记录
    *fetchMembers({ payload }, { call, put }) {
      let result = yield call(fetchMembers, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            pagination: createPagination(result),
          },
        });
      }
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
