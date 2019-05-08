/**
 * model 流程设置/监听器管理
 * @date: 2018-12-20
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchListenerList,
  queryTransactionState,
  searchCategory,
  createListener,
  editListener,
  deleteListener,
  checkUniqueCode,
  searchServiceTask,
  searchVariableOptions,
  searchParameters,
} from '../../services/hwfl/listenerManageService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'listenerManage',
  state: {
    listenerList: [], // 数据列表
    eventList: [], // 监听事件列表
    TransactionState: [], // 事务状态
    category: [], // 流程分类
    serviceTask: [], // 服务任务
    variableOptions: [], // 流程变量选项
    parameter: [], // 动态参数
    parameterType: [], //  参数类型
    listenerTypeList: [], // 监听器类型
    pagination: {},
    executionEventList: [],
    taskEventList: [],
  },
  effects: {
    // 查询监听器类型
    *fetchListenerType(_, { call, put }) {
      const listenerTypeList = getResponse(yield call(queryIdpValue, 'HWFL.LISTENER_TYPE'));
      yield put({
        type: 'updateState',
        payload: { listenerTypeList },
      });
    },
    // 查询执行监听器对应的事件
    *queryExecutionEvent(_, { call, put }) {
      const executionEventList = getResponse(
        yield call(queryIdpValue, 'HWLF.EXECUTION_LISTENER.EVENT')
      );
      yield put({
        type: 'updateState',
        payload: { executionEventList },
      });
      return executionEventList;
    },
    // 查询任务监听器对应的事件
    *queryTaskEvent(_, { call, put }) {
      const taskEventList = getResponse(yield call(queryIdpValue, 'HWFL.TASK_LISTENER.EVENT'));
      yield put({
        type: 'updateState',
        payload: { taskEventList },
      });
      return taskEventList;
    },
    // 获取事务状态
    *queryTransactionState({ payload }, { call, put }) {
      const response = yield call(queryTransactionState, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            TransactionState: list,
          },
        });
      }
    },
    // 获取流程分类
    *queryCategory({ payload }, { call, put }) {
      let result = yield call(searchCategory, payload);
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
    // 获取参数类型
    *queryParameterType(_, { call, put }) {
      const parameterType = getResponse(yield call(queryIdpValue, 'HWFL.PROCESS_DATA_TYPE'));
      yield put({
        type: 'updateState',
        payload: {
          parameterType,
        },
      });
    },
    // 获取监听器列表
    *fetchListenerList({ payload }, { call, put }) {
      let result = yield call(fetchListenerList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            listenerList: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 检查编码唯一性
    *checkUnique({ payload }, { call }) {
      const result = yield call(checkUniqueCode, { ...payload });
      return result;
    },
    // 选择流程分类获取服务任务
    *queryServiceTask({ payload }, { call, put }) {
      let result = yield call(searchServiceTask, { ...payload });
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            serviceTask: result,
          },
        });
      }
    },
    // 选择流程分类获取流程变量选项
    *queryOptions({ payload }, { call, put }) {
      let result = yield call(searchVariableOptions, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            variableOptions: result,
          },
        });
      }
    },
    // 选择服务任务获取动态参数
    *queryParameter({ payload }, { call, put }) {
      let result = yield call(searchParameters, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            parameter: result,
          },
        });
      }
    },
    // 新建保存
    *createListener({ payload }, { call }) {
      const { tenantId, ...params } = payload;
      const res = yield call(createListener, tenantId, { ...params });
      return getResponse(res);
    },
    // 编辑保存
    *editListener({ payload }, { call }) {
      const { tenantId, listenerId, ...params } = payload;
      const res = yield call(editListener, tenantId, listenerId, { ...params });
      return getResponse(res);
    },
    // 删除任务监听器
    *deleteListener({ payload }, { call }) {
      const res = yield call(deleteListener, payload);
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
