/**
 * codeRule - 编码规则 - model
 * @date: 2018-6-29
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  queryCodeList,
  deleteCodeRule,
  addCodeValue,
  queryDist,
  deleteDist,
  queryDetail,
  addDistValue,
  addCodeDetail,
  deleteCodeDetail,
  queryCode,
} from '../../services/hpfm/codeRuleService';

export default {
  namespace: 'codeRule',

  state: {
    organizationId: '',
    list: {
      data: {
        content: [],
        pagination: {},
      },
    },
    dist: {
      head: {},
      line: {
        list: [],
        pagination: {},
      },
    },
    detail: {
      data: {
        content: [],
        pagination: {},
      },
    },
    tenantStatus: {
      display: 'none',
      required: false,
    },
    keyValue: {
      ruleId: null,
      ruleDistId: null,
    },
    code: {
      LEVEL: [],
      UNITTYPE: [],
      FieldType: [],
      ResetFrequency: [],
      DateMask: [],
      Variable: [],
    },
  },

  effects: {
    *fetchCode({ payload }, { call, put }) {
      const response = yield call(queryCodeList, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryCode',
          payload: data,
        });
      }
    },

    *addCodeRule({ payload }, { call }) {
      const response = yield call(addCodeValue, payload);
      return getResponse(response);
    },

    *removeCode({ payload }, { call }) {
      const response = yield call(deleteCodeRule, payload);
      return getResponse(response);
    },

    *fetchDist({ payload }, { call, put }) {
      const response = yield call(queryDist, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryDist',
          payload: data,
        });
      }
    },

    *addDist({ payload }, { call }) {
      const response = yield call(addDistValue, payload);
      return getResponse(response);
    },

    *removeDist({ payload }, { call }) {
      const response = yield call(deleteDist, payload);
      return getResponse(response);
    },

    *fetchDetail({ payload }, { call, put }) {
      const response = yield call(queryDetail, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryDetail',
          payload: data,
        });
      }
    },

    *saveCodeDetail({ payload }, { call }) {
      const response = yield call(addCodeDetail, payload);
      return getResponse(response);
    },

    *removeCodeDetail({ payload }, { call }) {
      const response = yield call(deleteCodeDetail, payload);
      return getResponse(response);
    },

    *fetchLevel({ payload }, { call, put }) {
      const response = yield call(queryCode, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryLevel',
          payload: data,
        });
      }
    },
    *fetchVariable({ payload }, { call, put }) {
      const response = yield call(queryCode, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryVariable',
          payload: data,
        });
      }
    },
    *fetchUnitType({ payload }, { call, put }) {
      const response = yield call(queryCode, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryUnitType',
          payload: data,
        });
      }
    },
    *fetchFieldType({ payload }, { call, put }) {
      const response = yield call(queryCode, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryFieldType',
          payload: data,
        });
      }
    },
    *fetchResetFrequency({ payload }, { call, put }) {
      const response = yield call(queryCode, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryResetFrequency',
          payload: data,
        });
      }
    },
    *fetchDateMask({ payload }, { call, put }) {
      const response = yield call(queryCode, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryDataMask',
          payload: data,
        });
      }
    },
  },

  reducers: {
    settingOrgId(state, action) {
      return {
        ...state,
        organizationId: action.payload.organizationId,
      };
    },
    queryCode(state, action) {
      return {
        ...state,
        list: {
          data: {
            content: action.payload.content,
            pagination: createPagination(action.payload),
            ...action.payload,
          },
          ...state.data,
        },
      };
    },
    queryDist(state, action) {
      return {
        ...state,
        dist: {
          head: action.payload,
          line: {
            ...action.payload.codeRuleDistDTOList,
            list: action.payload.codeRuleDistDTOList.content,
            pagination: createPagination(action.payload.codeRuleDistDTOList),
          },
        },
        keyValue: {
          ruleId: action.payload.ruleId,
        },
      };
    },
    queryDetail(state, action) {
      return {
        ...state,
        detail: {
          ...state.detail,
          data: {
            content: action.payload.codeRuleDetailDTOList,
            pagination: createPagination(action.payload),
          },
        },
        keyValue: {
          ruleDistId: action.payload.ruleDistId,
        },
      };
    },
    addNewDatail(state, action) {
      return {
        ...state,
        detail: {
          ...state.detail,
          data: {
            ...state.detail.data,
            content: [...state.detail.data.content, action.payload],
          },
        },
      };
    },
    queryLevel(state, action) {
      return {
        ...state,
        code: {
          ...state.code,
          LEVEL: action.payload,
        },
      };
    },
    queryUnitType(state, action) {
      return {
        ...state,
        code: {
          ...state.code,
          UNITTYPE: action.payload,
        },
      };
    },
    queryFieldType(state, action) {
      return {
        ...state,
        code: {
          ...state.code,
          FieldType: action.payload,
        },
      };
    },
    queryResetFrequency(state, action) {
      return {
        ...state,
        code: {
          ...state.code,
          ResetFrequency: action.payload,
        },
      };
    },
    queryDataMask(state, action) {
      return {
        ...state,
        code: {
          ...state.code,
          DateMask: action.payload,
        },
      };
    },
    queryVariable(state, action) {
      return {
        ...state,
        code: {
          ...state.code,
          Variable: action.payload,
        },
      };
    },
    changeFileType(state, action) {
      return {
        ...state,
        code: {
          ...state.code,
          FieldType: state.code.FieldType.filter(type => type.value !== action.payload),
        },
      };
    },
  },
};
