// import { isEmpty } from 'lodash';
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from '../../services/api';
import {
  queryList,
  edit,
  create,
  deleteLines,
  deleteHeader,
  queryInterfaceDetail,
  importService,
} from '../../services/hitf/servicesService';

export default {
  namespace: 'services',
  state: {
    code: {},
    list: {}, // 列表数据
    enumMap: {}, // 值集
    // serviceTypes: [], // 服务类型值集、发布类型？
    // soapVersionTypes: [], // SOAP版本值集
    // requestTypes: [], // 请求方式值集
    // authTypes: [], // 认证方式值集
    // grantTypes: [], // 授权模式值集
    // wssPasswordTypes: [], // 加密方式
    // interfaceStatus: [], // 接口状态
    // contentTypes: [], // 接口类型
  },
  effects: {
    *queryIdpValue(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          serviceTypes: 'HITF.SERVICE_TYPE',
          soapVersionTypes: 'HITF.SOAP_VERSION',
          requestTypes: 'HITF.REQUEST_METHOD',
          authTypes: 'HITF.AUTH_TYPE',
          grantTypes: 'HITF.GRANT_TYPE',
          wssPasswordTypes: 'HITF.SOAP_WSS_PASSWORD_TYPE',
          interfaceStatus: 'HITF.INTERFACE_STATUS',
          contentTypes: 'HITF.REQUEST_HEADER',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap,
        },
      });
    },
    // 查询服务列表
    *queryList({ payload }, { call, put }) {
      const res = yield call(queryList, payload);
      const response = getResponse(res);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            list: {
              dataSource: response.content || [],
              pagination: createPagination(response),
            },
          },
        });
      }
    },
    // 修改服务
    *edit({ params }, { call }) {
      const res = getResponse(yield call(edit, params));
      return res;
    },
    // 新增服务
    *create({ params }, { call }) {
      const res = yield call(create, params);
      return getResponse(res);
    },
    // 删除服务
    *deleteHeader(
      {
        payload: { deleteRecord },
      },
      { call }
    ) {
      const res = getResponse(yield call(deleteHeader, deleteRecord));
      return res;
    },
    // 删除行
    *deleteLines({ interfaceIds }, { call }) {
      const res = getResponse(yield call(deleteLines, interfaceIds));
      return res;
    },
    // 查询行详情
    *queryInterfaceDetail({ payload }, { call }) {
      const { page = 0, size = 10, ...query } = payload;
      const res = getResponse(yield call(queryInterfaceDetail, { ...query, page, size }));
      return res;
    },
    // 导入服务
    *importService({ payload }, { call }) {
      const res = getResponse(yield call(importService, payload));
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
