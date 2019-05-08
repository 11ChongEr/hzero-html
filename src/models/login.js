// import { routerRedux } from 'dva/router';
// import fetch from 'dva/fetch';
// import { fakeAccountLogin } from '../services/api';
// import { setAuthority } from 'utils/authority';
// import { reloadAuthorized } from 'utils/Authorized';

import { ACCESS_TOKEN, getAccessToken, removeAccessToken, removeAllCookie } from 'utils/utils';
import { AUTH_LOGOUT_URL } from 'utils/config';
import { cleanMenuTabs } from 'utils/menuTab';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    // *login({ payload }, { call, put }) {
    //   const response = yield call(fakeAccountLogin, payload);
    //   yield put({
    //     type: 'changeLoginStatus',
    //     payload: response,
    //   });
    //   // Login successfully
    //   if (response.status === 'ok') {
    //     reloadAuthorized();
    //     yield put(routerRedux.push('/'));
    //   }
    // },

    logout() {
      const accessToken = getAccessToken();
      removeAccessToken();
      // 退出登录后清空cookie
      removeAllCookie();
      cleanMenuTabs(); // warn 在退出登录后需要清空 menuTabs 信息
      sessionStorage.clear();
      window.location = `${AUTH_LOGOUT_URL}?${ACCESS_TOKEN}=${accessToken}`;
    },
  },

  reducers: {
    // changeLoginStatus(state, { payload }) {
    //   setAuthority(payload.currentAuthority);
    //   return {
    //     ...state,
    //     status: payload.status,
    //     type: payload.type,
    //   };
    // },
  },
};
