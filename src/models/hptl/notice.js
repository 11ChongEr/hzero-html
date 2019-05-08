/**
 * model 公告管理
 * @date: 2018-8-6
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  queryIdpValue,
  queryUUID,
  removeFileList,
  queryFileList,
  queryUnifyIdpValue,
} from '../../services/api';
import {
  fetchNotice,
  createNotice,
  updateNotice,
  uploadImage,
  queryNoticeType,
  deleteNotice,
  queryNotice,
  publicNotice,
  revokeNotice,
} from '../../services/hptl/noticeService';

export default {
  namespace: 'notice',

  state: {
    noticeList: [], // 公告列表数据
    pagination: {}, // 分页对象
    noticeDetail: {
      // 公告明细信息
      noticeContent: {
        noticeBody: '',
      },
    },
    noticeReceiverType: [], // 公告接受者类型
    noticeCategory: [], // 公告类别
    noticeStatus: [], // 公告状态
    noticeType: [], // 公告类型
    langList: [], // 语言列表
    noticeCascaderType: [], // 级联数据
  },

  effects: {
    // 获取初始化数据
    *init(_, { call, put }) {
      const langList = getResponse(yield call(queryUnifyIdpValue, 'HPFM.LANGUAGE'));
      const noticeReceiverType = getResponse(
        yield call(queryIdpValue, 'HPTL.NOTICE.RECERVER_TYPE')
      );
      const noticeCategory = getResponse(yield call(queryIdpValue, 'HPTL.NOTICE.NOTICE_CATEGORY'));
      const noticeStatus = getResponse(yield call(queryIdpValue, 'HPTL.NOTICE.STATUS'));
      const noticeType = getResponse(
        yield call(queryNoticeType, {
          'HPTL.NOTICE.NOTICE_TYPE': 1,
          'HPTL.NOTICE.NOTICE_TYPE.CH': 2,
        })
      );
      const noticeCascaderType = getResponse(
        yield call(queryNoticeType, {
          'HPTL.NOTICE.RECERVER_TYPE': 1,
          'HPTL.NOTICE.NOTICE_CATEGORY': 2,
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          noticeReceiverType,
          noticeStatus,
          noticeType,
          noticeCascaderType,
          noticeCategory,
          langList,
        },
      });
    },
    *fetchNotice({ payload }, { call, put }) {
      const res = yield call(fetchNotice, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },
    // 创建公告信息
    *createNotice({ payload }, { call }) {
      const res = yield call(createNotice, payload);
      return getResponse(res);
    },
    // 更新公告信息
    *updateNotice({ payload }, { call }) {
      const res = yield call(updateNotice, payload);
      return getResponse(res);
    },
    // 删除公告信息
    *deleteNotice({ payload }, { call }) {
      const res = yield call(deleteNotice, payload);
      return getResponse(res);
    },
    // 查询单条公告信息
    *queryNotice({ payload }, { call, put }) {
      const res = yield call(queryNotice, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            noticeDetail: list,
          },
        });
      }
      return list;
    },
    // 发布公告信息
    *publicNotice({ payload }, { call }) {
      const res = yield call(publicNotice, payload);
      return getResponse(res);
    },
    // 撤销删除公告信息
    *revokeNotice({ payload }, { call }) {
      const res = yield call(revokeNotice, payload);
      return getResponse(res);
    },
    // 获取文件
    *queryFileList({ payload }, { call }) {
      const res = yield call(queryFileList, payload);
      return getResponse(res);
    },
    // 查询UUID
    *fetchUuid(_, { call }) {
      const res = yield call(queryUUID);
      return getResponse(res);
    },
    // 删除文件
    *removeFile({ payload }, { call }) {
      const res = yield call(removeFileList, payload);
      return getResponse(res);
    },
    // 富文本上传图片
    *uploadImage({ payload, file }, { call }) {
      const res = yield call(uploadImage, payload, file);
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
