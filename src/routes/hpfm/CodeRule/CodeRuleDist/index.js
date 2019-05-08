/**
 * CodeRuleDist - 编码规则分发层
 * @date: 2018-6-29
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Button, Form, Table, Col, Row, Input, Modal, Select } from 'hzero-ui';
import { Debounce, Bind } from 'lodash-decorators';
import { connect } from 'dva';

import Lov from 'components/Lov';
import Switch from 'components/Switch';
import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender, yesOrNoRender } from 'utils/renderer';
import { createPagination, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';

import CodeRuleDetail from './CodeRuleDetail';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;
/**
 * 使用 Select 的 Option 组件
 */
const { Option } = Select;

/**
 * 编码规则编辑弹框
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} codes - 编码
 * @reactProps {Object} editRecordData - 当前编辑行数据
 * @reactProps {Object} editModalVisible - 控制modal显示/隐藏属性
 * @reactProps {Function} handleSave - 数据保存
 * @reactProps {Function} handleEditModal - 控制modal显示隐藏方法
 * @reactProps {Function} showCompany - 展示公司输入框
 * @reactProps {Object} company - 公司显隐标记
 * @reactProps {Object} tenantId - 租户编号
 * @return React.element
 */
const EditModal = Form.create({ fieldNameProp: null })(props => {
  const {
    editModalVisible,
    codes,
    form,
    editRecordData,
    onHandleSaveCodeDist,
    onHandleEditModal,
    onShowCompany,
    company,
    tenantId,
    loading,
    isCurrentTenant,
  } = props;
  // 当前租户是否和数据中的租户对应
  const { UNITTYPE } = codes;
  const { levelCode, levelValue, description, enabledFlag } = editRecordData;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onHandleSaveCodeDist(fieldsValue);
    });
  };
  const cancelHandle = () => {
    onHandleEditModal(false);
    form.resetFields();
  };

  const formLayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 15 },
  };

  return (
    <Modal
      visible={editModalVisible}
      confirmLoading={loading}
      width={500}
      onCancel={() => cancelHandle()}
      footer={
        isCurrentTenant
          ? null
          : [
              <Button key="cancel" onClick={() => cancelHandle()}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>,
              <Button key="on" type="primary" onClick={okHandle}>
                {intl.get('hzero.common.button.ok').d('确定')}
              </Button>,
            ]
      }
    >
      <React.Fragment>
        <Form>
          <Row gutter={24}>
            <Col span={24}>
              <FormItem
                {...formLayout}
                label={intl.get('hpfm.codeRule.model.codeRule.meaning').d('层级')}
              >
                {form.getFieldDecorator('levelCode', {
                  initialValue: levelCode,
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl.get('hpfm.codeRule.model.codeRule.meaning').d('层级'),
                      }),
                    },
                  ],
                })(
                  <Select
                    onChange={value => {
                      onShowCompany(value);
                    }}
                    disabled={!!levelCode}
                  >
                    {UNITTYPE.map(c => {
                      return (
                        c.value !== 'GLOBAL' && (
                          <Option key={c.value} value={c.value}>
                            {c.meaning}
                          </Option>
                        )
                      );
                    })}
                  </Select>
                )}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            {(company || levelCode === 'COM') && (
              <Col span={24}>
                <FormItem
                  {...formLayout}
                  label={intl.get('hpfm.codeRule.model.codeRule.levelValueDescription').d('值')}
                >
                  {form.getFieldDecorator('levelValue', {
                    initialValue: levelValue,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('hpfm.codeRule.model.codeRule.levelValueDescription')
                            .d('值'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      disabled={isCurrentTenant}
                      queryParams={{ tenantId, lovCode: 'HPFM.COMPANY' }}
                      code="HPFM.CODE_RULE.COMPANY"
                      textValue={levelValue}
                    />
                  )}
                </FormItem>
              </Col>
            )}
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <FormItem
                {...formLayout}
                label={intl.get('hpfm.codeRule.model.codeRule.description.dist').d('描述')}
              >
                {form.getFieldDecorator('description', {
                  initialValue: description,
                  rules: [
                    {
                      max: 80,
                      message: intl.get('hzero.common.validation.max', {
                        max: 80,
                      }),
                    },
                  ],
                })(<Input disabled={isCurrentTenant} />)}
              </FormItem>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <FormItem {...formLayout} label={intl.get('hzero.common.status.enable').d('启用')}>
                {form.getFieldDecorator('enabledFlag', {
                  initialValue: enabledFlag === undefined ? 1 : enabledFlag,
                })(<Switch disabled={isCurrentTenant} />)}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    </Modal>
  );
});

