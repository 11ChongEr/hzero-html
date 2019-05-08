/*
 * zuulRateLimit - zuul限流配置
 * @date: 2018/09/10 17:37:52
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  fetchRateLimitList,
  addRateLimit,
  fetchHeaderInformation,
  detailSave,
  deleteHeaders,
  deleteLines,
  fetchLines,
  refresh,
} from '../../services/hcnf/zuulRateLimitService';

export default {
  namespace: 'zuulRateLimit',

  state: {
    list: [],
    headerInformation: {}, // 头详情
    zuulRateLimitLineList: [], // 行数据
    pagination: {},
    detailPagination: {}, // 行分页信息
    dataSourceMap: {},
    selectedRowKeys: [],
    selectedDetailRows: [],
    selectedDetailRowKeys: [],
    modalVisible: false,
  },

  effects: {
    // 查询配置列表
    *fetchList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchRateLimitList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 新增配置
    *addRateLimit({ payload }, { call }) {
      const data = yield call(addRateLimit, { ...payload });
      return getResponse(data);
    },
    // 查询配置头行信息
    *fetchHeaderInformation({ payload }, { call, put }) {
      const { page = 0, size = 10, rateLimitId } = payload;
      const result = getResponse(yield call(fetchHeaderInformation, { rateLimitId, page, size }));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            headerInformation: result,
            zuulRateLimitLineList: result.zuulRateLimitLineList.content || [],
            detailPagination: createPagination(result.zuulRateLimitLineList),
          },
        });
      }
    },
    // 查询配置行信息
    *fetchLines({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchLines, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            zuulRateLimitLineList: result.content,
            detailPagination: createPagination(result),
          },
        });
      }
    },
    // 头行保存
    *detailSave({ payload }, { call }) {
      const data = yield call(detailSave, { ...payload });
      return getResponse(data);
    },
    // 删除头
    *deleteHeaders({ payload }, { call }) {
      const data = yield call(deleteHeaders, payload);
      return getResponse(data);
    },
    // 删除行
    *deleteLines({ payload }, { call }) {
      const data = yield call(deleteLines, payload);
      return getResponse(data);
    },
    // 刷新头
    *refresh({ payload }, { call }) {
      const data = yield call(refresh, payload);
      return getResponse(data);
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
