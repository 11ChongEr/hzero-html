import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchServiceManageList,
  fetchServiceManageDetail,
  createService,
  updateService,
  deleteService,
} from '../../services/hcnf/serviceManageService';

export default {
  namespace: 'hcnfServiceManage',

  state: {
    serviceList: [], // 服务列表数据
    serviceDetail: {}, // 服务详情数据
    pagination: {},
  },

  effects: {
    // 查询列表
    *fetchServiceManageList({ payload }, { call, put }) {
      const res = yield call(fetchServiceManageList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            serviceList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 查询详细数据
    *fetchServiceManageDetail({ payload }, { call, put }) {
      const res = yield call(fetchServiceManageDetail, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            serviceDetail: data,
          },
        });
      }
      return data;
    },

    *createService({ payload }, { call }) {
      const res = yield call(createService, payload);
      return getResponse(res);
    },

    *updateService({ payload }, { call }) {
      const res = yield call(updateService, payload);
      return getResponse(res);
    },

    *deleteService({ payload }, { call }) {
      const res = yield call(deleteService, payload);
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
