import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchAppSourceList,
  createAppSource,
  updateAppSource,
  deleteAppSource,
  disabledAppSource,
  enabledAppSource,
  fetchAppSourceDetail,
  fetchCommonValueSet,
} from '../../services/hsgp/appSourceService';

export default {
  namespace: 'appSource',

  state: {
    appSourceList: [],
    sourceList: [],
    appSourceDetail: {},
    pagination: {},
    grantTypeList: [], // 授权类型值集
  },

  effects: {
    // 获取初始化值集数据
    *init(_, { call, put }) {
      const sourceList = getResponse(
        yield call(fetchCommonValueSet, { code: 'HSGP.APPLICATION_SOURCE' })
      );
      const grantTypeList = getResponse(
        yield call(fetchCommonValueSet, { code: 'HSGP.GRANT_TYPE' })
      );
      yield put({
        type: 'updateState',
        payload: {
          sourceList,
          grantTypeList,
        },
      });
    },
    // 查询列表
    *fetchAppSourceList({ payload }, { call, put }) {
      const res = yield call(fetchAppSourceList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            appSourceList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 查询列表
    *fetchAppSourceDetail({ payload }, { call, put }) {
      const res = yield call(fetchAppSourceDetail, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            appSourceDetail: data,
          },
        });
      }
      return data;
    },

    *createAppSource({ payload }, { call }) {
      const res = yield call(createAppSource, payload);
      return getResponse(res);
    },

    *updateAppSource({ payload }, { call }) {
      const res = yield call(updateAppSource, payload);
      return getResponse(res);
    },

    *disabledAppSource({ payload }, { call }) {
      const res = yield call(disabledAppSource, payload);
      return getResponse(res);
    },

    *enabledAppSource({ payload }, { call }) {
      const res = yield call(enabledAppSource, payload);
      return getResponse(res);
    },

    *deleteAppSource({ payload }, { call }) {
      const res = yield call(deleteAppSource, payload);
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
