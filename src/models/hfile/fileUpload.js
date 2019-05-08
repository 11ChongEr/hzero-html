import { getResponse, createPagination } from 'utils/utils';
import {
  queryFileList,
  addConfigDetail,
  editConfigDetail,
  deleteConfigDetail,
  saveHeader,
} from '../../services/hfile/fileUploadService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'fileUpload',
  state: {
    fileData: {}, // 文件列表
    fileTypeList: [], // 文件类型
    fileFormatsList: [], // 文件格式
    fileUnitList: [], // 单位
    pagination: {}, // 分页信息
  },
  effects: {
    // 获取文件类型
    *queryFiletype(_, { call, put }) {
      const fileTypeList = yield call(queryIdpValue, 'HFLE.CONTENT_TYPE');
      yield put({
        type: 'updateState',
        payload: {
          fileTypeList,
        },
      });
    },
    // 获取文件格式
    *queryFileFormat(_, { call, put }) {
      const fileFormatsList = yield call(queryIdpValue, 'HFLE.FILE_FORMAT');
      yield put({
        type: 'updateState',
        payload: {
          fileFormatsList,
        },
      });
    },
    // 获取单位
    *queryFileUnit(_, { call, put }) {
      const fileUnitList = yield call(queryIdpValue, 'HFLE.STORAGE_UNIT');
      yield put({
        type: 'updateState',
        payload: {
          fileUnitList,
        },
      });
    },
    // 获取文件列表
    *queryFileList({ payload }, { call, put }) {
      const res = yield call(queryFileList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            fileData: list,
            pagination: createPagination(list.listConfig),
          },
        });
      }
    },
    // 新增保存
    *addConfigDetail({ payload }, { call }) {
      const result = yield call(addConfigDetail, { ...payload });
      return getResponse(result);
    },
    // 编辑保存
    *editConfigDetail({ payload }, { call }) {
      const result = yield call(editConfigDetail, { ...payload });
      return getResponse(result);
    },
    // 删除
    *deleteConfigDetail({ payload }, { call }) {
      const result = yield call(deleteConfigDetail, payload);
      return getResponse(result);
    },
    // 保存头
    *saveHeader({ payload }, { call }) {
      const result = yield call(saveHeader, { ...payload });
      return getResponse(result);
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
