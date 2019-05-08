import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchProductEnvList,
  fetchProductEnvDetail,
  createProductEnv,
  deleteProductEnv,
  queryVersionValueSet,
  enabledProductEnv,
  disabledProductEnv,
  updateProductEnv,
  queryCherodonEnvList,
} from '../../services/hsgp/productEnvService';
import { queryEnabledPlatformLov } from '../../services/hsgp/deployPlatformService';
import { fetchSimpleProductList } from '../../services/hsgp/productService';
import { fetchCommonValueSet } from '../../services/hsgp/appSourceService';

export default {
  namespace: 'productEnv',

  state: {
    productEnvList: [], // 环境列表
    productEnvDetail: {}, // 环境详情
    versionValueList: [], // 产品版本值集
    defaultProduct: '', // 当前所选产品
    pagination: {},
    enabledPlatformList: {}, // 部署平台lov数据
    cherodonEnvList: [], // 猪齿鱼环境列表
    simpleProductList: [], // 产品简要列表数据
    grantTypeList: [], // 授权类型值集
  },

  effects: {
    // 查询值集
    *fetchValueSet(_, { call, put }) {
      const grantTypeList = getResponse(
        yield call(fetchCommonValueSet, { code: 'HSGP.GRANT_TYPE' })
      );
      yield put({
        type: 'updateState',
        payload: {
          grantTypeList,
        },
      });
    },
    // 查询列表
    *fetchProductEnvList({ payload }, { call, put }) {
      const parseParams = parseParameters(payload);
      const res = yield call(fetchProductEnvList, parseParams);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            productEnvList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 查询详情
    *fetchProductEnvDetail({ payload }, { call, put }) {
      const res = yield call(fetchProductEnvDetail, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            productEnvDetail: data,
          },
        });
      }
      return data;
    },

    // 查询列表
    *queryVersionValueSet({ payload }, { call, put }) {
      const res = yield call(queryVersionValueSet, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            versionValueList: data,
          },
        });
      }
      return data;
    },

    // 查询简要列表数据
    *fetchSimpleProductList(_, { call, put }) {
      const res = yield call(fetchSimpleProductList);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            simpleProductList: list,
          },
        });
      }
      return list;
    },

    // 查询猪齿鱼环境列表
    *queryCherodonEnvList({ payload }, { call, put }) {
      const res = yield call(queryCherodonEnvList, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            cherodonEnvList: data,
          },
        });
      }
      return data;
    },

    // 查询部署平台lov
    *queryEnabledPlatformLov({ payload }, { call, put }) {
      const res = yield call(queryEnabledPlatformLov, parseParameters(payload));
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            enabledPlatformList: data,
          },
        });
      }
      return data;
    },

    *createProductEnv({ payload }, { call }) {
      const res = yield call(createProductEnv, payload);
      return getResponse(res);
    },

    *updateProductEnv({ payload }, { call }) {
      const res = yield call(updateProductEnv, payload);
      return getResponse(res);
    },

    *enabledProductEnv({ payload }, { call }) {
      const res = yield call(enabledProductEnv, payload);
      return getResponse(res);
    },

    *disabledProductEnv({ payload }, { call }) {
      const res = yield call(disabledProductEnv, payload);
      return getResponse(res);
    },

    *deleteProductEnv({ payload }, { call }) {
      const res = yield call(deleteProductEnv, payload);
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
