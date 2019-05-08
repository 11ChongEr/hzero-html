import { getResponse } from 'utils/utils';
import { queryFileList } from '../../services/hfile/fileAggregateService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'fileAggregate',

  state: {
    fileData: {}, // 文件列表
    fileTypeList: [], // 文件类型
    fileFormatList: [], // 文件格式
    fileUnitList: [], // 单位
  },
  effects: {
    // 获取文件类型
    *queryFiletype(_, { call, put }) {
      const fileTypeList = getResponse(yield call(queryIdpValue, 'HFLE.CONTENT_TYPE'));
      yield put({
        type: 'updateState',
        payload: {
          fileTypeList,
        },
      });
    },
    // 获取文件格式
    *queryFileFormat(_, { call, put }) {
      const fileFormatList = getResponse(yield call(queryIdpValue, 'HFLE.FILE_FORMAT'));
      yield put({
        type: 'updateState',
        payload: {
          fileFormatList,
        },
      });
    },
    // 获取单位
    *queryFileUnit(_, { call, put }) {
      const fileUnitList = getResponse(yield call(queryIdpValue, 'HFLE.STORAGE_UNIT'));
      yield put({
        type: 'updateState',
        payload: {
          fileUnitList,
        },
      });
    },
    // 获取文件列表
    *queryFileList({ payload }, { call, put }) {
      const { page = 0, size = 10, ...params } = payload;
      const res = yield call(queryFileList, { page, size, ...params });
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            fileData: list,
          },
        });
      }
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
