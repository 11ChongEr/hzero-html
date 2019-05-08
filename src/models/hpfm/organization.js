/**
 * model 组织架构维护
 * @date: 2018-6-19
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  renderTreeData,
  fetchOrgInfo,
  search,
  searchAll,
  saveEdit,
  forbindLine,
  enabledLine,
  saveAdd,
} from '../../services/hpfm/organizationService';
import { queryIdpValue } from '../../services/api';

export default {
  namespace: 'organization',

  state: {
    renderTree: [], // 页面渲染数据结构
    addData: {}, // 新增数据
    pathMap: {}, // 节点层级路径
    groupCode: '',
    groupName: '',
    unitType: [],
    activeOrgData: {},
    expandedRowKeys: [],
  },

  effects: {
    // 获取组织信息
    *fetchOrgInfo({ payload }, { call, put }) {
      const organization = getResponse(yield call(fetchOrgInfo, payload));
      const unitType = yield call(queryIdpValue, 'HPFM.HR.UNIT_TYPE');
      if (organization) {
        yield put({
          type: 'updateState',
          payload: {
            groupCode: organization.tenantNum,
            groupName: organization.tenantName,
            unitType: unitType.filter(item => item.value !== 'D'),
          },
        });
      }
    },
    // 获取组织数据（树形展示）
    *searchOrganizationData({ payload }, { call, put }) {
      const { tenantId, unitName, unitCode, expandFlag, expandedRowKeys, ...others } = payload;
      let result = {};
      let expandedRow = {};
      if (unitCode || unitName) {
        result = yield call(search, { tenantId, unitName, unitCode });
      } else {
        result = yield call(searchAll, { tenantId });
      }
      result = getResponse(result);
      const { renderTree, pathMap } = renderTreeData(result, {});
      if (!expandFlag) {
        expandedRow = {
          expandedRowKeys: Object.keys(pathMap).map(item => +item),
        };
      } else {
        const unitIdList = result.map(item => item.unitId) || [];
        expandedRow = {
          expandedRowKeys: Array.from(new Set([...expandedRowKeys, ...unitIdList])),
        };
      }
      yield put({
        type: 'updateState',
        payload: {
          renderTree,
          pathMap,
          addData: {},
          ...expandedRow,
          ...others,
        },
      });
    },
    // 更新组织信息
    *saveEditData({ payload }, { call }) {
      const result = yield call(saveEdit, payload);
      return getResponse(result);
    },
    // 新增组织信息
    *saveAddData({ payload }, { call }) {
      const result = yield call(saveAdd, payload);
      return getResponse(result);
    },
    // 禁用“组织行”
    *forbidLine({ payload }, { call }) {
      const result = yield call(forbindLine, payload);
      return getResponse(result);
    },
    // 启用“组织行”
    *enabledLine({ payload }, { call }) {
      const result = yield call(enabledLine, payload);
      return getResponse(result);
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
