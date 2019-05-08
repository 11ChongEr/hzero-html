/**
 * model 流程设置/消息服务
 * @date: 2018-8-21
 * @author: CJ <juan.chen01@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchMessageList,
  fetchMessageHeader,
  checkUniqueCode,
  saveHeader,
  deleteHeader,
  updateHeader,
  fetchInterfaceMap,
  deleteLine,
} from '../../services/hwfl/messageServiceService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'messageService',
  state: {
    list: [], // 数据列表
    pagination: {}, // 分页器
    header: {}, // 消息服务头
    // line: [], // 条件行
    paramsType: [], // 参数类型
    returnTypeMap: [], // 返回类型
    interfaceMap: [], // 接口映射
    scopeType: [], // 数据范围
  },
  effects: {
    // 获取消息服务列表
    *fetchMessageList({ payload }, { call, put }) {
      let result = yield call(fetchMessageList, payload);
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
      let result = yield call(fetchInterfaceMap, payload);
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
    *fetchMessageHeader({ payload }, { call, put }) {
      let result = yield call(fetchMessageHeader, { ...payload });
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
    // 删除消息服务
    *deleteHeader({ payload }, { call }) {
      const result = getResponse(yield call(deleteHeader, { ...payload }));
      return result;
    },
    // 新增消息服务
    *saveHeader({ payload }, { call }) {
      const result = yield call(saveHeader, { ...payload });
      return getResponse(result);
    },
    // 修改消息服务
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
