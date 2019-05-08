/**
 * model 流程设置/审批方式
 * @date: 2018-8-20
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchProcessCategory,
  searchApproveList,
  searchApproveHeader,
  searchApproveLine,
  saveHeader,
  checkUniqueCode,
  updateHeader,
  deleteHeader,
  deleteLine,
  fetchVariableOperand,
  fetchServiceOperand,
} from '../../services/hwfl/approveWayService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'approveWay',
  state: {
    list: [], // 数据列表
    pagination: {}, // 分页器
    header: {}, // 条件头
    line: [], // 条件行
    scopeType: [], // 数据范围List
    category: [], // 流程分类
    operator: [], // 操作符List
    dataType: [], // 操作数类型List
  },
  effects: {
    *fetchOperator(_, { call, put }) {
      let operator = yield call(queryIdpValue, 'HWFL.PROCESS_OPERATOR');
      operator = getResponse(operator);
      yield put({
        type: 'updateState',
        payload: {
          operator,
        },
      });
    },
    *fetchDataType(_, { call, put }) {
      let dataType = yield call(queryIdpValue, 'HWFL.PROCESS_DATA_TYPE');
      dataType = getResponse(dataType);
      yield put({
        type: 'updateState',
        payload: {
          dataType,
        },
      });
    },
    *fetchCategory({ payload }, { call, put }) {
      let result = yield call(fetchProcessCategory, payload);
      result = getResponse(result);
      if (result) {
        const category = result.content.map(item => ({
          value: item.code,
          meaning: item.description,
        }));
        yield put({
          type: 'updateState',
          payload: {
            category,
          },
        });
      }
    },
    *fetchScopeType(_, { call, put }) {
      let scopeType = yield call(queryIdpValue, 'HWFL.PROCESS_DATA_SCOPE');
      scopeType = getResponse(scopeType);
      yield put({
        type: 'updateState',
        payload: {
          scopeType: scopeType.map(item => ({ value: +item.value, meaning: item.meaning })),
        },
      });
    },
    *fetchApproveList({ payload }, { call, put }) {
      let result = yield call(searchApproveList, payload);
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
    *fetchApproveHeader({ payload }, { call, put }) {
      let result = yield call(searchApproveHeader, { ...payload });
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            header: result,
          },
        });
      }
      return result;
    },
    *fetchApproveLine({ payload }, { call, put }) {
      let result = yield call(searchApproveLine, { ...payload });
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            line: result,
          },
        });
      }
    },
    *checkUnique({ payload }, { call }) {
      const result = yield call(checkUniqueCode, { ...payload });
      return result;
    },
    *saveHeader({ payload }, { call }) {
      const result = yield call(saveHeader, { ...payload });
      return getResponse(result);
    },
    *updateHeader({ payload }, { call }) {
      const result = yield call(updateHeader, { ...payload });
      return getResponse(result);
    },
    *deleteHeader({ payload }, { call }) {
      const result = yield call(deleteHeader, { ...payload });
      return getResponse(result);
    },
    *deleteLine({ payload }, { call }) {
      const result = yield call(deleteLine, { ...payload });
      return getResponse(result);
    },
    *fetchVariableOperand({ payload }, { call }) {
      let result = yield call(fetchVariableOperand, payload);
      result = getResponse(result);
      return result;
    },
    *fetchServiceOperand({ payload }, { call }) {
      let result = yield call(fetchServiceOperand, payload);
      result = getResponse(result);
      return result;
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
