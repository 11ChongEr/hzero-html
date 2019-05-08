/**
 * model 流程设置/跳转条件
 * @date: 2018-8-15
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  searchConditionList,
  searchConditionHeader,
  searchConditionLine,
  saveHeader,
  updateHeader,
  deleteHeader,
  deleteLine,
  checkConditionCode,
  searchProcessCategory,
  fetchVariableOperand,
  fetchServiceOperand,
} from '../../services/hwfl/conditionService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'condition',
  state: {
    list: [], // 数据列表
    pagination: {}, // 分页器
    header: {}, // 条件头
    line: [], // 条件行
    scopeType: [], // 数据范围List
    operator: [], // 操作符List
    dataType: [], // 操作数类型List
    category: [], // 流程分类
  },
  effects: {
    *fetchOperator(_, { call, put }) {
      let operator = yield call(queryIdpValue, 'HWFL.PROCESS_OPERATOR');
      operator = getResponse(operator);
      if (operator) {
        yield put({
          type: 'updateState',
          payload: {
            operator,
          },
        });
      }
    },
    // 获取数据类型
    *fetchDataType(_, { call, put }) {
      let dataType = yield call(queryIdpValue, 'HWFL.PROCESS_DATA_TYPE');
      dataType = getResponse(dataType);
      if (dataType) {
        yield put({
          type: 'updateState',
          payload: {
            dataType,
          },
        });
      }
    },
    // 获取数据范围
    *fetchScopeType(_, { call, put }) {
      let scopeType = yield call(queryIdpValue, 'HWFL.PROCESS_DATA_SCOPE');
      scopeType = getResponse(scopeType);
      if (scopeType) {
        yield put({
          type: 'updateState',
          payload: {
            scopeType: scopeType.map(item => ({ value: +item.value, meaning: item.meaning })),
          },
        });
      }
    },
    // 获取流程类型
    *fetchCategory({ payload }, { call, put }) {
      let result = yield call(searchProcessCategory, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            category: result.content.map(item => ({
              value: item.code,
              meaning: item.description,
            })),
          },
        });
      }
    },
    *fetchConditionList({ payload }, { call, put }) {
      let result = yield call(searchConditionList, payload);
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
    *fetchConditionHeader({ payload }, { call, put }) {
      let result = yield call(searchConditionHeader, { ...payload });
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
    *fetchConditionLine({ payload }, { call, put }) {
      let result = yield call(searchConditionLine, { ...payload });
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
      const result = yield call(checkConditionCode, { ...payload });
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