/**
 * 编码规则维护
 * @extends {Component} - React.Component
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} codeRule - 数据源
 * @reactProps {Object} fetchDistLoading - 数据加载是否完成
 * @reactProps {Object} addCodeRuleLoading - 数据添加加载是否完成
 * @reactProps {Object} fetchDetailLoading - 数据详情加载是否完成
 * @reactProps {Object} addDistLoading - 数据规则加载是否完成
 * @reactProps {Object} deleteLoading - 数据删除加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ codeRule, loading }) => ({
  codeRule,
  currentTenantId: getCurrentOrganizationId(),
  fetchDistLoading: loading.effects['codeRule/fetchDist'],
  addCodeRuleLoading: loading.effects['codeRule/addCodeRule'],
  fetchDetailLoading: loading.effects['codeRule/fetchDetail'],
  addDistLoading: loading.effects['codeRule/addDist'],
  deleteLoading: loading.effects['codeRule/removeDist'],
}))
@formatterCollections({
  code: ['hpfm.codeRule'],
})
@Form.create({ fieldNameProp: null })
export default class CodeRuleDist extends PureComponent {
  /**
   *内部状态
   */
  state = {
    selectedRows: [],
    modalVisible: false,
    editRecordData: {},
    editModalVisible: false,
    company: false,
  };

  /**
   *组件挂载后触发方法
   *
   */
  componentDidMount() {
    const {
      dispatch,
      match,
      codeRule: { organizationId },
    } = this.props;
    const unitTypeCode = 'HPFM.CODE_RULE.LEVEL_CODE';
    const variableCode = 'HPFM.CODE_RULE.VARIABLE';
    const data = {
      ruleId: match.params.id,
      organizationId,
    };
    dispatch({
      type: 'codeRule/fetchDist',
      payload: data,
    });
    dispatch({
      type: 'codeRule/fetchUnitType',
      payload: {
        lovCode: unitTypeCode,
      },
    });
    dispatch({
      type: 'codeRule/fetchVariable',
      payload: {
        lovCode: variableCode,
      },
    });
  }

  /**
   * 生成表格头字段
   * @returns
   */
  @Bind()
  handlecolumns() {
    return [
      {
        title: intl.get('hpfm.codeRule.model.codeRule.levelCodeDescription').d('层级'),
        dataIndex: 'levelCodeDescription',
        editable: true,
        required: true,
        align: 'center',
        width: 100,
      },
      {
        title: intl.get('hpfm.codeRule.model.codeRule.levelValueDescription').d('值'),
        dataIndex: 'levelValueDescription',
        editable: true,
        required: true,
        width: 200,
      },
      {
        title: intl.get('hpfm.codeRule.model.codeRule.description.dist').d('描述'),
        editable: true,
        dataIndex: 'description',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        type: 'checkbox',
        editable: true,
        align: 'center',
        render: enableRender,
        width: 80,
      },
      {
        title: intl.get('hpfm.codeRule.model.codeRule.usedFlag').d('是否已经使用'),
        dataIndex: 'usedFlag',
        type: 'checkbox',
        align: 'center',
        render: yesOrNoRender,
        width: 100,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 200,
        align: 'center',
        render: (_, record) => {
          return (
            <span className="action-link">
              <a
                onClick={() => {
                  this.handleEditModal(true, record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <a
                onClick={() => {
                  this.handleEditDetail(true, record);
                }}
              >
                {intl.get('hpfm.codeRule.view.option.change').d('修改编码段')}
              </a>
            </span>
          );
        },
      },
    ];
  }

  /**
   *显示/隐藏公司选择框
   *
   * @param {Object} value 判断数据
   */
  @Bind()
  showCompany(value = {}) {
    const state = {
      company: false,
    };
    if (value === 'COM') {
      state.company = true;
    }
    this.setState(state);
  }

  /**
   * 保存编码规则
   * @param {Object} fieldsValue 表单数据
   */
  @Bind()
  handleSaveCodeDist(fieldsValue = {}) {
    const {
      dispatch,
      codeRule: { keyValue, organizationId },
      form,
    } = this.props;
    const { editRecordData } = this.state;
    dispatch({
      type: 'codeRule/addDist',
      payload: {
        ...editRecordData,
        ...fieldsValue,
        ...keyValue,
        organizationId,
      },
    }).then(response => {
      if (response) {
        notification.success();
        this.handleEditModal(false);
        this.refreshLine();
        form.resetFields();
      }
    });
  }

  /**
   * 删除数据
   */
  @Bind()
  handleCodeRuleDist() {
    const {
      dispatch,
      codeRule: { organizationId },
      deleteLoading,
    } = this.props;
    const { selectedRows = {} } = this.state;
    const onOk = () => {
      dispatch({
        type: 'codeRule/removeDist',
        payload: {
          selectedRows,
          organizationId,
        },
      }).then(response => {
        if (response) {
          notification.success();
          this.refreshLine();
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
      deleteLoading,
    });
  }

  /**
   * 控制编辑弹出层显示隐藏
   * @param {boolean} flag 显示/隐藏标记
   * @param {object} record 行数据
   * @param {object} form 表单
   */
  @Bind()
  handleEditModal(flag, record, form) {
    const state = {
      editModalVisible: flag,
      editRecordData: record || {},
      company: false,
    };
    if (form) {
      form.resetFields();
    }
    this.setState(state);
  }

  /**
   * 控制编码段详情modal弹出框显示隐藏
   * @param {boolean} flag 显/隐标记
   * @param {object} record 行数据
   */
  @Bind()
  handleEditDetail(flag, record) {
    const {
      dispatch,
      codeRule: { organizationId },
    } = this.props;
    this.setState({
      modalVisible: !!flag,
      editRecordData: record || {},
    });
    if (record && record.ruleDistId) {
      const data = {
        ruleDistId: record.ruleDistId,
        organizationId,
      };
      dispatch({
        type: 'codeRule/fetchDetail',
        payload: data,
      });
    }
    if (!flag) {
      this.refreshLine();
    }
  }

  /**
   * 表格选中事件
   * @param {null} _ 占位符
   * @param {object} rows
   */
  @Bind()
  onSelectChange(_, rows) {
    this.setState({
      selectedRows: rows,
    });
  }

  /**
   * 刷新数据
   */
  @Bind()
  refreshLine() {
    const {
      dispatch,
      codeRule: {
        organizationId,
        dist: { head = {}, line = {} },
      },
    } = this.props;
    const { ruleId } = head;
    const { pagination = {} } = line;
    if (ruleId) {
      dispatch({
        type: 'codeRule/fetchDist',
        payload: {
          ruleId,
          organizationId,
          page: pagination,
        },
      });
    }
    this.setState({
      selectedRows: [],
    });
  }

  /**
   * 保存头数据
   */
  @Debounce(500)
  saveCodeRuleHead() {
    const {
      dispatch,
      form,
      codeRule: {
        organizationId,
        dist: { head = {} },
      },
    } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        dispatch({
          type: 'codeRule/addCodeRule',
          payload: {
            ...head,
            ...fieldsValue,
            organizationId,
          },
        }).then(response => {
          if (response) {
            this.refreshLine();
            notification.success();
          }
        });
      }
    });
  }

  /**
   * 分页点击事件
   * @param {object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    const {
      dispatch,
      codeRule: { organizationId, keyValue },
    } = this.props;
    const { formValues } = this.state;
    const params = {
      page: pagination,
      formValues,
      organizationId,
      ruleId: keyValue.ruleId,
    };
    dispatch({
      type: 'codeRule/fetchDist',
      payload: params,
    });
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      codeRule: {
        organizationId,
        dist: { head = {}, line = {} },
        code,
      },
      match,
      history,
      fetchDistLoading,
      addCodeRuleLoading,
      fetchDetailLoading,
      addDistLoading,
      deleteLoading,
      currentTenantId,
    } = this.props;
    const { selectedRows, modalVisible, editRecordData, editModalVisible, company } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { ruleCode, ruleName, tenantName, description, meaning, level, tenantId } = head;
    const basePath = match.path.substring(0, match.path.indexOf('/dist'));
    // 当前租户是否和数据中的租户对应
    const isCurrentTenant = tenantId !== undefined ? tenantId !== currentTenantId : false;
    const dataSource = line.list;
    const columns = this.handlecolumns();
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.ruleDistId),
      onChange: this.onSelectChange,
      getCheckboxProps: record => ({
        disabled: isCurrentTenant || record.levelValue === 'GLOBAL' || record.enabledFlag === 1,
      }),
    };
    const parentMethods = {
      handleEditDetail: this.handleEditDetail,
    };
    const editModalMethods = {
      onHandleEditModal: this.handleEditModal,
      onHandleSaveCodeDist: this.handleSaveCodeDist,
      onShowCompany: this.showCompany,
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get('hpfm.codeRule.view.message.title.dist').d('规则明细')}
          backPath={`${basePath}/list`}
        >
          {isCurrentTenant ? null : (
            <React.Fragment>
              <Button
                type="primary"
                loading={addCodeRuleLoading}
                onClick={this.saveCodeRuleHead.bind(this)}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button
                style={{ marginLeft: '10px' }}
                onClick={() => {
                  history.push(`${basePath}/list`);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </Button>
            </React.Fragment>
          )}
        </Header>
        <Content>
          <Form layout="vertical">
            <Row gutter={24}>
              <Col span={4}>
                <FormItem label={intl.get('hpfm.codeRule.model.codeRule.ruleCode').d('规则代码')}>
                  {getFieldDecorator('ruleCode', {
                    initialValue: ruleCode,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
              <Col span={4}>
                <FormItem label={intl.get('hpfm.codeRule.model.codeRule.ruleName').d('规则名称')}>
                  {getFieldDecorator('ruleName', {
                    initialValue: ruleName,
                  })(<Input disabled />)}
                </FormItem>
              </Col>
            </Row>
            {!organizationId && (
              <Row gutter={24}>
                <Col span={4}>
                  <FormItem label={intl.get('hpfm.codeRule.model.codeRule.tenantName').d('租户')}>
                    {getFieldDecorator('tenantName', {
                      initialValue: tenantName,
                      details: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hpfm.codeRule.model.codeRule.tenantName').d('租户'),
                          }),
                        },
                      ],
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
                <Col span={4}>
                  <FormItem label={intl.get('hpfm.codeRule.model.codeRule.meaning').d('层级')}>
                    {getFieldDecorator('meaning', {
                      initialValue: meaning,
                      details: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl.get('hpfm.codeRule.model.codeRule.meaning').d('层级'),
                          }),
                        },
                      ],
                    })(<Input disabled />)}
                  </FormItem>
                </Col>
              </Row>
            )}
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get('hpfm.codeRule.model.codeRule.description').d('规则描述')}
                >
                  {getFieldDecorator('description', {
                    initialValue: description,
                    rules: [
                      {
                        max: 80,
                        message: intl.get('hzero.common.validation.max', {
                          max: 80,
                        }),
                      },
                    ],
                  })(<Input disabled={isCurrentTenant} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
          {isCurrentTenant ? null : (
            <div className="table-list-operator">
              {level !== 'P' && (
                <Button icon="plus" onClick={() => this.handleEditModal(true)}>
                  {intl.get('hpfm.codeRule.view.detail.button.create').d('新增层级')}
                </Button>
              )}
              {level !== 'P' && (
                <Button
                  icon="minus"
                  onClick={this.handleCodeRuleDist}
                  disabled={selectedRows.length <= 0}
                >
                  {intl.get('hpfm.codeRule.view.detail.button.delete').d('删除层级')}
                </Button>
              )}
            </div>
          )}
          <Table
            loading={fetchDistLoading}
            rowKey="ruleDistId"
            dataSource={dataSource}
            columns={columns}
            pagination={createPagination(line)}
            rowSelection={rowSelection}
            onChange={this.handleStandardTableChange}
            bordered
          />
          <EditModal
            {...editModalMethods}
            editModalVisible={editModalVisible}
            editRecordData={editRecordData}
            codes={code}
            company={company}
            tenantId={tenantId}
            isCurrentTenant={isCurrentTenant}
            loading={addDistLoading}
          />
          <CodeRuleDetail
            {...parentMethods}
            visible={modalVisible}
            isCurrentTenant={isCurrentTenant}
            fetchLoading={fetchDetailLoading}
            deleteLoading={deleteLoading}
            editRecordData={editRecordData}
          />
        </Content>
      </React.Fragment>
    );
  }
}
