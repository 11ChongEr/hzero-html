/**
 * @date 2019-03-04
 * @author WY yang.wang06@hand-china.com
 * @copyright ® HAND 2019
 */
import React from 'react';
import { withRouter, Route } from 'dva/router';
import { connect } from 'dva';

import Exception from 'components/Exception';

import {
  extractAccessTokenFromHash,
  setAccessToken,
  getCurrentOrganizationId,
  getCurrentRole,
} from 'utils/utils';

@withRouter
@connect()
export default class AuthorizedRoute extends React.Component {
  state = {
    isAuthorized: false,
    isException: false,
  };

  componentDidMount() {
    const { dispatch, history, location } = this.props;
    const token = extractAccessTokenFromHash(window.location.hash);
    if (token) {
      setAccessToken(token, 60 * 60);
      // 保留上次退出时的页面路径和search
      history.push({
        pathname: location.pathname,
        search: location.search,
      });
    }

    dispatch({
      type: 'user/fetchCurrent',
    }).then(res => {
      if (res) {
        if (!(res instanceof Error)) {
          // 请求 self 接口成功
          dispatch({
            type: 'global/baseInit',
            payload: {
              language: res.language, // 加载菜单国际化
              organizationId: getCurrentOrganizationId(),
              // FIXME: 等 菜单接口好后删除
              roleId: getCurrentRole().id,
            },
          }).then(() => {
            this.setState({
              isAuthorized: true,
            });
          });
        } else {
          // 其他错误
          this.setState({
            isException: true,
          });
          // 清除首屏loading
          const loader = document.querySelector('#loader-wrapper');
          if (loader) {
            document.body.removeChild(loader);
          }
          history.push('/exception/500');
        }
      }
    });
  }

  render() {
    const { render, ...rest } = this.props;
    const { isAuthorized, isException } = this.state;
    return isAuthorized === true ? (
      <Route {...rest} render={props => render(props)} />
    ) : isException === true ? (
      <Exception type="500" />
    ) : null;
  }
}
