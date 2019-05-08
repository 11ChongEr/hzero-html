import { getResponse } from 'utils/utils';

import {
  queryMessageList,
  queryContent,
  queryRecipient,
  queryError,
  resendMessage,
} from '../../services/hmsg/messageQueryService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'messageQuery',
  state: {
    statusList: [], // 状态列表
    messageTypeList: [], // 消息类型
    messageData: {}, // 消息列表
    content: {}, // 内容
    recipientData: {}, // 收件人
    error: {}, // 错误
  },
  effects: {
    *init(_, { call, put }) {
      const messageTypeList = getResponse(yield call(queryIdpValue, 'HMSG.MESSAGE_TYPE'));
      const statusList = getResponse(yield call(queryIdpValue, 'HMSG.TRANSACTION_STATUS'));

      yield put({
        type: 'updateState',
        payload: {
          messageTypeList,
          statusList,
        },
      });
    },
    // 获取消息数据
    *queryMessageList({ payload }, { call, put }) {
      const { page = 0, size = 10, ...params } = payload;
      const res = yield call(queryMessageList, { page, size, ...params });
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            messageData: list,
          },
        });
      }
    },
    // 获取内容信息
    *queryContent({ payload }, { call, put }) {
      const res = yield call(queryContent, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            content: list,
          },
        });
      }
    },
    // 获取收件人信息
    *queryRecipient({ payload }, { call, put }) {
      const { messageId, tenantId, page = 0, size = 10 } = payload;
      const res = yield call(queryRecipient, messageId, { tenantId, page, size });
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            recipientData: list,
          },
        });
      }
    },
    // 获取错误信息
    *queryError({ payload }, { call, put }) {
      const res = yield call(queryError, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            error: list,
          },
        });
      }
    },
    // 重试
    *resendMessage({ payload }, { call }) {
      const res = yield call(resendMessage, payload);
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
