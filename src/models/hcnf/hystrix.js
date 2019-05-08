import { createPagination, getResponse } from 'utils/utils';
import {
  fetchList,
  add,
  fetchHeaderInformation,
  fetchDetailList,
  deleteDetails,
  // deleteConfs,
  refresh,
  fetchConfTypeCodeList,
  fetchProperNameList,
} from '../../services/hcnf/hystrixService';

export default {
  namespace: 'hystrix',

  state: {
    query: {},
    detailQuery: {},
    dataSource: [],
    pagination: {},
    detailPagination: {},
    headerInformation: {}, // 详情页头
    detailList: [],
    confTypeCodeList: [], // 熔断类型值集
    propertyNameList: [], // 熔断细则值集
  },

  effects: {
    // 查询Hystrix
    *fetchList({ payload }, { call, put }) {
      const { ...query } = payload;
      const result = getResponse(yield call(fetchList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            query,
            dataSource: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 新增Hystrix, 更改保存头行
    *add({ payload }, { call }) {
      const data = yield call(add, { ...payload });
      return getResponse(data);
    },

    // 获得详情页的头
    *fetchHeaderInformation({ payload }, { call, put }) {
      const { confId } = payload;
      const result = getResponse(yield call(fetchHeaderInformation, { confId }));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            headerInformation: result,
            detailPagination: createPagination(result.hystrixConfLines),
          },
        });
      }
      return result;
    },

    *fetchDetailList({ payload }, { call, put }) {
      const { page = 0, pageSize = 10, confId, ...detailQuery } = payload;
      const result = getResponse(
        yield call(fetchDetailList, { confId, ...detailQuery, page, pageSize })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailList: result.content,
            detailPagination: createPagination(result.content),
          },
        });
      }
    },
    // 删除熔断规则
    // *deleteConfs({ payload }, { call }) {
    //   const data = yield call(deleteConfs, payload);
    //   return getResponse(data);
    // },

    *deleteDetails({ payload }, { call }) {
      const data = yield call(deleteDetails, payload);
      return getResponse(data);
    },

    *refresh({ payload }, { call }) {
      const data = yield call(refresh, payload);
      return getResponse(data);
    },

    *fetchConfTypeCodeList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchConfTypeCodeList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            confTypeCodeList: result,
          },
        });
      }
    },

    *fetchProperNameList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchProperNameList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            propertyNameList: result,
          },
        });
      }
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
