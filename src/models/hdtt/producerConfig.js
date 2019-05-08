/**
 * model - 数据消息配置
 * @date: 2018-8-9
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  queryProducer,
  saveProducer,
  queryTenant,
  deleteTenant,
  queryDb,
  saveDb,
  saveTenant,
} from '../../services/hdtt/producerConfigService';

export default {
  namespace: 'producerConfig', // model名称
  state: {
    producerData: {}, // 生产者配置表数据
    producerList: [], // 除去分页参数的list
    pagination: {}, // 分页参数
    tenantData: {}, // 分配租户表数据
    dbData: {}, // 分配DB表数据
    dbList: [], // 出去分页参数的List
  },
  effects: {
    // 查询数据
    *init({ payload }, { call, put }) {
      const response = yield call(queryProducer, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            producerData: data,
            producerList: data.content,
            pagination: createPagination(data),
          },
        });
      }
    },
    // 保存新建或者编辑的数据
    *saveProducer({ payload }, { call }) {
      const response = yield call(saveProducer, payload);
      return getResponse(response);
    },
    // 查询分配租户表数据
    *queryTenant({ payload }, { put, call }) {
      const response = yield call(queryTenant, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateAllocation',
          payload: {
            tenantData: data,
          },
        });
      }
    },
    // 删除分配服务
    *deleteTenant({ payload }, { call }) {
      const response = yield call(deleteTenant, payload);
      return getResponse(response);
    },
    // 查询分配DB表数据
    *queryDb({ payload }, { put, call }) {
      const response = yield call(queryDb, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateAllocation',
          payload: {
            dbData: data,
            dbList: data.content,
          },
        });
      }
    },
    // 保存编辑数据
    *saveDb({ payload }, { call }) {
      const response = yield call(saveDb, payload);
      return getResponse(response);
    },
    // 保存tenant数据
    *saveTenant({ payload }, { call }) {
      const response = yield call(saveTenant, payload);
      return getResponse(response);
    },
  },
  reducers: {
    // 合并state状态数据,生成新的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    // 更新详情页面状态树
    updateAllocation(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
