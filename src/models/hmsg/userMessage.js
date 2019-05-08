/**
 * model - 站内消息
 * @date: 2018-8-9
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  queryMessage,
  changeRead,
  queryMessageDetail,
  deleteMessage,
} from '../../services/hmsg/userMessageService';

export default {
  namespace: 'userMessage',

  state: {
    messageData: {}, // 消息数据
    messageDetail: {}, // 消息详情
    messageId: '',
    pagination: {}, // 分页参数
  },

  effects: {
    // 查询数据
    *queryMessage({ payload }, { call, put }) {
      const response = yield call(queryMessage, payload);
      const messageData = getResponse(response);
      if (messageData) {
        yield put({
          type: 'updateState',
          payload: { messageData, pagination: createPagination(messageData) },
        });
      }
    },
    // 改变已读
    *changeRead({ payload }, { call }) {
      const response = yield call(changeRead, payload);
      return getResponse(response);
    },
    // 删除消息
    *deleteMessage({ payload }, { call }) {
      const response = yield call(deleteMessage, payload);
      return getResponse(response);
    },
    // 查询消息详情
    *queryDetail({ payload }, { call, put }) {
      const response = yield call(queryMessageDetail, payload);
      const messageDetail = getResponse(response);
      if (messageDetail) {
        yield put({
          type: 'updateState',
          payload: { messageDetail },
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
