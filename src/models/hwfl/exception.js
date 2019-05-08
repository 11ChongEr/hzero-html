/**
 * model 报错日志
 * @date: 2018-8-14
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { fetchExceptionList, fetchExceptionDetail } from '../../services/hwfl/exceptionService';
// import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'exception',
  state: {
    list: [], // 数据列表
    exceptionDetail: {}, // 报错详情数据
    pagination: {}, // 分页器
  },
  effects: {
    *fetchExceptionList({ payload }, { call, put }) {
      let result = yield call(fetchExceptionList, payload);
      result = getResponse(result);
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

    // 查询报错详情
    *fetchExceptionDetail({ payload }, { call, put }) {
      const res = yield call(fetchExceptionDetail, payload);
      const exceptionDetail = getResponse(res);
      if (exceptionDetail) {
        yield put({
          type: 'updateState',
          payload: { exceptionDetail },
        });
      }
      return exceptionDetail;
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
