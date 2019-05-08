import { getResponse } from 'utils/utils';
import {
  fetchDefaultEnv,
  fetchNodeGrayGroup, // 获取灰度发布列表
  fetchNodeGroup, // 获取某灰度发布的节点组列表
  completeNodeGrayGroup,
  releaseNodeGrayGroup,
  createNodeGrayGroup,
  stopNodeGroup,
  restartNodeGroup,
  deleteNodeGroup,
  fetchNewestNodeGroup,
  saveNodeGroups,
  deleteRelation,
  deleteNodeGrayGroup,
} from '../../services/hsgp/nodeGrayGroupService';

export default {
  namespace: 'nodeGrayGroup',
  state: {
    envData: {}, // 当前环境数据
    NodeGrayGroupList: {}, // 灰度发布列表数据
    NodeGroupList: {}, // 节点组列表
    currentGrayGroup: {}, // 当前灰度发布数据
    NewestNodeGroupList: {}, // 可新增的节点组数据列表
  },
  effects: {
    // 查询默认环境
    *fetchDefaultEnv(_, { call, put }) {
      const res = yield call(fetchDefaultEnv);
      const envData = getResponse(res);
      if (envData) {
        yield put({
          type: 'updateState',
          payload: {
            envData,
          },
        });
      }
      return envData;
    },

    // 查询灰度发布列表数据
    *fetchNodeGrayGroup({ payload }, { call, put }) {
      const res = yield call(fetchNodeGrayGroup, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            NodeGrayGroupList: data,
          },
        });
      }
      return data;
    },

    // 查询某灰度发布的节点组
    *fetchNodeGroup({ payload }, { call, put }) {
      const res = yield call(fetchNodeGroup, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            NodeGroupList: data,
          },
        });
      }
      return data;
    },

    // 保存当前灰度发布数据
    *saveNodeGroupData({ payload }, { put }) {
      yield put({
        type: 'updateState',
        payload: {
          currentGrayGroup: payload,
        },
      });
    },

    // 结束灰度
    *completeNodeGrayGroup({ payload }, { call }) {
      const res = yield call(completeNodeGrayGroup, payload);
      const data = getResponse(res);
      return data;
    },

    // 发布灰度
    *releaseNodeGrayGroup({ payload }, { call }) {
      const res = yield call(releaseNodeGrayGroup, payload);
      const data = getResponse(res);
      return data;
    },

    // 创建灰度发布
    *createNodeGrayGroup({ payload }, { call }) {
      const res = yield call(createNodeGrayGroup, payload);
      return getResponse(res);
    },

    // 停止节点组
    *stopNodeGroup({ payload }, { call }) {
      const res = yield call(stopNodeGroup, payload);
      return getResponse(res);
    },

    // 重启节点组
    *restartNodeGroup({ payload }, { call }) {
      const res = yield call(restartNodeGroup, payload);
      return getResponse(res);
    },

    // 删除节点组
    *deleteNodeGroup({ payload }, { call }) {
      const res = yield call(deleteNodeGroup, payload);
      return getResponse(res);
    },

    // 获取可添加的节点组
    *fetchNewestNodeGroup({ payload }, { call, put }) {
      const res = yield call(fetchNewestNodeGroup, payload);
      const info = getResponse(res);
      if (info) {
        yield put({
          type: 'updateState',
          payload: {
            NewestNodeGroupList: info,
          },
        });
      }
      return info;
    },

    // 保存为当前灰度范围选择的节点组数据
    *saveNodeGroups({ payload }, { call }) {
      const res = yield call(saveNodeGroups, payload);
      return getResponse(res);
    },

    // 删除节点组的灰度发布关系
    *deleteRelation({ payload }, { call }) {
      const res = yield call(deleteRelation, payload);
      return getResponse(res);
    },

    // 删除灰度发布
    *deleteNodeGrayGroup({ payload }, { call }) {
      const res = yield call(deleteNodeGrayGroup, payload);
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
