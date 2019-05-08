/**
 * messageService - 流程设置/消息服务管理
 * @date: 2018-8-21
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Input, Tabs, Select, Row, Col } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isUndefined, filter, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';

import { Header, Content } from 'components/Page';
import Switch from 'components/Switch';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';

import ListTable from './ListTable';
import Drawer from './Drawer';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 16 },
};
const { Option } = Select;
/**
 * 消息服务头-行数据管理组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} messageService - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {!Object} saving - 数据保存是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hwfl.messageService', 'hwfl.common'] })
@Form.create({ fieldNameProp: null })
@connect(({ messageService, loading }) => ({
  messageService,
  loading: loading.effects['messageService/fetchMessageHeader'],
  saving:
    loading.effects['messageService/saveHeader'] || loading.effects['messageService/updateHeader'],
  tenantId: getCurrentOrganizationId(),
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
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    if (!isUndefined(id)) {
      dispatch({
        type: 'messageService/fetchMessageHeader',
        payload: {
          tenantId,
          expressionDefinitionId: id,
        },
      });
    } else {
      dispatch({
        type: 'messageService/updateState',
        payload: {
          header: {},
        },
      });
    }
    dispatch({
      type: 'messageService/fetchParamsType',
    });
    dispatch({
      type: 'messageService/fetchInterfaceMap',
      payload: { tenantId },
    });
    dispatch({
      type: 'messageService/fetchReturnType',
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
      tenantId,
      match,
      messageService: { header = {} },
    } = this.props;
    const { parameters = [] } = header;
    form.validateFields((err, values) => {
      if (!err) {
        const anotherParameters = parameters.map(item => {
          return {
            ...item,
            parameterId: isNumber(item.parameterId) ? item.parameterId : '',
          };
        });
        if (isUndefined(match.params.id)) {
          // 新增逻辑
          dispatch({
            type: 'messageService/saveHeader',
            payload: {
              tenantId,
              dto: { parameters: [...anotherParameters], ...values, type: 'messageService' },
            },
          }).then(res => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: `/hwfl/setting/message-service/detail/${res.externalDefinitionId}`,
                })
              );
            }
          });
        } else {
          dispatch({
            type: 'messageService/updateHeader', // 更新逻辑
            payload: {
              tenantId,
              externalDefinitionId: header.externalDefinitionId,
              dto: {
                ...header,
                parameters: [...anotherParameters],
                ...values,
                type: 'messageService',
              },
            },
          }).then(res => {
            if (res) {
              notification.success();
              this.handleSearch();
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
      tenantId,
      messageService: { header = {} },
    } = this.props;
    const { parameters = [], ...otherValues } = header;
    const recordParameterId = record.parameterId;
    // 编辑parameterId为数字
    if (isNumber(recordParameterId)) {
      dispatch({
        type: 'messageService/deleteLine',
        payload: { tenantId, recordParameterId, record },
      }).then(res => {
        if (res) {
          this.handleSearch();
        }
      });
    } else {
      // 删除的操作
      const newParameters = filter(parameters, item => {
        return recordParameterId.indexOf(item.parameterId) < 0;
      });
      dispatch({
        type: 'messageService/updateState',
        payload: {
          header: { parameters: [...newParameters], ...otherValues },
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
      messageService: { header = {} },
    } = this.props;
    const { parameters = [], ...otherValues } = header;
    const value = {
      parameterId: uuid(),
      ...values,
    };
    dispatch({
      type: 'messageService/updateState',
      payload: { header: { parameters: [...parameters, value], ...otherValues } },
    });
    this.setState({ drawerVisible: false, targetItem: {} });
  }

  // 编辑保存滑窗
  @Bind()
  handleEditOk(values) {
    const {
      dispatch,
      messageService: { header = {} },
    } = this.props;
    const { parameters = [], ...otherValues } = header;
    const newList = parameters.map(item => {
      if (item.parameterId === values.parameterId) {
        return values;
      }
      return item;
    });
    dispatch({
      type: 'messageService/updateState',
      payload: { header: { parameters: newList, ...otherValues } },
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
   * 条件编码唯一性校验
   * @param {!object} rule - 规则
   * @param {!string} value - 表单值
   * @param {!Function} callback
   */
  @Bind()
  checkUnique(rule, value, callback) {
    const {
      dispatch,
      tenantId,
      form: { getFieldValue },
    } = this.props;
    dispatch({
      type: 'messageService/checkUnique',
      payload: {
        tenantId,
        code: value,
        type: 'messageService',
      },
    }).then(res => {
      if (res && res.failed && getFieldValue('code')) {
        callback(
          intl.get('hwfl.common.view.validation.code.exist').d('编码已存在，请输入其他编码')
        );
      }
      callback();
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      match,
      loading,
      saving,
      messageService: {
        header = {},
        returnTypeMap = [],
        interfaceMap = [],
        paramsType = [],
        scopeType = [],
      },
    } = this.props;
    const { targetItem = {}, drawerVisible = false } = this.state;
    const headerTitle = isUndefined(match.params.id)
      ? intl.get('hwfl.messageService.view.message.title.add').d('消息服务 - 新建')
      : intl.get('hwfl.messageService.view.message.title.edit').d('消息服务 - 编辑');
    const title = targetItem.parameterId
      ? intl.get('hwfl.common.model.param.edit').d('编辑参数')
      : intl.get('hwfl.common.model.param.add').d('添加参数');
    const { getFieldDecorator } = form;
    const listProps = {
      loading,
      paramsType,
      dataSource: header.parameters,
      onEdit: this.handleEditContent,
      onDelete: this.handleDeleteContent,
    };
    const drawerProps = {
      title,
      paramsType,
      anchor: 'right',
      visible: drawerVisible,
      itemData: targetItem,
      onOk: this.handleSaveContent,
      onCancel: this.handleCancelOption,
      onEditOk: this.handleEditOk,
    };
    return (
      <React.Fragment>
        <Header title={headerTitle} backPath="/hwfl/setting/message-service/list">
          <Button icon="save" type="primary" onClick={this.handleSave} loading={saving}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="plus" onClick={this.handleAddLine}>
            {intl.get('hwfl.common.model.param.add').d('添加参数')}
          </Button>
        </Header>
        <Content>
          <Form>
            <Row gutter={24} type="flex">
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.model.common.code').d('编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('code', {
                    initialValue: header.code,
                    validateFirst: true,
                    validateTrigger: 'onBlur',
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hwfl.common.model.common.code').d('编码'),
                        }),
                      },
                      {
                        validator: isUndefined(match.params.id) ? this.checkUnique : '',
                      },
                    ], // 校验规则
                  })(
                    <Input
                      typeCase="upper"
                      trim
                      inputChinese={false}
                      disabled={!isUndefined(header.code)}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.model.common.description').d('描述')}
                  {...formLayout}
                >
                  {getFieldDecorator('description', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hwfl.common.model.common.description').d('描述'),
                        }),
                      },
                    ],
                    initialValue: header.description,
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.view.message.apiUrl').d('接口映射')}
                  {...formLayout}
                >
                  {getFieldDecorator('url', {
                    initialValue: header.url,
                  })(
                    <Select>
                      {interfaceMap.map(item => (
                        <Option key={item.code} value={item.code}>
                          {item.description}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.view.message.returnType').d('返回类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('returnType', {
                    initialValue: header.returnType,
                  })(
                    <Select>
                      {returnTypeMap &&
                        returnTypeMap.map(item => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.messageService.model.messageService.scope').d('数据范围')}
                  {...formLayout}
                >
                  {getFieldDecorator('scope', {
                    initialValue: header.scope,
                  })(
                    <Select disabled={!isUndefined(header.code)} allowClear>
                      {scopeType &&
                        scopeType.map(item => (
                          <Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.view.message.invokeRemoteService').d('调用远程服务')}
                  {...formLayout}
                >
                  {getFieldDecorator('invokeRemoteService', {
                    initialValue: isUndefined(match.params.id) ? 1 : header.invokeRemoteService,
                  })(<Switch />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.view.message.context').d('传递上下文')}
                  {...formLayout}
                >
                  {getFieldDecorator('contextEnable', {
                    initialValue: isUndefined(match.params.id) ? 0 : header.contextEnable,
                  })(<Switch />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Tabs defaultActiveKey="rule">
            <Tabs.TabPane tab={intl.get('hwfl.common.model.param.tag').d('参数')} key="rule">
              <ListTable {...listProps} />
            </Tabs.TabPane>
          </Tabs>
          <Drawer {...drawerProps} />
        </Content>
      </React.Fragment>
    );
  }
}
