/**
 * model 任务执行器
 * @date: 2018-9-3
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchGroupsList,
  createGroups,
  updateGroups,
  deleteGroups,
  fetchExecutorList,
  deleteExecutor,
  updateExecutor,
} from '../../services/hsdr/jobGroupService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'jobGroup',
  state: {
    groupsList: [], // 执行器列表
    jobsList: [], // 执行器任务列表
    pagination: {}, // 分页器
    modalVisible: false, // 控制模态框显示
    statusList: [],
    scopeList: [], // 权限层级
    executorList: [], // 执行器配置列表
  },
  effects: {
    *init(_, { call, put }) {
      const statusList = getResponse(yield call(queryIdpValue, 'HSDR.EXECUTOR_STATUS'));
      const scopeList = getResponse(yield call(queryIdpValue, 'HSDR.EXECUTOR.SCOPE'));
      yield put({
        type: 'updateState',
        payload: {
          statusList,
          scopeList,
        },
      });
    },
    *fetchGroupsList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchGroupsList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            groupsList: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },

    *createGroups({ payload }, { call }) {
      const result = getResponse(yield call(createGroups, { ...payload }));
      return result;
    },
    *updateGroups({ payload }, { call }) {
      const result = getResponse(yield call(updateGroups, { ...payload }));
      return result;
    },
    *deleteGroups({ payload }, { call }) {
      const result = getResponse(yield call(deleteGroups, { ...payload }));
      return result;
    },

    *fetchExecutorList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchExecutorList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            executorList: result,
          },
        });
      }
    },

    *updateExecutor({ payload }, { call }) {
      const result = getResponse(yield call(updateExecutor, payload));
      return result;
    },

    *deleteExecutor({ payload }, { call }) {
      const result = getResponse(yield call(deleteExecutor, payload));
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
