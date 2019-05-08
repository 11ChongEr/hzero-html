/*eslint-disable*/

import React from 'react';
import { Switch, withRouter } from 'dva/router';

import { startsWith } from 'lodash';

@withRouter
export default class WrapperSwitch extends Switch {
  shouldComponentUpdate(nextProps) {
    const { location: { pathname }, activeTabKey, tabKey, tabPathname } = nextProps;
    return tabKey === activeTabKey && startsWith(pathname, tabPathname); // todo 只有当 pathname 等于 Tab 里的 path 时 才能更新
  }
}
