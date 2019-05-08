/**
 * model 报表平台/报表查询
 * @date: 2018-11-28
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchReportList,
  fetchParams,
  buildReport,
  createRequest,
} from '../../services/hrpt/reportQueryService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'reportQuery',
  state: {
    reportTypeList: [], // 报表类型
    intervalTypeList: [], // 间隔类型
    list: [], // 数据列表
    paramsData: {}, // 参数数据
    // reportDisplayData: '', // 报表展示数据
    pagination: {}, // 分页器
  },
  effects: {
    // 获取报表类型
    *fetchReportType(_, { call, put }) {
      const reportTypeList = getResponse(yield call(queryIdpValue, 'HRPT.REPORT_TYPE'));
      const intervalTypeList = getResponse(yield call(queryIdpValue, 'HSDR.REQUEST.INTERVAL_TYPE'));
      yield put({
        type: 'updateState',
        payload: {
          reportTypeList,
          intervalTypeList,
        },
      });
    },
    // 获取报表列表数据
    *fetchReportList({ payload }, { call, put }) {
      let result = yield call(fetchReportList, payload);
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
    // 报表查看-获取参数
    *fetchParams({ payload }, { call, put }) {
      let result = yield call(fetchParams, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            paramsData: result,
          },
        });
      }
      return result;
    },
    // 生成报表
    *buildReport({ payload }, { call }) {
      let result = yield call(buildReport, payload);
      result = getResponse(result);
      // if (result) {
      //   yield put({
      //     type: 'updateState',
      //     payload: {
      //       reportDisplayData: result,
      //     },
      //   });
      // }
      return result;
    },
    // 定时报表
    *createRequest({ payload }, { call }) {
      let result = yield call(createRequest, payload);
      result = getResponse(result);
      return result;
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
