/**
 * model 可执行定义
 * @date: 2018-9-7
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryIdpValue } from '../../services/api';
import {
  fetchGroupsList,
  fetchExecutable,
  createExecutable,
  updateExecutable,
  deleteHeader,
  fetchExecutableDetail,
} from '../../services/hsdr/executableService';

export default {
  namespace: 'executable',

  state: {
    groupsList: [], // 执行器列表
    executableList: [], // 列表数据
    executableDetail: {}, // 详情数据
    modalVisible: false, // 控制模态框显示
    pagination: {}, // 分页信息对象
    exeTypeList: [], // 可执行类型
    executorStrategyList: [], // 执行器策略
    failStrategyList: [], // 失败处理策略
  },

  effects: {
    // 获取初始化数据
    *init(_, { call, put }) {
      const exeTypeList = getResponse(yield call(queryIdpValue, 'HSDR.GLUE_TYPE'));
      const executorStrategyList = getResponse(yield call(queryIdpValue, 'HSDR.EXECUTOR_STRATEGY'));
      const failStrategyList = getResponse(yield call(queryIdpValue, 'HSDR.FAIL_STRATEGY'));
      yield put({
        type: 'updateState',
        payload: {
          exeTypeList,
          executorStrategyList,
          failStrategyList,
        },
      });
    },
    // 获取执行器
    *fetchGroupsList(_, { call, put }) {
      const result = getResponse(yield call(fetchGroupsList));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            groupsList: result,
          },
        });
      }
    },
    *fetchExecutable({ payload }, { call, put }) {
      const res = yield call(fetchExecutable, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            executableList: list.content, // list.content
            pagination: createPagination(list),
          },
        });
      }
    },
    // 查询job详情
    *fetchExecutableDetail({ payload }, { call, put }) {
      const res = yield call(fetchExecutableDetail, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            executableDetail: result,
          },
        });
      }
      return result;
    },
    // 创建
    *createExecutable({ payload }, { call }) {
      const res = yield call(createExecutable, payload);
      return getResponse(res);
    },
    // 更新
    *updateExecutable({ payload }, { call }) {
      const res = yield call(updateExecutable, payload);
      return getResponse(res);
    },
    // 删除头
    *deleteHeader({ payload }, { call }) {
      const result = yield call(deleteHeader, { ...payload });
      return getResponse(result);
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
