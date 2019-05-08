import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchApiManageList,
  refreshApi,
  updateApiManage,
  deleteApiManage,
  disabledApiManage,
  enabledApiManage,
  fetchApiManageDetail,
} from '../../services/hsgp/apiManageService';
import { queryWithVersion } from '../../services/hsgp/serviceCollectService';
import { queryVersionWithService } from '../../services/hsgp/versionManageService';

export default {
  namespace: 'apiManage',

  state: {
    apiManageList: [], // api 列表数据
    apiManageDetail: {},
    pagination: {}, // 分页对象
    defaultServiceVersion: [], // 保存默认的服务及版本
    serviceWithVersionList: [], // 服务及版本父子值集
    versionList: [], // 某个服务下的所有版本
  },

  effects: {
    // 查询服务及版本父子值集
    *queryWithVersion(_, { call, put }) {
      const res = yield call(queryWithVersion);
      const data = getResponse(res);
      const defaultServiceVersion = Array.isArray(data)
        ? [data[0].value, data[0].children[0].value]
        : [];
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            defaultServiceVersion,
            serviceWithVersionList: data,
          },
        });
      }
      return data;
    },

    // 查询某个服务下的所有版本
    *queryVersionWithService({ payload }, { call, put }) {
      const res = yield call(queryVersionWithService, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            versionList: data,
          },
        });
      }
      return data;
    },

    // 查询列表
    *fetchApiManageList({ payload }, { call, put }) {
      const res = yield call(fetchApiManageList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            apiManageList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    // 查询详情
    *fetchApiManageDetail({ payload }, { call, put }) {
      const res = yield call(fetchApiManageDetail, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            apiManageDetail: data,
          },
        });
      }
      return data;
    },

    *refreshApi({ payload }, { call }) {
      const res = yield call(refreshApi, payload);
      return getResponse(res);
    },

    *updateApiManage({ payload }, { call }) {
      const res = yield call(updateApiManage, payload);
      return getResponse(res);
    },

    *disabledApiManage({ payload }, { call }) {
      const res = yield call(disabledApiManage, payload);
      return getResponse(res);
    },

    *enabledApiManage({ payload }, { call }) {
      const res = yield call(enabledApiManage, payload);
      return getResponse(res);
    },

    *deleteApiManage({ payload }, { call }) {
      const res = yield call(deleteApiManage, payload);
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
