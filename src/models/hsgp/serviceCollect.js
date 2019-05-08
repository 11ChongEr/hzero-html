import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchServiceCollectList,
  fetchServiceCollectDetail,
  createServiceCollect,
  updateServiceCollect,
  deleteServiceCollect,
  enabledServiceCollect,
  disabledServiceCollect,
  fetchAppLov,
  queryWithVersion,
} from '../../services/hsgp/serviceCollectService';
import { fetchSourceLov } from '../../services/hsgp/appSourceService';

export default {
  namespace: 'serviceCollect',

  state: {
    serviceCollectList: [],
    serviceCollectDetail: {},
    sourceLovList: {}, // 应用来源lov
    appList: {}, // 猪齿鱼应用列表
    pagination: {},
    defaultServiceVersion: [], // 保存默认的服务及版本
    serviceWithVersionList: [], // 服务及版本父子值集
  },

  effects: {
    // 查询列表
    *fetchServiceCollectList({ payload }, { call, put }) {
      const res = yield call(fetchServiceCollectList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            serviceCollectList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 查询详细数据
    *fetchServiceCollectDetail({ payload }, { call, put }) {
      const res = yield call(fetchServiceCollectDetail, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            serviceCollectDetail: data,
          },
        });
      }
      return data;
    },

    // 查询值集
    *fetchSourceLov({ payload }, { call, put }) {
      const res = yield call(fetchSourceLov, parseParameters(payload));
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            sourceLovList: data,
          },
        });
      }
      return data;
    },

    // 查询服务及版本父子值集
    *queryWithVersion({ payload }, { call, put }) {
      const res = yield call(queryWithVersion, payload);
      const data = getResponse(res);
      const defaultServiceVersion = Array.isArray(data)
        ? [data[0].value, data[0].children[0].value]
        : [];
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            defaultServiceVersion,
            serviceWithVersionList: data,
          },
        });
      }
      return data;
    },

    // 查询应用列表
    *fetchAppLov({ payload }, { call, put }) {
      const res = yield call(fetchAppLov, parseParameters(payload));
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            appList: data,
          },
        });
      }
      return data;
    },

    *createServiceCollect({ payload }, { call }) {
      const res = yield call(createServiceCollect, payload);
      return getResponse(res);
    },

    *updateServiceCollect({ payload }, { call }) {
      const res = yield call(updateServiceCollect, payload);
      return getResponse(res);
    },

    *deleteServiceCollect({ payload }, { call }) {
      const res = yield call(deleteServiceCollect, payload);
      return getResponse(res);
    },

    *enabledServiceCollect({ payload }, { call }) {
      const res = yield call(enabledServiceCollect, payload);
      return getResponse(res);
    },

    *disabledServiceCollect({ payload }, { call }) {
      const res = yield call(disabledServiceCollect, payload);
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
