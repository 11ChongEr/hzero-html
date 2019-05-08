/**
 * approveAuth - 流程设置/审批权限管理
 * @date: 2018-8-15
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Row, Col, Input, Tabs, Select } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isUndefined, isNumber } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';

import { Header, Content } from 'components/Page';

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
/**
 * 审批权限头-行数据管理组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} approveAuth - 数据源
 * @reactProps {!Object} fetchApproveLoading - 头数据加载是否完成
 * @reactProps {!Object} saving - 保存是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hwfl.approveAuth', 'hwfl.common'] })
@Form.create({ fieldNameProp: null })
@connect(({ approveAuth, loading }) => ({
  approveAuth,
  fetchApproveLoading: loading.effects['approveAuth/fetchApproveHeader'],
  saving: loading.effects['approveAuth/saveHeader'] || loading.effects['approveAuth/updateHeader'],
  tenantId: getCurrentOrganizationId(),
}))
export default class Detail extends Component {
  /**
   * state初始化
   */
  state = {};

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
        type: 'approveAuth/fetchApproveHeader',
        payload: {
          tenantId,
          expressionDefinitionId: id,
        },
      }).then(res => {
        if (res) {
          const { header } = this.props.approveAuth;
          dispatch({
            type: 'approveAuth/fetchApproveLine',
            payload: {
              tenantId,
              headerId: header.expressionDefinitionId,
            },
          });
        }
      });
    } else {
      dispatch({
        type: 'approveAuth/updateState',
        payload: {
          header: {},
          line: [],
        },
      });
    }
    dispatch({
      type: 'approveAuth/fetchOperator',
    });
    dispatch({
      type: 'approveAuth/fetchDataType',
    });
  }

  /**
   * 添加规则
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
      tenantId,
      approveAuth: { header, line },
    } = this.props;
    form.validateFields((err, values) => {
      // 校验操作行为： 新增 or 编辑
      if (!err) {
        const newLine = line.map(item => {
          return {
            ...item,
            expressionDefinitionLineId: isNumber(item.expressionDefinitionLineId)
              ? item.expressionDefinitionLineId
              : null,
          };
        });
        if (isUndefined(match.params.id)) {
          dispatch({
            type: 'approveAuth/saveHeader', // 新增逻辑
            payload: {
              tenantId,
              dto: { ...header, ...values, lines: newLine, type: 'approve' }, // type指定为approve
            },
          }).then(res => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: `/hwfl/setting/approve-auth/detail/${res.expressionDefinitionId}`,
                })
              );
            }
          });
        } else {
          dispatch({
            type: 'approveAuth/updateHeader', // 更新逻辑
            payload: {
              tenantId,
              headerId: header.expressionDefinitionId,
              dto: { ...header, ...values, lines: newLine },
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
   * 规则列表- 行编辑
   * @param {object} record - 规则对象
   */
  @Bind()
  handleEditContent(record) {
    this.setState({ drawerVisible: true, targetItem: record });
  }

  /**
   * 规则列表- 行删除
   * @param {obejct} record - 规则对象
   */
  @Bind()
  handleDeleteContent(record) {
    const {
      dispatch,
      tenantId,
      approveAuth: { line },
    } = this.props;
    // 调删除接口 成功后数据列表清除
    const index = line.findIndex(item => item.code === record.code);
    if (isNumber(record.expressionDefinitionLineId)) {
      dispatch({
        type: 'approveAuth/deleteLine',
        payload: {
          tenantId,
          lineId: record.expressionDefinitionLineId,
          record,
        },
      }).then(res => {
        if (res) {
          notification.success();
          dispatch({
            type: 'approveAuth/updateState',
            payload: {
              line: [...line.slice(0, index), ...line.slice(index + 1)],
            },
          });
        }
      });
    } else {
      dispatch({
        type: 'approveAuth/updateState',
        payload: {
          line: [...line.slice(0, index), ...line.slice(index + 1)],
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
      approveAuth: { line = [] },
    } = this.props;
    const value = {
      expressionDefinitionLineId: uuid(),
      ...values,
    };
    dispatch({
      type: 'approveAuth/updateState',
      payload: {
        line: [...line, value],
      },
    });
    this.setState({ drawerVisible: false, targetItem: {} });
  }

  // 编辑保存滑窗
  @Bind()
  handleEditOk(values) {
    const {
      dispatch,
      approveAuth: { line = [] },
    } = this.props;
    const newList = line.map(item => {
      if (item.expressionDefinitionLineId === values.expressionDefinitionLineId) {
        return { ...item, ...values };
      }
      return item;
    });
    dispatch({
      type: 'approveAuth/updateState',
      payload: { line: newList },
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
      approveAuth: { header },
    } = this.props;
    if (isUndefined(header.code)) {
      // code不存在时，新增操作，进行编码唯一性校验
      dispatch({
        type: 'approveAuth/checkUnique',
        payload: {
          tenantId,
          code: value,
        },
      }).then(res => {
        if (res && res.failed) {
          callback(
            intl.get('hwfl.common.view.validation.code.exist').d('编码已存在，请输入其他编码')
          );
        }
        callback();
      });
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      dispatch,
      tenantId,
      fetchApproveLoading,
      saving,
      match,
      approveAuth: {
        header = {},
        line = [],
        dataTypeList = [],
        operatorList = [],
        category = [],
        scopeType = [],
      },
    } = this.props;
    const { targetItem = {}, drawerVisible = false } = this.state;
    const headerTitle = isUndefined(match.params.id)
      ? intl.get('hwfl.approveAuth.view.message.title.add').d('审批权限 - 新建')
      : intl.get('hwfl.approveAuth.view.message.title.edit').d('审批权限 - 编辑');
    const { getFieldDecorator } = form;
    const listProps = {
      // pagination,
      dataSource: line,
      loading: fetchApproveLoading,
      onEdit: this.handleEditContent,
      onDelete: this.handleDeleteContent,
      // onChange: page => this.handleSearch({ ...query, page: page.current - 1 }),
    };
    const drawerProps = {
      dispatch,
      tenantId,
      dataTypeList,
      operatorList,
      ruleList: line,
      anchor: 'right',
      visible: drawerVisible,
      itemData: targetItem,
      title: intl.get('hwfl.common.model.rule.maintain').d('规则维护'),
      onOk: this.handleSaveContent,
      onEditOk: this.handleEditOk,
      onCancel: this.handleCancelOption,
    };
    return (
      <React.Fragment>
        <Header title={headerTitle} backPath="/hwfl/setting/approve-auth/list">
          <Button icon="save" type="primary" onClick={this.handleSave} loading={saving}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button icon="plus" onClick={this.handleAddLine}>
            {intl.get('hwfl.common.model.rule.add').d('添加规则')}
          </Button>
          {/* <Button icon="sync" onClick={this.handleSearch}>
            {intl.get('hzero.common.button.reload').d('刷新')}
          </Button> */}
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
                    ],
                  })(
                    <Input
                      typeCase="upper"
                      trim
                      inputChinese={false}
                      disabled={header.scope === 1 ? true : !isUndefined(header.code)}
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
                  })(<Input disabled={header.scope === 1} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.model.rule.expression').d('表达式')}
                  {...formLayout}
                >
                  {getFieldDecorator('expressionDefinition', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hwfl.common.model.rule.expression').d('表达式'),
                        }),
                      },
                    ],
                    initialValue: header.expressionDefinition,
                  })(<Input disabled={header.scope === 1} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.model.process.class').d('流程分类')}
                  {...formLayout}
                >
                  {getFieldDecorator('category', {
                    initialValue: header.category,
                    // rules: [
                    //   {
                    //     required: true,
                    //     message: intl.get('hzero.common.validation.notNull', {
                    //       name: intl.get('hwfl.common.model.process.class').d('流程分类'),
                    //     }),
                    //   },
                    // ],
                  })(
                    <Select disabled={header.scope === 1} allowClear>
                      {category.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.approveAuth.model.approve.scope').d('数据范围')}
                  {...formLayout}
                >
                  {getFieldDecorator('scope', {
                    initialValue: header.scope,
                  })(
                    <Select
                      disabled={header.scope === 1 ? true : !isUndefined(header.code)}
                      allowClear
                    >
                      {scopeType.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get('hwfl.common.model.rule.expression.execute').d('执行表达式')}
                  {...formLayout}
                >
                  {getFieldDecorator('expression', {
                    initialValue: header.expression,
                  })(<Input disabled />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
          <Tabs defaultActiveKey="rule">
            <Tabs.TabPane tab={intl.get('hwfl.common.model.rule.tag').d('规则')} key="rule">
              <ListTable {...listProps} />
            </Tabs.TabPane>
          </Tabs>
          <Drawer {...drawerProps} />
        </Content>
      </React.Fragment>
    );
  }
}
