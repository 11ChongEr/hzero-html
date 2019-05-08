import React from 'react';
import { getRoutesContainsSelf } from 'utils/utils';
import Route from './Route';
import Switch from './Switch';

export default function getTabRoutes({ pane, routerData, NotFound, menu, activeTabKey } = {}) {
  const { key: tabKey, path: tabPath } = pane;
  const matchRoutes = getRoutesContainsSelf(tabKey, routerData).map(item => {
    return <Route key={item.key} path={item.path} exact={item.exact} component={item.component} />;
  });
  return (
    <Switch tabKey={tabKey} activeTabKey={activeTabKey} tabPathname={tabPath} key={tabKey}>
      {matchRoutes}
      {menu.length === 0 ? null : <Route render={NotFound} />}
    </Switch>
  );
}
