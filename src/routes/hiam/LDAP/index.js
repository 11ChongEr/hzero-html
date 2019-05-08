/**
 * index - LDAP
 * @date: 2018-12-20
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Modal, Spin } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isObject, isString } from 'lodash';

import { Header, Content } from 'components/Page';

import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import intl from 'utils/intl';

import LDAPForm from './LDAPForm';
import SyncUserDrawer from './SyncUserDrawer';
import TestConnectDrawer from './TestConnectDrawer';

function isJSON(str) {
  let result;
  try {
    result = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return isObject(result) && !isString(result);
}

/**
 * LDAP - 业务组件 - LDAP
 * @extends {Component} - React.Component
 * @reactProps {!Object} [client={}] - 数据源
 * @reactProps {!Object} [loading={}] - 加载是否完成
 * @reactProps {!Object} [loading.effect={}] - 加载是否完成
 * @reactProps {boolean} [fetchLoading=false] - 客户端列表信息加载中
 * @reactProps {boolean} [updateLoading=false] - 更新LDAP数据处理中
 * @reactProps {boolean} [testLoading=false] - 测试连接中
 * @reactProps {boolean} [enabledLoading=false] - 启用处理中
 * @reactProps {boolean} [disabledLoading=false] - 禁用处理中
 * @reactProps {boolean} [fetchSyncLoading=false] - 查询上一次同步用户数据处理中
 * @reactProps {boolean} [syncLoading=false] - 同步用户处理中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@connect(({ ldap, loading }) => ({
  ldap,
  fetchLoading: loading.effects['ldap/fetchLDAP'],
  updateLoading: loading.effects['ldap/updateLDAP'],
  testLoading: loading.effects['ldap/testConnect'],
  enabledLoading: loading.effects['ldap/enabledLDAP'],
  disabledLoading: loading.effects['ldap/disabledLDAP'],
  fetchSyncLoading: loading.effects['ldap/fetchSyncInfo'],
  syncLoading: loading.effects['ldap/syncUser'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hiam.ldap', 'entity.time'] })
export default class LDAP extends Component {
  form;

  state = {
    testConnectVisible: false,
    syncUserVisible: false,
    showWhich: '',
    ldapData: {},
    syncInfoData: {},
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ldap/queryDirectoryType',
    });
    this.handleSearch();
  }

  /**
   * 查询LDAP数据
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'ldap/fetchLDAP',
      payload: {
        tenantId,
      },
    }).then(res => {
      if (res) {
        this.setState({ ldapData: res });
      }
    });
  }

  // 保存并测试
  @Bind()
  handleSaveAndTest(values = {}) {
    const { dispatch, tenantId } = this.props;
    const { ldapData } = this.state;
    const ldapStatus = values.useSSL === 'Y';
    const params = {
      ...values,
      id: ldapData.id,
      objectVersionNumber: ldapData.objectVersionNumber,
    };
    params.useSSL = ldapStatus;
    if (!params.port) {
      params.port = params.useSSL ? 636 : 389;
    }
    dispatch({
      type: 'ldap/updateLDAP',
      payload: {
        tenantId,
        ...params,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.setState({ ldapData: res }, () => {
          if (res.enabled) {
            this.setState({ testConnectVisible: true, showWhich: 'adminConnect' }, () => {
              this.handleTest(params);
            });
          }
        });
      }
    });
  }

  // 测试
  @Bind()
  handleTest(params) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'ldap/testConnect',
      payload: {
        tenantId,
        ...params,
      },
    });
  }

  // 启用、禁用
  @Bind()
  enableLdap() {
    const { dispatch, tenantId } = this.props;
    const { ldapData } = this.state;
    if (ldapData.enabled) {
      Modal.confirm({
        title: intl.get('hiam.ldap.view.message.confirm').d('确认'),
        content: intl
          .get('hiam.ldap.view.message.content')
          .d(
            '确定要禁用LDAP吗？禁用LDAP后，之前所同步的用户将无法登录平台，且无法使用测试连接和同步用户功能'
          ),
        onOk: () => {
          dispatch({
            type: 'ldap/disabledLDAP',
            payload: {
              tenantId,
              id: ldapData.id,
            },
          }).then(res => {
            if (res) {
              notification.success();
              this.setState({ ldapData: res });
            }
          });
        },
      });
    } else {
      dispatch({
        type: 'ldap/enabledLDAP',
        payload: {
          tenantId,
          id: ldapData.id,
        },
      }).then(res => {
        if (res) {
          notification.success();
          this.setState({ ldapData: res });
        }
      });
    }
  }

  /* 获取同步用户信息 */
  @Bind()
  getSyncInfo() {
    const { dispatch, tenantId } = this.props;
    const { ldapData } = this.state;
    dispatch({
      type: 'ldap/fetchSyncInfo',
      payload: {
        tenantId,
        id: ldapData.id,
      },
    }).then(res => {
      if (isJSON(res) && JSON.parse(res).failed) {
        notification.error({ description: JSON.parse(res).message });
      } else if (res) {
        notification.success();
        this.setState({ syncInfoData: JSON.parse(res) });
      }
    });
  }

  // 同步用户
  @Bind()
  handleSyncUser() {
    const { dispatch, tenantId } = this.props;
    const { ldapData } = this.state;
    dispatch({
      type: 'ldap/syncUser',
      payload: {
        tenantId,
        id: ldapData.id,
      },
    });
  }

  // 打开连接测试弹窗
  @Bind()
  showTestModal() {
    this.setState({ testConnectVisible: true });
  }

  // 关闭连接测试弹窗
  @Bind()
  hiddenTestModal() {
    this.setState({ testConnectVisible: false, showWhich: '' });
  }

  // 打开同步用户弹窗
  @Bind()
  showSyncModal() {
    this.setState({ syncUserVisible: true }, () => {
      this.getSyncInfo(); // 打开弹窗时获取同步用户的信息
    });
  }

  // 关闭同步用户弹窗
  @Bind()
  hiddenSyncModal() {
    this.setState({ syncUserVisible: false });
  }

  render() {
    const {
      dispatch,
      tenantId,
      fetchLoading = false,
      updateLoading = false,
      disabledLoading = false,
      enabledLoading = false,
      testLoading = false,
      syncLoading = false,
      fetchSyncLoading = false,
      ldap: { testData = {}, directoryTypeList = [] },
    } = this.props;
    const {
      testConnectVisible,
      syncUserVisible,
      showWhich,
      ldapData = {},
      syncInfoData = {},
    } = this.state;
    const ldapProps = {
      updateLoading,
      ldapData,
      directoryTypeList,
      onSaveAndTest: this.handleSaveAndTest,
    };
    const testProps = {
      dispatch,
      tenantId,
      showWhich,
      testConnectVisible,
      testLoading,
      ldapData,
      testData,
      onCancel: this.hiddenTestModal,
    };
    const syncProps = {
      dispatch,
      syncUserVisible,
      syncLoading,
      ldapData,
      syncInfoData,
      tenantId,
      onSearch: this.getSyncInfo,
      onOk: this.handleSyncUser,
      onCancel: this.hiddenSyncModal,
    };

    return (
      <React.Fragment>
        <Header title="LDAP">
          {ldapData.enabled ? (
            <Button
              type="primary"
              icon="minus-circle"
              onClick={this.enableLdap}
              loading={disabledLoading}
            >
              {intl.get('hiam.ldap.view.option.stop').d('禁用')}
            </Button>
          ) : (
            <Button
              type="primary"
              icon="check-circle"
              onClick={this.enableLdap}
              loading={enabledLoading}
            >
              {intl.get('hiam.ldap.view.option.enabled').d('启用')}
            </Button>
          )}
          <Button icon="api" onClick={this.showTestModal}>
            {intl.get('hiam.ldap.view.option.testConnect').d('测试连接')}
          </Button>
          <Button icon="swap" onClick={this.showSyncModal}>
            {intl.get('hiam.ldap.view.option.syncUser').d('同步用户')}
          </Button>
          <Button icon="sync" onClick={this.handleSearch}>
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={fetchLoading}>
            <LDAPForm {...ldapProps} />
          </Spin>
          {testConnectVisible && <TestConnectDrawer {...testProps} />}
          {syncUserVisible && (
            <Spin spinning={fetchSyncLoading}>
              <SyncUserDrawer {...syncProps} />
            </Spin>
          )}
        </Content>
      </React.Fragment>
    );
  }
}
