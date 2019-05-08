/**
 * Company - 租户级权限维护tab页 - 采购品类 model
 * @date: 2018-7-31
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import {
  copyAuthority,
  changeAuthority,
  queryUserInfo,
} from '../../../services/hiam/authorityManagementService';

export default {
  namespace: 'authorityManagement',

  state: {
    data: {
      list: [],
    },
  },
  effects: {
    *fetchUserInfo({ payload }, { call, put }) {
      const response = yield call(queryUserInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryUserInfo',
          payload: data,
        });
      }
    },
    *copyAuthority({ payload }, { call }) {
      const response = yield call(copyAuthority, payload);
      return getResponse(response);
    },
    *changeAuthority({ payload }, { call }) {
      const response = yield call(changeAuthority, payload);
      return getResponse(response);
    },
  },
  reducers: {
    queryUserInfo(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
