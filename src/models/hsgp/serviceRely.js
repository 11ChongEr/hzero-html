import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchServiceRelyList,
  createServiceRely,
  deleteServiceRely,
  fetchServiceLov,
  queryRelyVersionList,
  fetchExcludeServiceList,
} from '../../services/hsgp/serviceRelyService';
import { queryWithVersion } from '../../services/hsgp/serviceCollectService';

export default {
  namespace: 'serviceRely',

  state: {
    serviceRelyList: [],
    sourceList: [],
    serviceLovList: {}, // 服务编码lov数据
    relyVersionList: [], // 依赖本部值集
    excludeServiceList: {}, // 过滤默认服务后的服务列表
    lovPagination: {},
    pagination: {},
    defaultServiceVersion: [], // 保存默认的服务及版本
    serviceWithVersionList: [], // 服务及版本父子值集
  },

  effects: {
    // 查询依赖版本值集
    *queryRelyVersionList({ payload }, { call, put }) {
      const res = yield call(queryRelyVersionList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            relyVersionList: list,
          },
        });
      }
    },

    // 查询依赖版本值集
    *fetchExcludeServiceList({ payload }, { call, put }) {
      const res = yield call(fetchExcludeServiceList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            excludeServiceList: list,
            lovPagination: createPagination(list),
          },
        });
      }
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

    // 查询列表
    *fetchServiceRelyList({ payload }, { call, put }) {
      const res = yield call(fetchServiceRelyList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            serviceRelyList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 查询列表
    *fetchServiceLov({ payload }, { call, put }) {
      const res = yield call(fetchServiceLov, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            serviceLovList: list,
          },
        });
      }
      return list;
    },

    *createServiceRely({ payload }, { call }) {
      const res = yield call(createServiceRely, payload);
      return getResponse(res);
    },

    *deleteServiceRely({ payload }, { call }) {
      const res = yield call(deleteServiceRely, payload);
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
