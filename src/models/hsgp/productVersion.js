import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchProductVersionList,
  fetchProductVersionDetail,
  createProductVersion,
  updateProductVersion,
  deleteProductVersion,
} from '../../services/hsgp/productVersionService';

export default {
  namespace: 'productVersion',

  state: {
    productVersionList: [],
    productVersionDetail: {},
    pagination: {},
    releaseDateValidator: '', // 发布日期效验
  },

  effects: {
    // 查询列表
    *fetchProductVersionList({ payload }, { call, put }) {
      const parseParams = parseParameters(payload);
      const res = yield call(fetchProductVersionList, parseParams);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            productVersionList: list.content,
            releaseDateValidator:
              parseParams.page === 0 ? (list.content[0] ? list.content[0].releaseDate : '') : '',
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 查询列表
    *fetchProductVersionDetail({ payload }, { call, put }) {
      const res = yield call(fetchProductVersionDetail, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            productVersionDetail: data,
          },
        });
      }
      return data;
    },

    *createProductVersion({ payload }, { call }) {
      const res = yield call(createProductVersion, payload);
      return getResponse(res);
    },

    *updateProductVersion({ payload }, { call }) {
      const res = yield call(updateProductVersion, payload);
      return getResponse(res);
    },

    *deleteProductVersion({ payload }, { call }) {
      const res = yield call(deleteProductVersion, payload);
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
