import React from 'react';
import { connect } from 'dva';

@connect(({ global = {} }) => ({
  global,
}))
export default class PermissionControl extends React.Component {
  componentDidMount() {
    const { dispatch, code } = this.props;
    dispatch({
      type: 'global/getPermission',
      payload: {
        code,
      },
    });
  }

  render() {
    const { children } = this.props;
    return children;
  }
}
