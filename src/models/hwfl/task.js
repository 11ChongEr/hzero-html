/**
 * model 待办事项列表
 * @date: 2018-8-14
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import uuid from 'uuid/v4';

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchTaskList,
  searchDetail,
  fetchEmployeeList,
  fetchForecast,
  saveTask,
} from '../../services/hwfl/taskService';

export default {
  namespace: 'task',
  state: {
    list: [], // 数据列表
    employeeList: [], // 员工数据列表
    employeeQuery: {},
    pagination: {}, // 分页器
    detail: {}, // 待办事项明细
    forecast: [], // 流程图数据
    changeEmployee: [], // 选择的转交人或者加签人
    uselessParam: 'init', // 确保获取最新流程图的参数
  },
  effects: {
    *fetchEmployeeList({ payload }, { call, put }) {
      const { page = 0, size = 10, ...employeeQuery } = payload;
      let result = yield call(fetchEmployeeList, { page, size, ...employeeQuery });
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            employeeQuery,
            employeeList: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },

    *fetchTaskList({ payload }, { call, put }) {
      let result = yield call(fetchTaskList, payload);
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
      let result = yield call(searchDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detail: result,
            uselessParam: uuid(),
          },
        });
      }
      return result;
    },

    *fetchForecast({ payload }, { call, put }) {
      let result = yield call(fetchForecast, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            forecast: result,
          },
        });
      }
      return result;
    },

    // 同意
    *taskAgree({ payload }, { call }) {
      const res = yield call(saveTask, payload);
      // return res;
      return getResponse(res);
    },
    // 拒绝
    *taskRefuse({ payload }, { call }) {
      const res = yield call(saveTask, payload);
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
