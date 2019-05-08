/**
 * model 流程设置/审批规则
 * @date: 2018-8-21
 * @author: CJ <juan.chen01@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchApproveList,
  fetchApproveHeader,
  checkUniqueCode,
  createHeader,
  deleteHeader,
  updateHeader,
  fetchInterfaceMap,
  deleteLine,
} from '../../services/hwfl/approveRuleService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'approveRule',
  state: {
    list: [], // 数据列表
    pagination: {}, // 分页器
    header: {}, // 审核规则头
    // line: [], // 条件行
    paramsTypeList: [], // 参数类型
    returnTypeList: [], // 返回类型
    interfaceMapList: [], // 接口映射
    scopeTypeList: [], // 数据范围
  },
  effects: {
    // 获取审批规则列表
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
    // 获取参数类型
    *fetchParamsType(_, { call, put }) {
      const paramsTypeList = getResponse(yield call(queryIdpValue, 'HWFL.PROCESS_DATA_TYPE'));
      yield put({
        type: 'updateState',
        payload: {
          paramsTypeList,
        },
      });
    },
    // 获取数据范围
    *fetchScopeType(_, { call, put }) {
      const scopeTypeList = getResponse(yield call(queryIdpValue, 'HWFL.PROCESS_DATA_SCOPE'));
      yield put({
        type: 'updateState',
        payload: {
          scopeTypeList: scopeTypeList.map(item => ({ value: +item.value, meaning: item.meaning })),
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
            interfaceMapList: result,
          },
        });
      }
    },
    // 获取返回类型
    *fetchReturnType(_, { call, put }) {
      const returnTypeList = getResponse(yield call(queryIdpValue, 'HWFL.RETURN_TYPE'));
      yield put({
        type: 'updateState',
        payload: {
          returnTypeList,
        },
      });
    },
    // 获取头信息
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
    // 检查编码唯一性
    *checkUnique({ payload }, { call }) {
      const result = yield call(checkUniqueCode, { ...payload });
      return result;
    },
    // 删除审批规则
    *deleteHeader({ payload }, { call }) {
      const result = getResponse(yield call(deleteHeader, { ...payload }));
      return result;
    },
    // 新增审批规则
    *createHeader({ payload }, { call }) {
      const result = yield call(createHeader, { ...payload });
      return getResponse(result);
    },
    // 修改审批规则
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
