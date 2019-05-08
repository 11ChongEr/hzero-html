// import { isNumber, isEmpty } from 'lodash';
// import { createPagination, getResponse } from 'utils/utils';
// import {
//   queryList,
//   uploadImage,
//   queryCode,
//   queryDetail,
//   create,
//   update,
//   batchDelete,
// } from '../../services/hpfm/staticTextService';
// import { queryUnifyIdpValue } from '../../services/api';
//
// export default {
//   namespace: 'staticText',
//   state: {
//     code: {},
//     list: {
//       dataSource: [],
//       pagination: {
//         pageSize: 10,
//         total: 0,
//         current: 1,
//       },
//       rowKeys: [],
//     },
//     detail: {
//       formData: {},
//       defaultRichTextEditorData: '',
//     },
//     cacheQueryParams: {},
//   },
//   effects: {
//     *queryList({ payload, isCacheQueryParams }, { put, call }) {
//       const res = yield call(queryList, { page: 0, size: 10, ...payload });
//       const response = getResponse(res);
//       const rowKeys = [];
//
//       /**
//        * 组装新dataSource
//        * @function getDataSource
//        * @param {!Array} [collections = []] - 树节点集合
//        * @param {string} parentName - 上级目录名称
//        * @returns {Array} - 新的dataSourcee
//        */
//       function getDataSource(collections = []) {
//         return collections.map(n => {
//           const m = {
//             ...n,
//           };
//           if (!isEmpty(m.children)) {
//             rowKeys.push(n.textId);
//             m.children = getDataSource(m.children);
//           } else {
//             m.children = null;
//           }
//           return m;
//         });
//       }
//       if (response) {
//         const dataSource = getDataSource(response.content || []);
//         yield put({
//           type: 'updateListStateReducer',
//           payload: {
//             dataSource,
//             pagination: createPagination(response),
//             rowKeys,
//           },
//         });
//       }
//       if (isCacheQueryParams) {
//         yield put({
//           type: 'updateStateReducer',
//           payload: {
//             cacheQueryParams: payload,
//           },
//         });
//       }
//     },
//     *uploadImage({ payload, file }, { call }) {
//       const res = yield call(uploadImage, payload, file);
//       return res;
//     },
//     *queryCode({ payload }, { put, call }) {
//       const res = yield call(queryCode, payload);
//       const response = getResponse(res);
//       if (response) {
//         yield put({
//           type: 'setCodeReducer',
//           payload: {
//             [payload.lovCode]: response,
//           },
//         });
//       }
//     },
//     *queryDetail({ textId }, { put, call }) {
//       const res = yield call(queryDetail, textId);
//       const response = getResponse(res);
//       if (response) {
//         yield put({
//           type: 'updateDetailReducer',
//           payload: {
//             formData: response || {},
//             defaultRichTextEditorData: (response || {}).text || '',
//           },
//         });
//         return (response || {}).text;
//       }
//     },
//     *save({ data }, { call }) {
//       let res;
//       if (isNumber(data.textId)) {
//         res = yield call(update, data);
//       } else {
//         res = yield call(create, data);
//       }
//       return getResponse(res);
//     },
//     *batchDelete({ data }, { call }) {
//       const res = yield call(batchDelete, data);
//       return isEmpty(getResponse(res));
//     },
//     *queryUnifyIdpValue({ payload }, { put, call }) {
//       const response = yield call(queryUnifyIdpValue, payload);
//       if (response && !response.failed) {
//         yield put({
//           type: 'setCodeReducer',
//           payload: {
//             [payload]: response,
//           },
//         });
//       }
//     },
//   },
//   reducers: {
//     updateStateReducer(state, { payload }) {
//       return {
//         ...state,
//         ...payload,
//       };
//     },
//     updateListStateReducer(state, { payload }) {
//       return {
//         ...state,
//         list: {
//           ...state.list,
//           ...payload,
//         },
//       };
//     },
//     updateDetailReducer(state, { payload }) {
//       return {
//         ...state,
//         detail: {
//           ...state.detail,
//           ...payload,
//         },
//       };
//     },
//     setCodeReducer(state, { payload }) {
//       return {
//         ...state,
//         code: Object.assign(state.code, payload),
//       };
//     },
//   },
// };

/**
 * staticText.js
 * @date 2018-12-25
 * @author WY yang.wang06@hand-china.com
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  staticTextCreateOne,
  staticTextFetchList,
  staticTextFetchOne,
  staticTextRemoveList,
  staticTextUpdateOne,
} from '../../services/hpfm/staticTextService';

import { queryUnifyIdpValue } from '../../services/api';

export default {
  namespace: 'staticText',
  state: {
    lov: {}, // 存放值集
    list: {}, // 存放 list 页面信息
    detail: {}, // 存放 detail 页面信息
  },
  effects: {
    *fetchStaticTextList({ payload }, { call, put }) {
      const { params } = payload;
      const res = yield call(staticTextFetchList, params);
      const staticTextList = getResponse(res);
      if (staticTextList) {
        yield put({
          type: 'updateState',
          payload: {
            list: {
              dataSource: staticTextList.content,
              pagination: createPagination(staticTextList),
            },
          },
        });
      }
      return staticTextList;
    },
    *fetchStaticTextOne({ payload }, { call, put }) {
      const { textId, params } = payload;
      const res = yield call(staticTextFetchOne, textId, params);
      const staticTextDetail = getResponse(res);
      if (staticTextDetail) {
        yield put({
          type: 'updateState',
          payload: {
            detail: {
              record: staticTextDetail,
            },
          },
        });
      }
    },
    *removeStaticTextList({ payload }, { call }) {
      const { params } = payload;
      const res = yield call(staticTextRemoveList, params);
      return getResponse(res);
    },
    *removeStaticTextOne({ payload }, { call }) {
      const { params } = payload;
      const res = yield call(staticTextRemoveList, params);
      return getResponse(res);
    },
    *updateStaticTextOne({ payload }, { call }) {
      const { params } = payload;
      const res = yield call(staticTextUpdateOne, params);
      return getResponse(res);
    },
    *createStaticTextOne({ payload }, { call }) {
      const { params } = payload;
      const res = yield call(staticTextCreateOne, params);
      return getResponse(res);
    },
    *fetchLanguage(_, { call, put }) {
      const res = yield call(queryUnifyIdpValue, 'HPFM.LANGUAGE');
      const languageRes = getResponse(res);
      if (languageRes) {
        yield put({
          type: 'updateState',
          payload: {
            lov: {
              language: languageRes,
            },
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
    clearDetail(state) {
      return {
        ...state,
        detail: {},
      };
    },
  },
};
