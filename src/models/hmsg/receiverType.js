/**
 * model 接收者类型维护
 * @date: 2018-7-31
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchReceiverType,
  addReceiverType,
  updateReceiverType,
} from '../../services/hmsg/receiverTypeService';

/**
 * 定义接收者类型维护数据源及处理方法
 */
export default {
  namespace: 'receiverType', // model名称
  state: {
    list: [], // 数据展示列表
    pagination: {}, // 分页器
  },
  effects: {
    /**
     * 获取接收者类型数据
     */
    *fetchReceiverType({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchReceiverType, payload));
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
    /**
     * 更新接收者类型信息
     */
    *updateType({ payload }, { call }) {
      const result = yield call(updateReceiverType, payload);
      return getResponse(result);
    },
    /**
     * 添加接收者类型信息
     */
    *addType({ payload }, { call }) {
      const result = yield call(addReceiverType, payload);
      return getResponse(result);
    },
  },
  reducers: {
    /**
     * 合并state状态数据,生成新的state
     */
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
