/**
 * Condition - 流程设置/跳转条件管理
 * @date: 2018-8-15
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button, Row, Col, Input, Select, Tabs } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { isUndefined, isNumber } from 'lodash';
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
 * 跳转条件管理组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} condition - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {!Object} saving - 保存是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
@connect(({ condition, loading }) => ({
  condition,
  loading: loading.effects['condition/fetchConditionHeader'],
  saving: loading.effects['condition/saveHeader'] || loading.effects['condition/updateHeader'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['hwfl.condition', 'hwfl.common'] })
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

  /**
   * 查询/刷新
   */
  @Bind()
  handleSearch() {
    const { dispatch, tenantId, match } = this.props;
    const { id } = match.params;
    if (!isUndefined(id)) {
      // 判断行为： 新增 or 编辑
      dispatch({
        type: 'condition/fetchConditionHeader',
        payload: {
          tenantId,
          expressionDefinitionId: id,
        },
      }).then(res => {
        if (res) {
          const { header } = this.props.condition;
          dispatch({
            type: 'condition/fetchConditionLine',
            payload: {
              tenantId,
              headerId: header.expressionDefinitionId,
            },
          });
        }
      });
    } else {
      dispatch({
        type: 'condition/updateState',
        payload: {
          header: {},
          line: [],
        },
      });
    }
    // 操作符
    dispatch({
      type: 'condition/fetchOperator',
    });
    // 操作数类型
    dispatch({
      type: 'condition/fetchDataType',
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
      condition: { header, line = [] },
    } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        const newLine = line.map(item => {
          return {
            ...item,
            expressionDefinitionLineId: isNumber(item.expressionDefinitionLineId)
              ? item.expressionDefinitionLineId
              : null,
          };
        });
        // 校验操作行为： 新增 or 编辑
        if (isUndefined(match.params.id)) {
          dispatch({
            type: 'condition/saveHeader', // 新增逻辑
            payload: {
              tenantId,
              dto: { ...header, ...values, lines: newLine, type: 'sequence' }, // type指定为sequence
            },
          }).then(res => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: `/hwfl/setting/condition/detail/${res.expressionDefinitionId}`,
                })
              );
            }
          });
        } else {
          dispatch({
            type: 'condition/updateHeader', // 更新逻辑
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
   * 编辑规则
   * @param {object} record - 规则对象
   */
  @Bind()
  handleEditContent(record) {
    this.setState({ drawerVisible: true, targetItem: record });
  }

  /**
   * 删除规则
   * @param {obejct} record - 规则对象
   */
  @Bind()
  handleDeleteContent(record) {
    const {
      dispatch,
      tenantId,
      condition: { line },
    } = this.props;
    const index = line.findIndex(item => item.code === record.code);
    // 调用接口删除，成功后更新表格数据
    if (isNumber(record.expressionDefinitionLineId)) {
      dispatch({
        type: 'condition/deleteLine',
        payload: {
          tenantId,
          lineId: record.expressionDefinitionLineId,
          record,
        },
      }).then(res => {
        if (res) {
          notification.success();
          dispatch({
            type: 'condition/updateState',
            payload: {
              line: [...line.slice(0, index), ...line.slice(index + 1)],
            },
          });
        }
      });
    } else {
      dispatch({
        type: 'condition/updateState',
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
      condition: { line = [] },
    } = this.props;
    const value = {
      expressionDefinitionLineId: uuid(),
      ...values,
    };
    dispatch({
      type: 'condition/updateState',
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
      condition: { line = [] },
    } = this.props;
    const newList = line.map(item => {
      if (item.expressionDefinitionLineId === values.expressionDefinitionLineId) {
        return { ...item, ...values };
      }
      return item;
    });
    dispatch({
      type: 'condition/updateState',
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
      condition: { header },
    } = this.props;
    if (isUndefined(header.code)) {
      // code不存在时，新增操作，进行编码唯一性校验
      dispatch({
        type: 'condition/checkUnique',
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
      loading,
      saving,
      match,
      condition: {
        header = {},
        line = [],
        scopeType = [],
        dataType = [],
        operator = [],
        category = [],
      },
    } = this.props;
    const { targetItem = {}, drawerVisible = false } = this.state;
    const headerTitle = isUndefined(match.params.id)
      ? intl.get('hwfl.condition.view.message.title.add').d('跳转条件 - 新建')
      : intl.get('hwfl.condition.view.message.title.edit').d('跳转条件 - 编辑');
    const { getFieldDecorator } = form;
    const listProps = {
      // pagination,
      loading,
      dataSource: line,
      onEdit: this.handleEditContent,
      onDelete: this.handleDeleteContent,
      // onChange: page => this.handleSearch({ ...query, page: page.current - 1 }),
    };
    const drawerProps = {
      dispatch,
      tenantId,
      dataType,
      operator,
      anchor: 'right',
      visible: drawerVisible,
      itemData: targetItem,
      ruleList: line,
      onOk: this.handleSaveContent,
      onEditOk: this.handleEditOk,
      onCancel: this.handleCancelOption,
      title: intl.get('hwfl.common.model.rule.maintain').d('规则维护'),
    };
    return (
      <React.Fragment>
        <Header title={headerTitle} backPath="/hwfl/setting/condition/list">
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
                  label={intl.get('hwfl.condition.model.condition.scope').d('数据范围')}
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
