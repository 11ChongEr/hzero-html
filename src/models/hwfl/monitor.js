/**
 * model 流程监控
 * @date: 2018-8-14
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import uuid from 'uuid/v4';

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchEmployeeList,
  fetchMonitorList,
  fetchDetail,
  fetchForecast,
  fetchExceptionDetail,
  stopProcess,
  resumeProcess,
  suspendProcess,
  fetchValidNode,
  retryProcess,
  delegateProcess,
  jumpProcess,
} from '../../services/hwfl/monitorService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'monitor',
  state: {
    employeeList: [],
    employeePagination: {},
    list: [], // 数据列表
    detail: {},
    pagination: {}, // 分页器
    processStatus: [], // 流程状态
    validNodeList: [], // 有效节点
    forecast: [], // 流程图上审批历史数据
    exceptionDetail: {}, // 挂起详情
    uselessParam: 'init', // 确保获取最新流程图的参数
  },
  effects: {
    // 查询流程状态
    *queryProcessStatus(_, { call, put }) {
      const processStatus = getResponse(yield call(queryIdpValue, 'HWFL.PROCESS_STATUS'));
      yield put({
        type: 'updateState',
        payload: { processStatus },
      });
    },
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
            employeePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    *fetchMonitorList({ payload }, { call, put }) {
      let result = yield call(fetchMonitorList, payload);
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
      let result = yield call(fetchDetail, payload);
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
    // 挂起详情
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
    // 查询有效的节点
    *fetchValidNode({ payload }, { call, put }) {
      const res = yield call(fetchValidNode, payload);
      const validNodeList = getResponse(res);
      if (validNodeList) {
        yield put({
          type: 'updateState',
          payload: { validNodeList },
        });
      }
      return validNodeList;
    },
    // 终止流程
    *stopProcess({ payload }, { call }) {
      const res = yield call(stopProcess, payload);
      return getResponse(res);
    },
    // 恢复流程
    *resumeProcess({ payload }, { call }) {
      const res = yield call(resumeProcess, payload);
      return getResponse(res);
    },
    // 挂起流程
    *suspendProcess({ payload }, { call }) {
      const res = yield call(suspendProcess, payload);
      return getResponse(res);
    },
    // 审批重试
    *retryProcess({ payload }, { call }) {
      const res = yield call(retryProcess, payload);
      return getResponse(res);
    },
    // 转交
    *delegateProcess({ payload }, { call }) {
      const res = yield call(delegateProcess, payload);
      return getResponse(res);
    },
    // 跳转
    *jumpProcess({ payload }, { call }) {
      const res = yield call(jumpProcess, payload);
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
