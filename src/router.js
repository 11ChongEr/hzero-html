import React from 'react';
import { routerRedux, Switch } from 'dva/router';
// import dynamic from 'dva/dynamic';

import ModalContainer, { registerContainer } from 'components/Modal/ModalContainer';
import Authorized from 'components/Authorized/WrapAuthorized';
import PermissionProvider from 'components/Permission/PermissionProvider';

import LocalProviderAsync from 'utils/intl/LocaleProviderAsync';

import { dynamicWrapper } from 'utils/router';
// import LoadingBar from './components/NProgress/LoadingBar';
import './index.less';

const { ConnectedRouter } = routerRedux;
const { DefaultAuthorizedRoute, PubAuthorizedRoute } = Authorized;
// TODO: 将默认进度条放在BasicLayout中设置
// dynamic.setDefaultLoadingComponent(() => {
//   return <LoadingBar />;
// });

function RouterConfig({ history, app }) {
  // const BasicLayout = dynamicWrapper(app, ['user', 'login'], () => import('./layouts/BasicLayout'));
  const DefaultLayout = dynamicWrapper(app, ['user', 'login'], () =>
    import('./layouts/DefaultLayout')
  );
  const PubLayout = dynamicWrapper(app, ['user', 'login'], () => import('./layouts/PubLayout'));

  return (
    <LocalProviderAsync>
      <PermissionProvider>
        <ConnectedRouter history={history}>
          <React.Fragment>
            <ModalContainer ref={registerContainer} />
            <Switch>
              <PubAuthorizedRoute path="/pub" render={props => <PubLayout {...props} />} />
              {/* <AuthorizedRoute path="/" render={props => <BasicLayout {...props} />} /> */}
              <DefaultAuthorizedRoute path="/" render={props => <DefaultLayout {...props} />} />
            </Switch>
          </React.Fragment>
        </ConnectedRouter>
      </PermissionProvider>
    </LocalProviderAsync>
  );
}

export default RouterConfig;
