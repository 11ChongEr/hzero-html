import { getResponse, createPagination, parseParameters } from 'utils/utils';
import { queryIdpValue } from '../../services/api';
import {
  fetchProductList,
  fetchProductDetail,
  fetchSimpleProductList,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../../services/hsgp/productService';

export default {
  namespace: 'product',

  state: {
    productList: [],
    sourceList: [],
    simpleProductList: [], // 产品简要列表数据
    productDetail: {},
    pagination: {},
  },

  effects: {
    // 获取初始化值集数据
    *init(_, { call, put }) {
      const sourceList = getResponse(yield call(queryIdpValue, 'HSGP.SOURCE.SOURCE_TYPE'));
      yield put({
        type: 'updateState',
        payload: {
          sourceList,
        },
      });
    },
    // 查询列表
    *fetchProductList({ payload }, { call, put }) {
      const res = yield call(fetchProductList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            productList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
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

    // 查询列表
    *fetchProductDetail({ payload }, { call, put }) {
      const res = yield call(fetchProductDetail, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            productDetail: data,
          },
        });
      }
      return data;
    },

    *createProduct({ payload }, { call }) {
      const res = yield call(createProduct, payload);
      return getResponse(res);
    },

    *updateProduct({ payload }, { call }) {
      const res = yield call(updateProduct, payload);
      return getResponse(res);
    },

    *deleteProduct({ payload }, { call }) {
      const res = yield call(deleteProduct, payload);
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
