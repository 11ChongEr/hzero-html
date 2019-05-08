/**
 * RuleEngine - 规则引擎明细维护
 * @date: 2018-9-28
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Button, Row, Col, Select } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import Switch from 'components/Switch';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';

import notification from 'utils/notification';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { isTenantRoleLevel } from 'utils/utils';

import Drawer from './Drawer';

/**
 * Form.Item 组件label、wrapper长度比例划分
 */
const formLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};
/**
 * 规则引擎明细组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} ruleEngine - 数据源
 * @reactProps {!Object} createRuleEngineLoading - 规则引擎创建是否完成
 * @reactProps {!Object} editRuleEngineLoading - 规则引擎编辑是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['hpfm.ruleEngine'] })
@connect(({ ruleEngine, loading }) => ({
  ruleEngine,
  createRuleEngineLoading: loading.effects['ruleEngine/createRuleEngine'],
  editRuleEngineLoading: loading.effects['ruleEngine/editRuleEngine'],
}))
export default class Detail extends PureComponent {
  state = {
    visible: false, // 测试模态框是否可见
  };

  /**
   * componentDidMount
   * render()调用后获取页面数据信息
   */
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 查询
   *
   * @memberof Detail
   */
  @Bind()
  handleSearch() {
    const { dispatch, match } = this.props;
    const { id } = match.params;
    if (!isUndefined(id)) {
      dispatch({
        type: 'ruleEngine/fetchDetail',
        payload: {
          ruleScriptId: id,
        },
      });
    } else {
      dispatch({
        type: 'ruleEngine/updateState',
        payload: {
          detail: {},
        },
      });
    }
    dispatch({
      type: 'ruleEngine/queryScriptTypeCode',
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      form,
      dispatch,
      match,
      ruleEngine: { detail = {} },
    } = this.props;
    const { id } = match.params;
    form.validateFields((err, values) => {
      if (isEmpty(err)) {
        // 校验通过，进行保存操作
        if (isUndefined(id)) {
          // 新建
          dispatch({
            type: 'ruleEngine/createRuleEngine',
            payload: {
              ...values,
            },
          }).then(res => {
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: `/hpfm/rule-engine/detail/${res.ruleScriptId}`,
                })
              );
            }
          });
        } else {
          dispatch({
            type: 'ruleEngine/editRuleEngine',
            payload: {
              ...detail,
              ...values,
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
   * 打开测试模态框
   */
  @Bind()
  handleOpenTestModal() {
    this.setState({
      visible: true,
    });
  }

  /**
   * 关闭测试模态框
   *
   * @memberof Detail
   */
  @Bind()
  handleCloseTestModal() {
    const { dispatch } = this.props;
    this.setState({
      visible: false,
    });
    dispatch({
      type: 'ruleEngine/updateState',
      payload: { testContent: undefined },
    });
  }

  /**
   * 测试保存
   * @param {*} values
   */
  @Bind()
  handleTest(params) {
    const {
      dispatch,
      form: { getFieldValue },
    } = this.props;
    const tenantId = getFieldValue('tenantId');
    const scriptCode = getFieldValue('scriptCode');
    dispatch({
      type: 'ruleEngine/testRuleEngine',
      payload: { tenantId, scriptCode, params },
    }).then(res => {
      if (res) {
        notification.success();
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator },
      ruleEngine,
      createRuleEngineLoading,
      editRuleEngineLoading,
      match: {
        params: { id },
      },
    } = this.props;
    const { detail = {}, scriptTypeCode = [], testContent, categoryList = [] } = ruleEngine;
    const { visible } = this.state;
    const drawerProps = {
      visible,
      testContent,
      onCancel: this.handleCloseTestModal,
      onTest: this.handleTest,
    };
    return (
      <Fragment>
        <Header
          title={intl.get('hpfm.ruleEngine.view.message.title.detail').d('规则引擎明细')}
          backPath="/hpfm/rule-engine/list"
        >
          <Button
            loading={createRuleEngineLoading || editRuleEngineLoading}
            onClick={this.handleSave}
            type="primary"
            icon="save"
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            onClick={this.handleOpenTestModal}
            type="default"
            icon="check-circle"
            hidden={isUndefined(id)}
          >
            {intl.get('hpfm.ruleEngine.view.button.check').d('校验')}
          </Button>
        </Header>
        <Content>
          <Form>
            <Row>
              {!isTenantRoleLevel() && (
                <Col span={9}>
                  <Form.Item
                    label={intl.get('hpfm.ruleEngine.model.ruleEngine.tenantId').d('租户')}
                    {...formLayout}
                  >
                    {getFieldDecorator('tenantId', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hpfm.ruleEngine.model.ruleEngine.tenantId').d('租户'),
                          }),
                        },
                      ],
                      initialValue: detail.tenantId,
                    })(
                      <Lov
                        disabled={!isUndefined(detail.tenantId)}
                        code="HPFM.TENANT"
                        textValue={detail.tenantName}
                      />
                    )}
                  </Form.Item>
                </Col>
              )}
              <Col span={9}>
                <Form.Item
                  label={intl.get('hpfm.ruleEngine.model.ruleEngine.serverName').d('服务名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('serverName', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hpfm.ruleEngine.model.ruleEngine.serverName')
                            .d('服务名称'),
                        }),
                      },
                    ],
                    initialValue: detail.serverName,
                  })(
                    <Lov
                      code={
                        isTenantRoleLevel()
                          ? 'HCNF.ROUTE.SERVICE_CODE.ORG'
                          : 'HCNF.ROUTE.SERVICE_CODE'
                      }
                      textValue={detail.serverName}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={9}>
                <Form.Item
                  label={intl.get('hpfm.ruleEngine.model.ruleEngine.scriptCode').d('脚本编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('scriptCode', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hpfm.ruleEngine.model.ruleEngine.scriptCode')
                            .d('脚本编码'),
                        }),
                      },
                    ],
                    initialValue: detail.scriptCode,
                  })(
                    <Input
                      typeCase="upper"
                      trim
                      inputChinese={false}
                      disabled={!isUndefined(detail.scriptCode)}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={9}>
                <Form.Item
                  label={intl.get('hpfm.ruleEngine.model.ruleEngine.category').d('脚本分类')}
                  {...formLayout}
                >
                  {getFieldDecorator('category', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get('hpfm.ruleEngine.model.ruleEngine.category').d('脚本分类'),
                        }),
                      },
                    ],
                    initialValue: detail.category,
                  })(
                    <Select allowClear>
                      {categoryList.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={9}>
                <Form.Item
                  label={intl.get('hpfm.ruleEngine.model.ruleEngine.scriptDescription').d('描述')}
                  {...formLayout}
                >
                  {getFieldDecorator('scriptDescription', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hpfm.ruleEngine.model.ruleEngine.scriptDescription')
                            .d('描述'),
                        }),
                      },
                    ],
                    initialValue: detail.scriptDescription,
                  })(<Input />)}
                </Form.Item>
              </Col>
              <Col span={9}>
                <Form.Item
                  label={intl.get('hpfm.ruleEngine.model.ruleEngine.scriptTypeCode').d('类型')}
                  {...formLayout}
                >
                  {getFieldDecorator('scriptTypeCode', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hpfm.ruleEngine.model.ruleEngine.scriptTypeCode')
                            .d('类型'),
                        }),
                      },
                    ],
                    initialValue: detail.scriptTypeCode,
                  })(
                    <Select allowClear>
                      {scriptTypeCode &&
                        scriptTypeCode.map(item => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={9}>
                <Form.Item label={intl.get('hzero.common.status.enable').d('启用')} {...formLayout}>
                  {getFieldDecorator('enabledFlag', {
                    initialValue: isUndefined(detail.enabledFlag) ? 1 : detail.enabledFlag,
                  })(<Switch />)}
                </Form.Item>
              </Col>
              <Col span={18}>
                <Form.Item
                  label={intl.get('hpfm.ruleEngine.model.ruleEngine.scriptContent').d('脚本内容')}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                >
                  {getFieldDecorator('scriptContent', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hpfm.ruleEngine.model.ruleEngine.scriptContent')
                            .d('脚本内容'),
                        }),
                      },
                    ],
                    initialValue: detail.scriptContent,
                  })(<Input.TextArea autosize={{ minRows: 15 }} />)}
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Content>
        <Drawer {...drawerProps} />
      </Fragment>
    );
  }
}
