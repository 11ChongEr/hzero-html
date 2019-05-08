import { getResponse } from 'utils/utils';
import {
  fetchEnv,
  updateEnv,
  createEnv,
  deleteEnv,
  fetchEnvConfigInfo,
  fetchEnvBasicInfo,
} from '../../services/hsgp/envService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'env',
  state: {
    envId: null, // 当前环境id
    envList: {}, // 环境列表
    basicList: {}, // 基础信息列表
    configList: {}, // 配置信息列表
    grantTypeList: [], // 授权类型列表
    URIParams: [], // 存储转换格式后的通用URI参数,对象数组
    currentURIParam: {}, // 当前编辑的URI参数的信息
    requestParams: [], // 存储转换格式后的通用请求参数，对象数组
    currentRequestParam: {}, // 当前编辑的Request参数的信息
  },
  effects: {
    // 查询列表
    *fetchEnv({ payload }, { call, put }) {
      const res = yield call(fetchEnv, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            envList: list,
          },
        });
      }
      return list;
    },
    // 获取某环境配置信息
    *fetchEnvConfigInfo({ payload }, { call, put }) {
      const res = yield call(fetchEnvConfigInfo, payload);
      const info = getResponse(res);
      const data = {};
      const requestParams = [];
      const URIParams = [];
      if (info) {
        info.forEach(element => {
          if (element.configCode === 'COMMON_REQUEST_PARAMS') {
            // 将"{"1":"2","3":"4"}"格式中的 { 和 }去掉
            const value = element.configValue.replace('{', '').replace('}', '');
            if (value !== '') {
              // 将键值对组以逗号格式分开
              const RequestParamsArr = value.split(',');
              RequestParamsArr.forEach(item => {
                // 替换掉引号
                const arr = item.replace(/"/g, '').split(':');
                requestParams.push({ paramsName: arr[0], paramsValue: arr[1] });
              });
            }
          } else if (element.configCode === 'COMMON_URI_PARAMS') {
            const value = element.configValue.replace('{', '').replace('}', '');
            if (value !== '') {
              const URIParamsArr = value.split(',');
              URIParamsArr.forEach(ele => {
                const arr = ele.replace(/"/g, '').split(':');
                URIParams.push({ paramsName: arr[0], paramsValue: arr[1] });
              });
            }
          } else {
            // 将后端传过来的对象数组格式转化为需要的对象格式
            data[element.configCode] = element.configValue;
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            configList: data,
            URIParams,
            requestParams,
          },
        });
      }
      return info;
    },
    // 获取授权类型
    *fetchGrantType(_, { call, put }) {
      const res = yield call(queryIdpValue, 'HSGP.OAUTH.GRANT_TYPE');
      const info = getResponse(res);
      if (info) {
        yield put({
          type: 'updateState',
          payload: {
            grantTypeList: info,
          },
        });
      }
      return info;
    },
    // 获取某环境基本信息
    *fetchEnvBasicInfo({ payload }, { call, put }) {
      const res = yield call(fetchEnvBasicInfo, payload);
      const info = getResponse(res);
      if (info) {
        yield put({
          type: 'updateState',
          payload: {
            basicList: info,
          },
        });
      }
    },
    // 更新环境
    *updateEnv({ payload }, { call }) {
      const res = yield call(updateEnv, payload);
      return getResponse(res);
    },
    // 创建环境
    *createEnv({ payload }, { call }) {
      const res = yield call(createEnv, payload);
      return getResponse(res);
    },
    // 删除环境
    *deleteEnv({ payload }, { call }) {
      const res = yield call(deleteEnv, payload);
      return getResponse(res);
    },
  },
  reducers: {
    // 更新state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
