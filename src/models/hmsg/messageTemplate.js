/**
 * model 消息模板
 * @date: 2018-7-26
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  search,
  searchDetail,
  addTemplate,
  updateTemplate,
  queryLanguageData,
  searchCategoryCodeTree,
} from '../../services/hmsg/messageTemplateService';
// import { queryIdpValue } from '../../services/api';

/**
 * 定义消息模板功能数据源及处理方法
 */
export default {
  namespace: 'messageTemplate', // model名称
  state: {
    list: [], // 数据展示列表
    pagination: {}, // 分页器
    detail: {}, // 消息模板明细
    categoryTree: [], // 消息子类型
    language: [], // 语言数据列表
  },
  effects: {
    // 获取消息子类型
    *fetchType(_, { call, put }) {
      const categoryTree = getResponse(
        yield call(searchCategoryCodeTree, {
          'HMSG.MESSAGE_CATEGORY': 1,
          'HMSG.MESSAGE_SUBCATEGORY': 2,
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          categoryTree,
        },
      });
    },
    // 语言数据获取
    *fetchLanguage(_, { call, put }) {
      const language = yield call(queryLanguageData);
      yield put({
        type: 'updateState',
        payload: {
          language,
        },
      });
    },
    // 消息模板列表数据获取
    *fetchTemplate({ payload }, { call, put }) {
      let result = yield call(search, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            pagination: createPagination(result),
            detail: {},
          },
        });
      }
    },
    *fetchDetail({ payload }, { call, put }) {
      let result = yield call(searchDetail, payload);
      result = getResponse(result);
      yield put({
        type: 'updateState',
        payload: {
          detail: result,
        },
      });
      return result;
    },
    // 更新模板
    *updateTemplate({ payload }, { call }) {
      const result = yield call(updateTemplate, payload);
      return getResponse(result);
    },
    // 添加模板
    *addTemplate({ payload }, { call }) {
      const result = yield call(addTemplate, payload);
      return getResponse(result);
    },
  },
  reducers: {
    // 合并state状态数据,生成新的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
