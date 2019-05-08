import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import { fetchLogsList, fetchLogsDetail } from '../../services/hitf/interfaceLogsService';

export default {
  namespace: 'interfaceLogs',

  state: {
    dataList: [],
    pagination: {},
    detail: {},
    query: {},
  },

  effects: {
    *fetchLogsList({ payload }, { call, put }) {
      const { ...query } = payload;
      const result = getResponse(yield call(fetchLogsList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            query,
            dataList: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },

    *fetchLogsDetail({ payload }, { call, put }) {
      const organizationId = getCurrentOrganizationId();
      const { interfaceLogId } = payload;
      const result = getResponse(yield call(fetchLogsDetail, { interfaceLogId }, organizationId));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detail: result,
          },
        });
      }
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
