/**
 * model 域名模板
 * @date: 2018-8-14
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchPortalAssign,
  createPortalAssign,
  updatePortalAssign,
  fetchTemplatesConfigData,
  fetchTemplateConfigList,
  enableTemplate,
  enableTenantIdList,
} from '../../services/hptl/portalAssignService';

export default {
  namespace: 'portalAssign',

  state: {
    portalAssignList: [], // 门户分配列表数据
    modalVisible: false, // 控制模态框显示
    pagination: {}, // 分页信息对象
    templateConfigData: {}, // 模板头数据
    templatesConfigList: [], // 模板定义行数据
    enableTenantIdData: [], // 可访问租户列表
  },

  effects: {
    *fetchPortalAssign({ payload }, { call, put }) {
      const res = yield call(fetchPortalAssign, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            portalAssignList: list.content,
            pagination: createPagination(list),
          },
        });
      }
    },
    // 创建门户分配
    *createPortalAssign({ payload }, { call }) {
      const res = yield call(createPortalAssign, payload);
      return getResponse(res);
    },
    // 更新门户分配
    *updatePortalAssign({ payload }, { call }) {
      const res = yield call(updatePortalAssign, payload);
      return getResponse(res);
    },
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
    },
    // 启用模板
    *enableTemplate({ payload }, { call }) {
      const res = yield call(enableTemplate, payload);
      return getResponse(res);
    },
    // 可访问租户列表
    *enableTenantIdList({ payload }, { call, put }) {
      const res = yield call(enableTenantIdList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            enableTenantIdData: list,
          },
        });
      }
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
