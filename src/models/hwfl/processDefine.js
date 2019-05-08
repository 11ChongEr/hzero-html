/**
 * model 流程设置/流程定义
 * @date: 2018-8-16
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchProcessList,
  addProcess,
  fetchDeployHistory,
  fetchDeployDetail,
  fetchProcessDetail,
  fetchProcessImage,
  deleteProcess,
  releaseProcess,
  checkProcessKey,
  deleteDeploy,
  fetchCategory,
} from '../../services/hwfl/processDefineService';

export default {
  namespace: 'processDefine',
  state: {
    list: [], // 数据列表
    pagination: {}, // 分页器
    deployHistory: {}, // 流程部署记录
    category: [], // 流程分类
  },
  effects: {
    *fetchCategory({ payload }, { call, put }) {
      let result = yield call(fetchCategory, payload);
      result = getResponse(result);
      if (result) {
        const category = result.content.map(item => ({
          value: item.code,
          meaning: item.description,
        }));
        yield put({
          type: 'updateState',
          payload: {
            category,
          },
        });
      }
    },
    *fetchProcessList({ payload }, { call, put }) {
      let result = yield call(fetchProcessList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 流程部署
    *fetchDeployHistory({ payload }, { call, put }) {
      let result = yield call(fetchDeployHistory, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            deployHistory: {
              data: result.content,
              pagination: createPagination(result),
            },
          },
        });
      }
    },
    // 部署详情-部署信息
    *fetchDeployDetail({ payload }, { call }) {
      const result = yield call(fetchDeployDetail, { ...payload });
      return getResponse(result);
    },
    // 部署详情-流程信息
    *fetchProcessDetail({ payload }, { call }) {
      const result = yield call(fetchProcessDetail, { ...payload });
      return getResponse(result);
    },
    // 部署详情-预览图
    *fetchProcessImage({ payload }, { call }) {
      const result = yield call(fetchProcessImage, { ...payload });
      return getResponse(result);
    },
    // 流程添加
    *createProcess({ payload }, { call }) {
      const result = yield call(addProcess, { ...payload });
      return getResponse(result);
    },
    // 流程删除
    *deleteProcess({ payload }, { call }) {
      const result = yield call(deleteProcess, { ...payload });
      return getResponse(result);
    },
    // 流程发布
    *releaseProcess({ payload }, { call }) {
      const result = yield call(releaseProcess, { ...payload });
      return getResponse(result);
    },
    *checkUnique({ payload }, { call }) {
      const result = yield call(checkProcessKey, { ...payload });
      return result;
    },
    *deleteDeploy({ payload }, { call }) {
      const result = yield call(deleteDeploy, { ...payload });
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
