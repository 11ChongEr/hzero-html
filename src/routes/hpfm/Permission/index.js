import React, { PureComponent, Fragment } from 'react';
import { Radio } from 'hzero-ui';
import { connect } from 'dva';
import { Route, Switch, Redirect } from 'dva/router';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getRoutes } from 'utils/utils';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@connect(({ global }) => ({
  routerData: global.routerData,
}))
@formatterCollections({ code: 'hpfm.permission' })
export default class Permission extends PureComponent {
  render() {
    const { routerData, location, history } = this.props;
    return (
      <Fragment>
        <Header title={intl.get('hpfm.supplier.view.router.title').d('数据权限')}>
          <RadioGroup value={location.pathname || '/hpfm/permission/rule'} buttonStyle="solid">
            <RadioButton
              value="/hpfm/permission/rule"
              onClick={() => history.push('/hpfm/permission/rule')}
            >
              {intl.get('hpfm.permission.view.router.rule').d('权限规则')}
            </RadioButton>
            <RadioButton
              value="/hpfm/permission/range"
              onClick={() => history.push('/hpfm/permission/range')}
            >
              {intl.get('hpfm.permission.view.router.range').d('权限范围')}
            </RadioButton>
          </RadioGroup>
        </Header>
        <Content>
          <Switch>
            {getRoutes('/hpfm/permission', routerData).map(item => {
              return (
                <Route
                  key={item.key}
                  path={item.path}
                  exact={item.exact}
                  component={item.component}
                />
              );
            })}
            <Redirect exact from="/hpfm/permission" to="/hpfm/permission/rule" />
          </Switch>
        </Content>
      </Fragment>
    );
  }
}
