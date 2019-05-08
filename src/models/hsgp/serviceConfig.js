import { getResponse } from 'utils/utils';
import {
  queryProductWithVersion,
  queryServiceWithProduct,
} from '../../services/hsgp/productService';
import { queryProductWithEnv } from '../../services/hsgp/productEnvService';
import {
  refreshServiceConfig,
  saveServiceConfig,
  queryServiceConfigYaml,
  setDefaultConfig,
} from '../../services/hsgp/serviceConfigService';

export default {
  namespace: 'serviceConfig',

  state: {
    configYamlContent: {}, // 配置信息

    defaultEnv: '', // 当前环境
    envList: [], // 环境列表

    defaultProductVersion: [], // 当前使用的产品及版本
    productWithVersionList: [], // 产品及版本列表数据

    defaultServiceVersion: [], // 保存默认的服务及版本
    serviceWithVersionList: [], // 服务及版本父子值集
  },

  effects: {
    // 查询产品及版本
    *queryProductWithVersion({ payload }, { call, put }) {
      const res = yield call(queryProductWithVersion, payload);
      const data = getResponse(res);
      let defaultProductVersion = [];
      if (Array.isArray(data)) {
        if (data[0]) {
          defaultProductVersion = [data[0].value, data[0].children[0].value];
        }
      }
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            defaultProductVersion,
            productWithVersionList: data,
          },
        });
      }
      return data;
    },

    // 根据产品查询环境
    *queryProductWithEnv({ payload }, { call, put }) {
      const res = yield call(queryProductWithEnv, payload);
      const list = getResponse(res);
      let defaultEnv = [];
      if (Array.isArray(list)) {
        if (list[0]) {
          defaultEnv = list[0].value;
        }
      }
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            envList: list,
            defaultEnv,
          },
        });
      }
      return list;
    },

    // 根据产品及版本查询服务及版本
    *queryServiceAndVersion({ payload }, { call, put }) {
      const res = yield call(queryServiceWithProduct, payload);
      const data = getResponse(res);
      let defaultServiceVersion = [];
      if (Array.isArray(data)) {
        if (data[0]) {
          defaultServiceVersion = [data[0].value, data[0].children[0].value];
        }
      }
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            defaultServiceVersion,
            serviceWithVersionList: data,
          },
        });
      }
      return data;
    },

    // 查询配置信息
    *queryServiceConfigYaml({ payload }, { call, put }) {
      const res = yield call(queryServiceConfigYaml, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            configYamlContent: data,
          },
        });
      }
      return data;
    },

    // 刷新
    *refreshServiceConfig({ payload }, { call }) {
      const res = getResponse(yield call(refreshServiceConfig, payload));
      return res;
    },

    // 保存
    *saveServiceConfig({ payload }, { call }) {
      const res = getResponse(yield call(saveServiceConfig, payload));
      return res;
    },

    // 设置默认配置
    *setDefaultConfig({ payload }, { call }) {
      const res = getResponse(yield call(setDefaultConfig, payload));
      return res;
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
