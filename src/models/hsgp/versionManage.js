import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchVersionManageList,
  createVersionManage,
  updateVersionManage,
  deleteVersionManage,
  fetchVersionManageDetail,
  queryVersionList,
  queryAppVersionList,
} from '../../services/hsgp/versionManageService';

export default {
  namespace: 'versionManage',

  state: {
    versionManageList: [],
    versionManageDetail: {},
    pagination: {},
    versionList: [],
    appVersionList: [], // 猪齿鱼应用版本列表
    releaseDateValidator: '',
  },

  effects: {
    // 查询列表
    *fetchVersionManageList({ payload }, { call, put }) {
      const parseParams = parseParameters(payload);
      const res = yield call(fetchVersionManageList, parseParams);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            versionManageList: list.content,
            releaseDateValidator:
              parseParams.page === 0 && list.content[0] ? list.content[0].releaseDate : '',
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    *fetchVersionManageDetail({ payload }, { call, put }) {
      const res = yield call(fetchVersionManageDetail, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            versionManageDetail: data,
          },
        });
      }
      return data;
    },

    *queryVersionList(_, { call, put }) {
      const res = yield call(queryVersionList);
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

    *queryAppVersionList({ payload }, { call, put }) {
      const res = yield call(queryAppVersionList, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            appVersionList: data,
          },
        });
      }
      return data;
    },

    *createVersionManage({ payload }, { call }) {
      const res = yield call(createVersionManage, payload);
      return getResponse(res);
    },

    *updateVersionManage({ payload }, { call }) {
      const res = yield call(updateVersionManage, payload);
      return getResponse(res);
    },

    *deleteVersionManage({ payload }, { call }) {
      const res = yield call(deleteVersionManage, payload);
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
