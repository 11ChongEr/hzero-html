/**
 * sendConfig -  发送配置
 * @date: 2018-9-7
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isUndefined, filter, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import notification from 'utils/notification';
import { isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import ListTable from './ListTable';
import Drawer from './Drawer';
/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 2 },
  wrapperCol: { span: 8 },
};
/**
 * 发送配置-行数据管理组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} sendConfig - 数据源
 * @reactProps {!boolean} fetchHeaderLoading - 数据加载是否完成
 * @reactProps {!boolean} createLoading - 新增是否完成
 * @reactProps {!boolean} updateLoading - 编辑是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hmsg.sendConfig', 'entity.tenant'] })
@Form.create({ fieldNameProp: null })
@connect(({ sendConfig, loading }) => ({
  sendConfig,
  tenantRoleLevel: isTenantRoleLevel(),
  tenantId: getCurrentOrganizationId(),
  fetchHeaderLoading: loading.effects['sendConfig/fetchHeader'],
  createLoading: loading.effects['sendConfig/saveHeader'],
  updateLoading: loading.effects['sendConfig/updateHeader'],
}))
export default class Detail extends Component {
  /**
   * state初始化
   */
  state = {
    targetItem: {}, // 表格中的一条记录
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    if (!isUndefined(id)) {
      dispatch({
        type: 'sendConfig/fetchHeader',
        payload: {
          tempServerId: id,
        },
      });
    } else {
      dispatch({
        type: 'sendConfig/updateState',
        payload: {
          header: {},
        },
      });
    }
    dispatch({
      type: 'sendConfig/queryMessageType',
    });
  }

  /**
   * 添加参数
   */
  @Bind()
  handleAddLine() {
    this.setState({ drawerVisible: true, targetItem: {} });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      form,
      match,
      sendConfig: { header = {} },
      tenantId,
      tenantRoleLevel,
    } = this.props;
    const { serverList = [], ...otherValues } = header;
    form.validateFields((err, values) => {
      if (!err) {
        const anotherParameters = serverList.map(item => {
          return {
            ...item,
            tempServerLineId: isNumber(item.tempServerLineId) ? item.tempServerLineId : '',
          };
        });
        const params = {
          ...values,
          tenantId: tenantRoleLevel ? tenantId : values.tenantId,
        };
        if (isUndefined(match.params.id)) {
          dispatch({
            type: 'sendConfig/saveHeader', // 新增逻辑
            payload: {
              dto: { serverList: [...anotherParameters], ...params },
            },
          }).then(res => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: `/hmsg/send-config/detail/${res.tempServerId}`,
                })
              );
            }
          });
        } else {
          dispatch({
            type: 'sendConfig/updateHeader', // 更新逻辑
            payload: {
              tempServerId: header.tempServerId,
              dto: { serverList: [...anotherParameters], ...otherValues, ...params },
            },
          }).then(res => {
            if (res) {
              notification.success();
              dispatch({
                type: 'sendConfig/updateState',
                payload: {
                  header: res,
                },
              });
            }
          });
        }
      }
    });
  }

  /**
   * 参数列表- 行编辑
   * @param {object} record - 规则对象
   */
  @Bind()
  handleEditContent(record) {
    this.setState({ drawerVisible: true, targetItem: { ...record } });
  }

  /**
   * 参数列表- 行删除
   * @param {obejct} record - 规则对象
   */
  @Bind()
  handleDeleteContent(record) {
    const {
      dispatch,
      sendConfig: { header = {} },
    } = this.props;
    const { serverList = [], ...otherValues } = header;
    const recordTempServerLineId = record.tempServerLineId;
    if (isNumber(recordTempServerLineId)) {
      dispatch({
        type: 'sendConfig/deleteLine',
        payload: { ...record },
      }).then(res => {
        if (res) {
          notification.success();
          this.handleSearch();
        }
      });
    } else {
      // 删除的操作
      const newParameters = filter(serverList, item => {
        return recordTempServerLineId !== item.tempServerLineId;
      });
      dispatch({
        type: 'sendConfig/updateState',
        payload: {
          header: { serverList: [...newParameters], ...otherValues },
        },
      });
    }
  }

  /**
   * 新增滑窗保存操作
   * @param {object} values - 保存数据
   */
  @Bind()
  handleSaveContent(values) {
    const {
      dispatch,
      sendConfig: { header = {} },
    } = this.props;
    const { serverList = [], ...otherValues } = header;
    const value = {
      tempServerLineId: uuid(),
      ...values,
    };
    dispatch({
      type: 'sendConfig/updateState',
      payload: {
        header: { serverList: [...serverList, value], ...otherValues },
      },
    });
    this.setState({ drawerVisible: false, targetItem: {} });
  }

  // 编辑保存滑窗
  @Bind()
  handleEditOk(values) {
    const {
      dispatch,
      sendConfig: { header = {} },
    } = this.props;
    const { serverList = [], ...otherValues } = header;
    const newList = serverList.map(item => {
      if (item.tempServerLineId === values.tempServerLineId) {
        return { ...item, ...values };
      }
      return item;
    });
    dispatch({
      type: 'sendConfig/updateState',
      payload: { header: { serverList: newList, ...otherValues } },
    });
    this.setState({ drawerVisible: false, targetItem: {} });
  }

  /**
   * 滑窗取消操作
   */
  @Bind()
  handleCancelOption() {
    this.setState({
      drawerVisible: false,
      targetItem: {},
    });
  }

  /**
   * 改变租户，清空模板和服务
   */
  @Bind()
  changeTenant() {
    const { dispatch } = this.props;
    dispatch({
      type: 'sendConfig/updateState',
      payload: {
        header: { serverList: [] },
      },
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      fetchHeaderLoading,
      createLoading,
      updateLoading,
      match,
      sendConfig: { header = {}, messageType = [] },
      tenantRoleLevel,
      tenantId,
    } = this.props;
    const { targetItem = {}, drawerVisible = false } = this.state;
    const headerTitle = isUndefined(match.params.id)
      ? intl.get('hmsg.sendConfig.view.message.title.add').d('发送配置 - 添加')
      : intl.get('hmsg.sendConfig.view.message.title.edit').d('发送配置 - 编辑');
    const title = targetItem.parameterId
      ? intl.get('hmsg.sendConfig.view.message.drawer.edit').d('编辑服务')
      : intl.get('hmsg.sendConfig.view.message.drawer.add').d('添加服务');
    const { getFieldDecorator, getFieldValue } = form;
    const listProps = {
      messageType,
      loading: fetchHeaderLoading,
      dataSource: header.serverList,
      onEdit: this.handleEditContent,
      onDelete: this.handleDeleteContent,
    };
    const drawerProps = {
      title,
      messageType,
      tenantId: tenantRoleLevel ? tenantId : getFieldValue('tenantId'),
      anchor: 'right',
      visible: drawerVisible,
      itemData: targetItem,
      onOk: this.handleSaveContent,
      onCancel: this.handleCancelOption,
      onEditOk: this.handleEditOk,
    };
    return (
      <React.Fragment>
        <Header title={headerTitle} backPath="/hmsg/send-config/list">
          <Button
            type="primary"
            icon="save"
            onClick={this.handleSave}
            loading={createLoading || updateLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="plus" type="default" onClick={this.handleAddLine}>
            {intl.get('hmsg.sendConfig.view.button.add').d('添加服务')}
          </Button>
        </Header>
        <Content>
          <Form>
            {!tenantRoleLevel && (
              <Form.Item label={intl.get('entity.tenant.tag').d('租户')} {...formLayout}>
                {getFieldDecorator('tenantId', {
                  initialValue: header.tenantId,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('entity.tenant.tag').d('租户'),
                      }),
                    },
                  ],
                })(
                  <Lov
                    code="HPFM.TENANT"
                    disabled={!isUndefined(header.tenantId)}
                    textValue={header.tenantName}
                    onChange={this.changeTenant}
                  />
                )}
              </Form.Item>
            )}
            <Form.Item
              label={intl.get('hmsg.sendConfig.model.sendConfig.messageCode').d('消息代码')}
              {...formLayout}
            >
              {getFieldDecorator('messageCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hmsg.sendConfig.model.sendConfig.messageCode').d('消息代码'),
                    }),
                  },
                ],
                initialValue: header.messageCode,
              })(
                <Input
                  disabled={!isUndefined(header.messageCode)}
                  typeCase="upper"
                  trim
                  inputChinese={false}
                />
              )}
            </Form.Item>
            <Form.Item
              label={intl.get('hmsg.sendConfig.model.sendConfig.messageName').d('消息名称')}
              {...formLayout}
            >
              {getFieldDecorator('messageName', {
                initialValue: header.messageName,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('hmsg.sendConfig.model.sendConfig.messageName').d('消息名称'),
                    }),
                  },
                ],
              })(<Input />)}
            </Form.Item>
            <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
              {getFieldDecorator('enabledFlag', {
                initialValue: isUndefined(match.params.id) ? 1 : header.enabledFlag,
              })(<Switch />)}
            </Form.Item>
            {getFieldDecorator('tenantName', {
              initialValue: header.tenantName,
            })(<span />)}
            {getFieldDecorator('templateCode', {
              initialValue: header.templateCode,
            })(<span />)}
          </Form>
          <Tabs defaultActiveKey="rule">
            <Tabs.TabPane tab={intl.get('hmsg.sendConfig.view.tab.service').d('服务')} key="rule">
              <ListTable {...listProps} />
            </Tabs.TabPane>
          </Tabs>
          <Drawer {...drawerProps} />
        </Content>
      </React.Fragment>
    );
  }
}
