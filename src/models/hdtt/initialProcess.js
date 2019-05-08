/**
 * model 数据初始化
 * @date: 2018-8-7
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  searchList,
  searchDetail,
  searchTenantProcess,
  searchDBProcess,
  save,
  submit,
  asyncSubmit,
  deleteTenantProcess,
  saveTenantProcess,
} from '../../services/hdtt/initialProcessService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'initialProcess', // model名称
  state: {
    list: [], // 数据展示列表
    pagination: {}, // 分页器
    tenantProcess: {}, // 租户处理数据列表
    dbProcess: {}, // DB处理数据列表
    processStatus: [], // 处理状态
    detail: {}, // 初始化处理明细
  },
  effects: {
    *fetchProcessStatus(_, { call, put }) {
      const processStatus = yield call(queryIdpValue, 'HDTT.PROCESS_STATUS');
      yield put({
        type: 'updateState',
        payload: {
          processStatus,
        },
      });
    },
    *fetchInitSqlProcess({ payload }, { call, put }) {
      let result = yield call(searchList, payload);
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
    *fetchDetail({ payload }, { call, put }) {
      let result = yield call(searchDetail, { ...payload });
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detail: result,
          },
        });
      }
    },
    *featchTenantProcess({ payload }, { call, put }) {
      let result = yield call(searchTenantProcess, payload);
      result = getResponse(result);
      yield put({
        type: 'updateState',
        payload: {
          tenantProcess: result,
        },
      });
      return result;
    },
    *featchDBProcess({ payload }, { call, put }) {
      let result = yield call(searchDBProcess, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            dbProcess: result,
          },
        });
      }
      return result;
    },
    *savaProcess({ payload }, { call }) {
      const result = yield call(save, payload);
      return getResponse(result);
    },
    *deleteTenantProcess({ payload }, { call }) {
      const result = yield call(deleteTenantProcess, payload);
      return getResponse(result);
    },
    *saveTenantProcess({ payload }, { call }) {
      const result = yield call(saveTenantProcess, payload);
      return getResponse(result);
    },
    *submit({ payload }, { call }) {
      const result = yield call(submit, payload);
      return getResponse(result);
    },
    *asyncSubmit({ payload }, { call }) {
      const result = yield call(asyncSubmit, payload);
      return getResponse(result);
    },
  },
  reducers: {
    // 合并state状态数据,生成新的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
