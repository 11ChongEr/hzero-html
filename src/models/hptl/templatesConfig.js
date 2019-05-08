/**
 * model 门户模板配置明细
 * @date: 2018-8-16
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { removeFileList, queryFileList } from '../../services/api';
import {
  fetchTemplateConfigList,
  createTemplatesConfig,
  fetchTemplatesConfigData,
  enableTemplate,
  fetchTemplateDetail,
  deleteTemplatesConfig,
} from '../../services/hptl/templatesConfigService';

export default {
  namespace: 'templatesConfig',

  state: {
    logoConfigList: [], // logo配置列表
    carouselConfigList: [], // 轮播图配置列表
    templateConfigData: {}, // 模板头数据
    templatesConfigList: [], // 模板定义行数据
    templateDetail: {}, // 模板配置明细数据
    uploadFileList: [], // 上传的文件列表
  },

  effects: {
    // 查询模板配置头数据
    *fetchTemplatesConfigData({ payload }, { call, put }) {
      const res = yield call(fetchTemplatesConfigData, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            templateConfigData: list,
          },
        });
      }
      return list;
    },
    // 查询模板配置行数据
    *fetchTemplateConfigList({ payload }, { call, put }) {
      const res = yield call(fetchTemplateConfigList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            templatesConfigList: list,
          },
        });
      }
      return list;
    },
    // 模板配置明细列表
    *fetchTemplateDetail({ payload }, { call, put }) {
      const res = yield call(fetchTemplateDetail, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            templateDetail: list,
          },
        });
      }
    },
    // 创建门户模板配置明细
    *createTemplatesConfig({ payload }, { call }) {
      const res = yield call(createTemplatesConfig, payload);
      return getResponse(res);
    },
    // 启用模板
    *enableTemplate({ payload }, { call }) {
      const res = yield call(enableTemplate, payload);
      return getResponse(res);
    },
    // 删除模板配置项
    *deleteTemplatesConfig({ payload }, { call }) {
      const res = yield call(deleteTemplatesConfig, payload);
      return getResponse(res);
    },
    // 获取文件
    *queryFileList({ payload }, { call }) {
      const res = yield call(queryFileList, payload);
      return getResponse(res);
    },
    // 删除文件
    *removeFileList({ payload }, { call }) {
      const res = yield call(removeFileList, payload);
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
