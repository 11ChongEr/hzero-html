/**
 * model - 工作台卡片
 * @date: 2019-02-23
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { getResponse } from 'utils/utils';
import {
  queryWorkflow,
  querySystemMessage,
  queryAnnouncement,
  changeRead,
} from '../../services/dashboard/cardsService';

export default {
  namespace: 'cards',
  state: {
    // Hzero
    functions: [], // 固定的常用功能
    allFunction: [], // 全部的常用功能
    workflowList: [], // 工作流
    systemMessageList: [], // 系统消息
    announcementList: [], // 公告消息
    checkedKeys: [], // 选中的常用功能
    isListLoad: null,
    allCheckedKeys: [],
  },

  effects: {
    // 查询系统消息
    *querySystemMessage({ payload }, { call, put }) {
      const data = getResponse(yield call(querySystemMessage, payload));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            systemMessageList: data,
          },
        });
      }
    },
    // 查询工作流
    *queryWorkflow({ payload }, { call, put }) {
      const data = getResponse(yield call(queryWorkflow, payload));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            workflowList: data.content,
          },
        });
      }
    },

    // 查询平台公告
    *queryAnnouncement({ payload }, { call, put }) {
      const data = getResponse(yield call(queryAnnouncement, payload));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            announcementList: data.content,
          },
        });
      }
    },
    // 系统消息变为已读
    *changeRead({ payload }, { call }) {
      const response = yield call(changeRead, payload);
      return getResponse(response);
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
