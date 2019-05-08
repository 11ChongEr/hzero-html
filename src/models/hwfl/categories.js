import { getResponse, createPagination } from 'utils/utils';
import {
  fetchCategories,
  createCategories,
  editCategories,
  deleteCategories,
} from '../../services/hwfl/categoriesService';

export default {
  namespace: 'categories',
  state: {
    categoriesData: {},
    pagination: {},
  },
  effects: {
    *fetchCategories({ payload }, { call, put }) {
      const res = yield call(fetchCategories, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            categoriesData: list,
            pagination: createPagination(list),
          },
        });
      }
    },
    // 新建保存
    *createCategories({ payload }, { call }) {
      const { organizationId, ...params } = payload;
      const res = yield call(createCategories, organizationId, { ...params });
      return getResponse(res);
    },
    // 编辑保存
    *editCategories({ payload }, { call }) {
      const { organizationId, processCategoryId, ...params } = payload;
      const res = yield call(editCategories, organizationId, processCategoryId, { ...params });
      return getResponse(res);
    },
    // 删除流程分类
    *deleteCategories({ payload }, { call }) {
      const { organizationId, processCategoryId, ...params } = payload;
      const res = yield call(deleteCategories, organizationId, processCategoryId, { ...params });
      return getResponse(res);
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
