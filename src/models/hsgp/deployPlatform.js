import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchDeployPlatformList,
  createDeployPlatform,
  updateDeployPlatform,
  deleteDeployPlatform,
  enabledDeployPlatform,
  disabledDeployPlatform,
  fetchDeployPlatformDetail,
} from '../../services/hsgp/deployPlatformService';
import { fetchCommonValueSet } from '../../services/hsgp/appSourceService';

export default {
  namespace: 'deployPlatform',

  state: {
    deployPlatformList: [],
    deployPlatformDetail: {},
    linkPlatformList: [], // 连接平台值集
    pagination: {},
    grantTypeList: [], // 授权类型值集
  },

  effects: {
    // 查询列表
    *fetchDeployPlatformList({ payload }, { call, put }) {
      const res = yield call(fetchDeployPlatformList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            deployPlatformList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    *fetchDeployPlatformDetail({ payload }, { call, put }) {
      const res = yield call(fetchDeployPlatformDetail, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            deployPlatformDetail: data,
          },
        });
      }
      return data;
    },

    *fetchValueSet(_, { call, put }) {
      const res = getResponse(yield call(fetchCommonValueSet, { code: 'HSGP.DEPLOYMENT_SOURCE' }));
      const grantTypeList = getResponse(
        yield call(fetchCommonValueSet, { code: 'HSGP.GRANT_TYPE' })
      );
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            linkPlatformList: res,
            grantTypeList,
          },
        });
      }
      return res;
    },

    *createDeployPlatform({ payload }, { call }) {
      const res = yield call(createDeployPlatform, payload);
      return getResponse(res);
    },

    *updateDeployPlatform({ payload }, { call }) {
      const res = yield call(updateDeployPlatform, payload);
      return getResponse(res);
    },

    *deleteDeployPlatform({ payload }, { call }) {
      const res = yield call(deleteDeployPlatform, payload);
      return getResponse(res);
    },

    *enabledDeployPlatform({ payload }, { call }) {
      const res = yield call(enabledDeployPlatform, payload);
      return getResponse(res);
    },

    *disabledDeployPlatform({ payload }, { call }) {
      const res = yield call(disabledDeployPlatform, payload);
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
