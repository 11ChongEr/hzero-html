/**
 * model 地区定义
 * @date: 2018-6-19
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import {
  setDisabledRegion,
  fetchRegionData,
  createRegion,
  updateRegion,
  fetchRegionList,
} from '../../services/hpfm/regionService';

export default {
  namespace: 'region',

  state: {
    modalVisible: false,
    regionDetail: {}, // 地区详情
    regionList: [],
  },

  effects: {
    // 获取地区数据
    *fetchRegionData({ payload }, { call, put }) {
      const res = yield call(fetchRegionData, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            regionList: list,
          },
        });
      }
      return list;
    },

    // 获取地区层级列表数据
    *fetchRegionList({ payload }, { call, put }) {
      const res = yield call(fetchRegionList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            regionList: list,
          },
        });
      }
      return list;
    },

    // 获取地区下级数据
    *fetchRegionChild({ payload }, { call }) {
      const res = yield call(fetchRegionList, payload);
      return getResponse(res);
    },

    // 更新地区
    *updateRegion({ payload }, { call }) {
      const param = payload;
      param.enabledFlag = payload.enabledFlag ? 1 : 0;
      const res = yield call(updateRegion, param);
      return getResponse(res);
    },

    // 新建地区
    *createRegion({ payload }, { call }) {
      const res = yield call(createRegion, payload);
      return getResponse(res);
    },

    // 设置地区禁用
    *setDisabledRegion({ payload }, { call }) {
      const res = yield call(setDisabledRegion, payload);
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
