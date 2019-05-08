/**
 * model 流程设置/服务任务
 * @date: 2018-8-23
 * @author: CJ <juan.chen01@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  searchApproveList,
  searchApproveHeader,
  checkUniqueCode,
  saveHeader,
  deleteHeader,
  updateHeader,
  searchCategory,
  queryInterfaceMap,
  deleteLine,
} from '../../services/hwfl/serviceTaskService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'serviceTask',
  state: {
    list: [], // 数据列表
    pagination: {}, // 分页器
    header: {}, // 服务任务头
    // line: [], // 条件行
    paramsType: [], // 参数类型
    returnTypeMap: [], // 返回类型
    interfaceMap: [], // 接口映射
    category: [], // 流程分类
    scopeType: [], // 数据范围List
  },
  effects: {
    // 获取服务任务列表
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
    *fetchParamsType(_, { call, put }) {
      const paramsType = getResponse(yield call(queryIdpValue, 'HWFL.PROCESS_DATA_TYPE'));
      yield put({
        type: 'updateState',
        payload: {
          paramsType,
        },
      });
    },
    // 获取接口映射
    *fetchInterfaceMap({ payload }, { call, put }) {
      let result = yield call(queryInterfaceMap, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            interfaceMap: result,
          },
        });
      }
    },
    // 获取返回类型
    *fetchReturnType(_, { call, put }) {
      const returnTypeMap = getResponse(yield call(queryIdpValue, 'HWFL.RETURN_TYPE'));
      yield put({
        type: 'updateState',
        payload: {
          returnTypeMap,
        },
      });
    },
    // 获取数据范围
    *fetchScopeType(_, { call, put }) {
      const scopeType = getResponse(yield call(queryIdpValue, 'HWFL.PROCESS_DATA_SCOPE'));
      yield put({
        type: 'updateState',
        payload: {
          scopeType: scopeType.map(item => ({ value: +item.value, meaning: item.meaning })),
        },
      });
    },
    // 获取头信息
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
    // 检查编码唯一性
    *checkUnique({ payload }, { call }) {
      const result = yield call(checkUniqueCode, { ...payload });
      return result;
    },
    // 删除服务任务
    *deleteHeader({ payload }, { call }) {
      const result = getResponse(yield call(deleteHeader, { ...payload }));
      return result;
    },
    // 新增服务任务
    *saveHeader({ payload }, { call }) {
      const result = yield call(saveHeader, { ...payload });
      return getResponse(result);
    },
    // 修改服务任务
    *updateHeader({ payload }, { call }) {
      const result = yield call(updateHeader, { ...payload });
      return getResponse(result);
    },
    // 删除行参数
    *deleteLine({ payload }, { call }) {
      const result = yield call(deleteLine, { ...payload });
      return getResponse(result);
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
