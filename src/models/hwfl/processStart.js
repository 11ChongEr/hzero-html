/**
 * model 流程设置/流程启动
 * @date: 2018-8-21
 * @author: CJ <juan.chen@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { startProcess } from '../../services/hwfl/processStartService';

export default {
  namespace: 'processStart',
  state: {
    variables: [], // 表格数据
  },
  effects: {
    // 启动
    *startProcess({ payload }, { call }) {
      const { tenantId, ...params } = payload;
      const res = yield call(startProcess, tenantId, { ...params });
      return getResponse(res);
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
