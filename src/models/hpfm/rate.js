/**
 * model 汇率定义
 * @date: 2018-7-2
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, parseParameters, createPagination } from 'utils/utils';
import { fetchRateData, createRate, updateRate } from '../../services/hpfm/rateService';
import { queryIdpValue } from '../../services/api';

export const service = {
  async init() {
    return queryIdpValue('SMDM.EXCHANGE_RATE_METHOD');
  },
};

export default {
  namespace: 'rate',

  state: {
    modalVisible: false,
    rateMethodList: [],
    rateList: [],
    pagination: {}, // 分页对象
  },

  effects: {
    // 获取初始化数据
    *init({ payload }, { call, put }) {
      const res = yield call(service.init, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            rateMethodList: list,
          },
        });
      }
    },
    // 获取汇率定义信息
    *fetchRateData({ payload }, { call, put }) {
      const res = yield call(fetchRateData, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            rateList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },
    // 新建汇率定义
    *createRate({ payload }, { call }) {
      const res = yield call(createRate, payload);
      return getResponse(res);
    },
    // 更新汇率定义
    *updateRate({ payload }, { call }) {
      const res = yield call(updateRate, payload);
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
