import { getResponse, createPagination } from 'utils/utils';
import { fetchTemplates, createTemplate, editTemplate } from '../../services/hptl/templatesService';

export default {
  namespace: 'portalTemplate',
  state: {
    templateData: {},
    pagination: {},
  },
  effects: {
    *fetchTemplates({ payload }, { call, put }) {
      const res = yield call(fetchTemplates, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            templateData: list,
            pagination: createPagination(list),
          },
        });
      }
    },
    // 新建保存
    *createTemplate({ payload }, { call }) {
      const res = yield call(createTemplate, { ...payload });
      return getResponse(res);
    },
    // 编辑保存
    *editTemplate({ payload }, { call }) {
      const res = yield call(editTemplate, { ...payload });
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
