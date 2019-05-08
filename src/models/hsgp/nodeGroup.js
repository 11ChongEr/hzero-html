/**
 * model 节点组维护
 * @date: 2018-9-10
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination, parseParameters } from 'utils/utils';
import { fetchCommonValueSet } from '../../services/hsgp/appSourceService';
import { queryProductWithEnv, queryServiceWithProduct } from '../../services/hsgp/productService';
import { fetchNodeRuleEnabled } from '../../services/hsgp/nodeRuleService';
import { queryProductWithVersion } from '../../services/hsgp/productVersionService';
import {
  fetchNodeGroup,
  createNodeGroup,
  fetchInstanceConfig,
  stopNodeGroup,
  restartNodeGroup,
  deleteNodeGroup,
  updateNodeGroup,
  fetchNodeGroupDetail,
  fetchRuleList,
  fetchGrayRuleList,
  grayComplete,
} from '../../services/hsgp/nodeGroupService';

export default {
  namespace: 'nodeGroup',

  state: {
    nodeGroupTypeList: [], // 节点组类型值集

    defaultProductEnv: [], // 当前产品及环境
    productWithEnvList: [], // 产品及环境列表

    ruleLovList: {}, // 规则 lov 数据
    commonNodeRuleList: [], // 应用信息-节点规则列表

    grayLovList: {}, // 灰度规则 lov 数据
    grayNodeRuleList: [], // 应用信息- 灰度规则列表

    defaultServiceVersion: [], // 当前的服务及版本
    serviceWithVersionList: [], // 服务及版本列表数据，父子值集

    productWithVersionList: [], // 产品版本列表

    nodeGroupList: [], // 节点组列表
    appData: {}, // 应用信息数据，第一步
    versionData: {}, // 版本信息数据，第二步
    configData: {}, // 实例配置信息，第三步
    nodeGroupDetail: {}, // 节点组详情数据
    isEditSave: false, // 是否编辑
    pagination: {}, // 分页对象
  },

  effects: {
    // 获取初始化值集数据
    *init(_, { call, put }) {
      const nodeGroupTypeList = getResponse(
        yield call(fetchCommonValueSet, { code: 'HSGP.NODE_GROUP_TYPE' })
      );
      yield put({
        type: 'updateState',
        payload: {
          nodeGroupTypeList,
        },
      });
    },

    // 查询默认产品环境
    *fetchDefaultProductEnv(_, { call, put }) {
      const res = yield call(queryProductWithEnv);
      const list = getResponse(res);
      let defaultProductEnv = [];
      if (Array.isArray(list)) {
        if (list[0]) {
          defaultProductEnv = [list[0].value, list[0].children[0].value];
        }
      }
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            productWithEnvList: list,
            defaultProductEnv,
          },
        });
      }
      return list;
    },

    // 查询规则 Lov
    *fetchRuleLovList({ payload }, { call, put }) {
      const res = yield call(fetchNodeRuleEnabled, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            ruleLovList: list,
          },
        });
      }
      return list;
    },

    // 查询灰度规则 Lov，实际查询的是节点组规则
    *fetchGrayLovList({ payload }, { call, put }) {
      const res = yield call(fetchNodeRuleEnabled, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            grayLovList: list,
          },
        });
      }
      return list;
    },

    // 第二步中的根据产品查询产品版本
    *queryProductWithVersion({ payload }, { call, put }) {
      const res = yield call(queryProductWithVersion, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            productWithVersionList: data,
          },
        });
      }
      return data;
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

    // 查询列表
    *fetchNodeGroup({ payload }, { call, put }) {
      const res = yield call(fetchNodeGroup, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            nodeGroupList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },
    // 查询详情
    *fetchNodeGroupDetail({ payload }, { call, put }) {
      const res = yield call(fetchNodeGroupDetail, payload);
      const list = getResponse(res);
      if (list) {
        const {
          nodeGroupName,
          commonFlag,
          grayFlag,
          productId,
          productVersionId,
          serviceId,
          serviceVersionId,
          productServiceId,
          instanceConfig,
        } = list;
        yield put({
          type: 'updateState',
          payload: {
            nodeGroupDetail: list,
            appData: { nodeGroupName, commonFlag, grayFlag },
            versionData: {
              productId,
              productVersionId,
              serviceId,
              serviceVersionId,
              productServiceId,
            },
            configData: { instanceConfig },
          },
        });
      }
      return list;
    },

    // 查询关联的节点组规则
    *fetchRuleList({ payload }, { call, put }) {
      const res = yield call(fetchRuleList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            commonNodeRuleList: list,
          },
        });
      }
      return list;
    },

    // 查询关联的灰度规则
    *fetchGrayRuleList({ payload }, { call, put }) {
      const res = yield call(fetchGrayRuleList, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            grayNodeRuleList: list,
          },
        });
      }
      return list;
    },

    // 查询实例配置数据
    *fetchInstanceConfig({ payload }, { call, put }) {
      const res = yield call(fetchInstanceConfig, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            configData: list,
          },
        });
      }
      return list;
    },

    // 新建
    *createNodeGroup({ payload }, { call }) {
      const res = yield call(createNodeGroup, payload);
      return getResponse(res);
    },
    // 编辑
    *updateNodeGroup({ payload }, { call }) {
      const res = yield call(updateNodeGroup, payload);
      return getResponse(res);
    },
    // 停止
    *stopNodeGroup({ payload }, { call }) {
      const res = yield call(stopNodeGroup, payload);
      return getResponse(res);
    },
    // 重启
    *restartNodeGroup({ payload }, { call }) {
      const res = yield call(restartNodeGroup, payload);
      return getResponse(res);
    },
    // 删除
    *deleteNodeGroup({ payload }, { call }) {
      const res = yield call(deleteNodeGroup, payload);
      return getResponse(res);
    },
    // 灰度完成
    *grayComplete({ payload }, { call }) {
      const res = yield call(grayComplete, payload);
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
