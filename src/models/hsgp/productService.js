import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchProductServiceList,
  createProductService,
  deleteProductService,
  queryProductServiceLov,
  fetchTopologyList,
} from '../../services/hsgp/productServiceService';
import { queryProductWithVersion } from '../../services/hsgp/productService';
import { queryVersionWithService } from '../../services/hsgp/versionManageService';

export default {
  namespace: 'productService',

  state: {
    productServiceList: [],
    pagination: {},
    defaultProductVersion: [], // 当前使用的产品及版本，
    productWithVersionList: [], // 产品及版本列表数据
    productServiceLovList: {}, // 服务组合lov
    versionList: [], // 依赖版本值集
    topologyData: {}, // 拓扑图数据
  },

  effects: {
    // 查询列表
    *fetchProductServiceList({ payload }, { call, put }) {
      const parseParams = parseParameters(payload);
      const res = yield call(fetchProductServiceList, parseParams);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            productServiceList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 查询产品服务lov
    *queryProductServiceLov({ payload }, { call, put }) {
      const parseParams = parseParameters(payload);
      const res = yield call(queryProductServiceLov, parseParams);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            productServiceLovList: list,
          },
        });
      }
      return list;
    },

    // 查询某个服务下的所有版本
    *queryVersionWithService({ payload }, { call, put }) {
      const res = yield call(queryVersionWithService, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            versionList: data,
          },
        });
      }
      return data;
    },

    // 查询产品及版本
    *queryProductWithVersion({ payload }, { call, put }) {
      const res = yield call(queryProductWithVersion, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            productWithVersionList: data,
          },
        });
      }
      return data;
    },

    *createProductService({ payload }, { call }) {
      const res = yield call(createProductService, payload);
      return getResponse(res);
    },

    *deleteProductService({ payload }, { call }) {
      const res = yield call(deleteProductService, payload);
      return getResponse(res);
    },

    // 获取拓扑图数据
    *fetchTopologyList({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchTopologyList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: { topologyData: res },
        });
      }
      return res;
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
