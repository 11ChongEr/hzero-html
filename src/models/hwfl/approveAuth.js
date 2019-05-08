/**
 * model 流程设置/审批权限
 * @date: 2018-8-20
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchApproveList,
  fetchApproveHeader,
  fetchApproveLine,
  checkUniqueCode,
  saveHeader,
  updateHeader,
  deleteHeader,
  deleteLine,
  fetchProcessCategory,
  fetchVariableOperand,
  fetchServiceOperand,
} from '../../services/hwfl/approveAuthService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'approveAuth',
  state: {
    list: [], // 数据列表
    pagination: {}, // 分页器
    header: {}, // 条件头
    line: [], // 条件行
    operatorList: [], // 操作符List
    dataTypeList: [], // 操作数类型List
    category: [], // 流程分类
    scopeType: [], // 数据范围List
  },
  effects: {
    *fetchOperator(_, { call, put }) {
      const operatorList = getResponse(yield call(queryIdpValue, 'HWFL.PROCESS_OPERATOR'));
      yield put({
        type: 'updateState',
        payload: {
          operatorList,
        },
      });
    },
    *fetchDataType(_, { call, put }) {
      const dataTypeList = getResponse(yield call(queryIdpValue, 'HWFL.PROCESS_DATA_TYPE'));
      yield put({
        type: 'updateState',
        payload: {
          dataTypeList,
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
    *fetchApproveList({ payload }, { call, put }) {
      let result = yield call(fetchApproveList, payload);
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
      let result = yield call(fetchApproveHeader, { ...payload });
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
      let result = yield call(fetchApproveLine, { ...payload });
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
      return getResponse(result);
    },
    // 保存审核权限头
    *saveHeader({ payload }, { call }) {
      const result = yield call(saveHeader, { ...payload });
      return getResponse(result);
    },
    // 更新审核权限头
    *updateHeader({ payload }, { call }) {
      const result = yield call(updateHeader, { ...payload });
      return getResponse(result);
    },
    // 删除审核权限头
    *deleteHeader({ payload }, { call }) {
      const result = yield call(deleteHeader, { ...payload });
      return getResponse(result);
    },
    // 删除审核权限行
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
