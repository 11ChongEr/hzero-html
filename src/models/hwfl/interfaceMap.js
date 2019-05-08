/**
 * model 流程设置/接口映射
 * @date: 2018-8-15
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchInterfaceMap,
  createInterfaceMap,
  editInterfaceMap,
  deleteInterfaceMap,
  checkUniqueCode,
} from '../../services/hwfl/interfaceMapService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'interfaceMap',
  state: {
    interfaceMapData: {}, // 数据列表
    scopeList: [], // 数据范围List
    pagination: {},
  },
  effects: {
    // 获取数据范围
    *fetchScopeType(_, { call, put }) {
      const scopeList = getResponse(yield call(queryIdpValue, 'HWFL.PROCESS_DATA_SCOPE'));
      yield put({
        type: 'updateState',
        payload: {
          scopeList: scopeList.map(item => ({ value: +item.value, meaning: item.meaning })),
        },
      });
    },
    // 获取接口映射数据
    *fetchInterfaceList({ payload }, { call, put }) {
      let result = yield call(fetchInterfaceMap, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            interfaceMapData: result,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 新建保存
    *createInterfaceMap({ payload }, { call }) {
      const { tenantId, ...params } = payload;
      const res = yield call(createInterfaceMap, tenantId, { ...params });
      return getResponse(res);
    },
    // 编辑保存
    *editInterfaceMap({ payload }, { call }) {
      const { tenantId, interfaceMappingId, ...params } = payload;
      const res = yield call(editInterfaceMap, tenantId, interfaceMappingId, { ...params });
      return getResponse(res);
    },
    // 删除表单
    *deleteInterfaceMap({ payload }, { call }) {
      const { tenantId, interfaceMappingId, ...params } = payload;
      const res = yield call(deleteInterfaceMap, tenantId, interfaceMappingId, { ...params });
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
