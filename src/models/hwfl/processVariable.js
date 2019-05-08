/**
 * model 流程设置/流程变量
 * @date: 2018-8-15
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  queryCategories,
  queryTypeList,
  searchVariableList,
  creatOne,
  editOne,
  deleteOne,
  checkUniqueCode,
} from '../../services/hwfl/processVariableService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'processVariable',
  state: {
    variableList: {}, // 数据列表
    typeList: [], // 类型
    category: [], // 流程分类
    scopeType: [], // 数据范围List
    pagination: {},
  },
  effects: {
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
    // 获取流程分类
    *queryCategories({ payload }, { call, put }) {
      const response = yield call(queryCategories, payload);
      const list = getResponse(response);
      if (list) {
        const category = list.content.map(item => ({
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
    // 获取变量类型
    *queryTypeList({ payload }, { call, put }) {
      const response = yield call(queryTypeList, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            typeList: list,
          },
        });
      }
    },
    *fetchVariableList({ payload }, { call, put }) {
      let result = yield call(searchVariableList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            variableList: result,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 新建保存
    *creatOne({ payload }, { call }) {
      const { tenantId, ...params } = payload;
      const res = yield call(creatOne, tenantId, { ...params });
      return getResponse(res);
    },
    // 编辑保存
    *editOne({ payload }, { call }) {
      const { tenantId, processVariableId, ...params } = payload;
      const res = yield call(editOne, tenantId, processVariableId, { ...params });
      return getResponse(res);
    },
    // 删除表单
    *deleteOne({ payload }, { call }) {
      const { tenantId, processVariableId, ...params } = payload;
      const res = yield call(deleteOne, tenantId, processVariableId, { ...params });
      return getResponse(res);
    },
    // 检查编码唯一性
    *checkUnique({ payload }, { call }) {
      const result = yield call(checkUniqueCode, { ...payload });
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
