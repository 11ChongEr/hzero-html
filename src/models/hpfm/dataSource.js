import { getResponse, createPagination } from 'utils/utils';

import {
  fetchDataSourceList,
  createDataSource,
  editDataSource,
  deleteDataSource,
  addService,
  fetchServiceList,
  deleteService,
  handleTestDataSource,
  getDbPoolParams,
  getDriverClass,
  fetchDataSourceDetail,
} from '../../services/hpfm/dataSourceService';
import { queryMapIdpValue } from '../../services/api';

export default {
  namespace: 'dataSource',
  state: {
    dataSourceData: {}, // 查询数据列表
    detaSourceDetail: {}, // 数据源详情数据
    datasourceId: undefined, // 数据源id
    tenantData: {}, // 租户列表
    dbPoolParams: {}, // 连接池参数数据
    dataSourceTypeList: [], // 数据库类型值集
    dbPoolTypeList: [], // 连接池类型值集
    dsPurposeCodeList: [], // 数据源用途值集
    pagination: {}, // 分页对象
  },
  effects: {
    // 统一获取值级的数据
    *batchCode({ payload }, { put, call }) {
      const { lovCodes } = payload;
      const code = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (code) {
        const {
          dataSourceType: dataSourceTypeList = [],
          dbPoolType: dbPoolTypeList = [],
          dsPurposeCode: dsPurposeCodeList = [],
        } = code;
        yield put({
          type: 'updateState',
          payload: {
            dataSourceTypeList,
            dbPoolTypeList,
            dsPurposeCodeList,
          },
        });
      }
      return code;
    },

    // 获取连接池参数
    *getDbPoolParams({ payload }, { call, put }) {
      const res = yield call(getDbPoolParams, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            dbPoolParams: list,
          },
        });
      }
      return list;
    },

    // 获取驱动类
    *getDriverClass({ payload }, { call }) {
      const res = yield call(getDriverClass, payload);
      return getResponse(res);
    },

    // 获取数据源列表数据
    *fetchDataSourceList({ payload }, { call, put }) {
      const res = yield call(fetchDataSourceList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            dataSourceData: list,
            pagination: createPagination(list),
          },
        });
      }
    },

    // 获取数据源详情
    *fetchDataSourceDetail({ payload }, { call, put }) {
      const res = yield call(fetchDataSourceDetail, payload);
      const data = getResponse(res);
      if (data) {
        const { options = '{}' } = data;
        yield put({
          type: 'updateState',
          payload: {
            dataSourceDetail: data,
            dbPoolParams: JSON.parse(options),
          },
        });
      }
    },

    // 新建保存
    *createDataSource({ payload }, { call, put }) {
      const res = getResponse(yield call(createDataSource, { ...payload }));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            datasourceId: res.datasourceId,
          },
        });
      }
      return res;
    },

    // 编辑保存
    *editDataSource({ payload }, { call }) {
      const result = yield call(editDataSource, { ...payload });
      return getResponse(result);
    },

    // 删除数据库
    *deleteDataSource({ payload }, { call }) {
      const result = yield call(deleteDataSource, payload);
      return getResponse(result);
    },

    // 查询服务
    *fetchServiceList({ payload }, { call, put }) {
      const { page = 0, size = 10, ...params } = payload;
      const res = yield call(fetchServiceList, { page, size, ...params });
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            tenantData: list,
          },
        });
      }
    },

    // 添加服务
    *addService({ payload }, { call }) {
      const result = yield call(addService, payload);
      return getResponse(result);
    },

    // 删除服务
    *deleteService({ payload }, { call }) {
      const result = yield call(deleteService, { ...payload });
      return getResponse(result);
    },

    // 测试数据源
    *handleTestDataSource({ payload }, { call }) {
      const result = yield call(handleTestDataSource, { ...payload });
      return getResponse(result);
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
