import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchServiceRouteList,
  fetchServiceRouteDetail,
  createServiceRoute,
  updateServiceRoute,
  refreshServiceRoute,
  fetchExcludeRouteList,
  deleteServiceRoute,
} from '../../services/hsgp/serviceRouteService';
import { queryProductWithEnv } from '../../services/hsgp/productService';
import { fetchCommonValueSet } from '../../services/hsgp/appSourceService';

export default {
  namespace: 'serviceRoute',

  state: {
    serviceRouteList: [], // 服务路由列表
    serviceRouteDetail: {}, // 服务路由详情
    pagination: {}, // 分页对象
    productWithEnvList: [], // 产品列表数据
    defaultProductEnv: [], // 默认产品及环境
    yesOrNoList: [], // 是和否值集
    excludeRouteList: {}, // 排除已配置路由的服务列表
  },

  effects: {
    // 获取初始化值集数据
    *init(_, { call, put }) {
      const yesOrNoList = getResponse(yield call(fetchCommonValueSet, { code: 'HSGP.YES_NO' }));
      yield put({
        type: 'updateState',
        payload: {
          yesOrNoList,
        },
      });
    },

    // 查询排除已配置路由的服务列表
    *fetchExcludeRouteList({ payload }, { call, put }) {
      const res = yield call(fetchExcludeRouteList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            excludeRouteList: list,
          },
        });
      }
    },

    // 查询简要产品列表数据
    *queryProductWithEnv(_, { call, put }) {
      const res = yield call(queryProductWithEnv);
      const list = getResponse(res);
      const defaultProductEnv = Array.isArray(list)
        ? [list[0].value, list[0].children[0].value]
        : [];
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            productWithEnvList: list,
            defaultProductEnv,
          },
        });
      }
      return list;
    },

    *fetchServiceRouteList({ payload }, { call, put }) {
      const res = yield call(fetchServiceRouteList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            serviceRouteList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 查询详情数据
    *fetchServiceRouteDetail({ payload }, { call, put }) {
      const res = yield call(fetchServiceRouteDetail, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            serviceRouteDetail: data,
          },
        });
      }
      return data;
    },

    *createServiceRoute({ payload }, { call }) {
      const res = yield call(createServiceRoute, payload);
      return getResponse(res);
    },

    *updateServiceRoute({ payload }, { call }) {
      const res = yield call(updateServiceRoute, payload);
      return getResponse(res);
    },

    *refreshServiceRoute({ payload }, { call }) {
      const res = yield call(refreshServiceRoute, payload);
      return getResponse(res);
    },

    *deleteServiceRoute({ payload }, { call }) {
      const res = yield call(deleteServiceRoute, payload);
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
