/**
 * 节点组维护 - 新建节点组步骤入口页面
 * @date: 2018-9-10
 * @author: 王家程 <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Route, Switch, Redirect } from 'dva/router';
import { Steps } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import { getRoutes } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import style from './index.less';

const { Step } = Steps;

const routerPaths = ['app', 'version', 'config', 'preview'];

@connect(({ loading, nodeGroup, global }) => ({
  loading,
  nodeGroup,
  global,
}))
@formatterCollections({ code: 'hsgp.nodeGroup' })
export default class Create extends React.PureComponent {
  /**
   * 根据路由获取当前步骤
   */
  @Bind()
  getCurrentStep() {
    const { location } = this.props;
    const { pathname } = location;
    const pathList = pathname.split('/');
    switch (pathList[pathList.length - 1]) {
      case routerPaths[0]:
        return 0;
      case routerPaths[1]:
        return 1;
      case routerPaths[2]:
        return 2;
      case routerPaths[3]:
        return 3;
      default:
        return 0;
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      global: { routerData },
      match,
    } = this.props;
    const {
      params: { nodeGroupId, productId, productEnvId },
    } = match;
    return (
      <React.Fragment>
        <Header
          title={intl.get('hsgp.nodeGroup.view.message.title.create').d('服务应用')}
          backPath="/hsgp/node-group"
        />
        <Content>
          <Steps
            current={this.getCurrentStep()}
            labelPlacement="vertical"
            style={{ padding: '48px 0', borderBottom: '1px solid #fafafa' }}
          >
            <Step title={intl.get('hsgp.nodeGroup.view.message.title.app').d('应用信息')} />
            <Step
              title={intl
                .get('hsgp.nodeGroup.view.message.title.appAndVersion')
                .d('选择应用及版本')}
            />
            <Step title={intl.get('hsgp.nodeGroup.view.message.title.config').d('编辑配置')} />
            <Step title={intl.get('hsgp.nodeGroup.view.message.title.preview').d('发布预览')} />
          </Steps>
          <div className={style['config-content']}>
            <Switch>
              {getRoutes(match.path, routerData).map(item => (
                <Route
                  key={item.key}
                  path={item.path}
                  render={props => (
                    <item.component {...props} getCurrentStep={this.getCurrentStep} />
                  )}
                  exact={item.exact}
                />
              ))}
              <Redirect
                form={`/hsgp/node-group/${productId}/${productEnvId}/${nodeGroupId}`}
                to={`/hsgp/node-group/${productId}/${productEnvId}/${nodeGroupId}/app`}
              />
            </Switch>
          </div>
        </Content>
      </React.Fragment>
    );
  }
}
