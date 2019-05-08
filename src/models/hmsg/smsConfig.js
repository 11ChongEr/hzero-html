import { getResponse, createPagination } from 'utils/utils';

import {
  fetchSMSList,
  fetchServerType,
  createSMS,
  editSMS,
} from '../../services/hmsg/smsConfigService';

export default {
  namespace: 'smsConfig',
  state: {
    smsData: {}, // 查询数据列表
    serverTypeList: [], // 服务类型
    pagination: {}, // 分页器
  },
  effects: {
    // 获取短信数据
    *fetchSMSList({ payload }, { call, put }) {
      const res = yield call(fetchSMSList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            smsData: list,
            pagination: createPagination(list),
          },
        });
      }
    },
    // 获取服务类型
    *fetchServerType(_, { call, put }) {
      const response = yield call(fetchServerType);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            serverTypeList: list,
          },
        });
      }
    },
    // 新建保存
    *createSMS({ payload }, { call }) {
      const result = yield call(createSMS, { ...payload });
      return getResponse(result);
    },
    // 编辑保存
    *editSMS({ payload }, { call }) {
      const result = yield call(editSMS, { ...payload });
      return getResponse(result);
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
