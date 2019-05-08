/**
 * codeRuleRule - 编码规则
 * @date: 2018-6-29
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import { withRouter } from 'dva/router';
import { Form, Input, Button, Modal, Table, Select } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';

import cacheComponent from 'components/CacheComponent';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getCurrentOrganizationId } from 'utils/utils';

/**
 * 使用 Form.Item 组件
 */
const FormItem = Form.Item;

/**
 * 使用 Select 的 Option 组件
 */
const { Option } = Select;

/**
 * 编码规则弹框编辑
 * @extends {Component} - React.Component
 * @reactProps {Object} form - 表单对象
 * @reactProps {Object} tenantStatus - 租户状态
 * @reactProps {Function} hideTenant - 隐藏租户选择框
 * @reactProps {Function} showTenant - 显示租户选择框
 * @reactProps {Object} modalVisible - 控制modal显示/隐藏属性
 * @reactProps {Function} handleAddCodeRule - 数据保存
 * @reactProps {Function} showCreateModal - 控制modal显示隐藏方法
 * @reactProps {Object} codeLevel - 编码等级
 * @reactProps {Object} organizationId - 组织编号
 * @return React.element
 */
const CreateForm = Form.create({ fieldNameProp: null })(props => {
  const {
    form,
    modalVisible,
    tenantStatus,
    onHandleAdd,
    onShowCreateModal,
    onHideTenant,
    onShowTenant,
    codeLevel,
    organizationId,
    loading,
  } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      onHandleAdd(fieldsValue, form);
    });
  };
  const handleCurrencyChange = value => {
    if (value === 'P') {
      onHideTenant();
    } else {
      onShowTenant();
    }
  };
  const onCancel = () => {
    onShowCreateModal(false);
    onHideTenant();
    form.resetFields();
  };
  const formlayout = {
    labelCol: { span: 5 },
    wrapperCol: { span: 15 },
  };
  return (
    <Modal
      title={intl.get('hpfm.codeRule.view.message.title.modal.list').d('新建编码规则')}
      visible={modalVisible}
      onOk={okHandle}
      width={600}
      destroyOnClose
      confirmLoading={loading}
      onCancel={onCancel}
    >
      <React.Fragment>
        <FormItem
          {...formlayout}
          label={intl.get('hpfm.codeRule.model.codeRule.ruleCode').d('规则代码')}
        >
          {form.getFieldDecorator('ruleCode', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.codeRule.model.codeRule.ruleCode').d('规则代码'),
                }),
              },
              {
                max: 30,
                message: intl.get('hzero.common.validation.max', {
                  max: 30,
                }),
              },
            ],
          })(<Input typeCase="upper" trim inputChinese={false} />)}
        </FormItem>
        <FormItem
          {...formlayout}
          label={intl.get('hpfm.codeRule.model.codeRule.ruleName').d('规则名称')}
        >
          {form.getFieldDecorator('ruleName', {
            rules: [
              {
                required: true,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.codeRule.model.codeRule.ruleName').d('规则名称'),
                }),
              },
              {
                max: 20,
                message: intl.get('hzero.common.validation.max', {
                  max: 20,
                }),
              },
            ],
          })(<Input />)}
        </FormItem>
        {
          <FormItem
            style={organizationId ? { display: 'none' } : { display: 'block' }}
            {...formlayout}
            label={intl.get('hpfm.codeRule.model.codeRule.meaning').d('层级')}
          >
            {form.getFieldDecorator('ruleLevel', {
              initialValue: organizationId ? 'T' : 'P',
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('hpfm.codeRule.model.codeRule.meaning').d('层级'),
                  }),
                },
              ],
            })(
              <Select style={{ width: '100%' }} onChange={handleCurrencyChange}>
                {codeLevel.map(code => {
                  return (
                    <Option key={code.value} value={code.value}>
                      {code.meaning}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
        }
        <FormItem
          style={{ display: tenantStatus.display }}
          {...formlayout}
          label={intl.get('hpfm.codeRule.model.codeRule.tenantName').d('租户')}
        >
          {form.getFieldDecorator('tenantId', {
            initialValue: organizationId,
            rules: [
              {
                required: tenantStatus.required,
                message: intl.get('hzero.common.validation.notNull', {
                  name: intl.get('hpfm.codeRule.model.codeRule.tenantName').d('租户'),
                }),
              },
            ],
          })(<Lov code="HPFM.TENANT" />)}
        </FormItem>
      </React.Fragment>
    </Modal>
  );
});

/**
 * 编码规则
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} codeRule - 数据源
 * @reactProps {Object} fetchCodeLoading - 数据加载是否完成
 * @reactProps {Object} removeCodeLoading - 数据删除加载是否完成
 * @reactProps {Object} addCodeRuleLoading - 数据添加加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({
  code: ['hpfm.codeRule'],
})
@connect(({ codeRule, loading }) => ({
  codeRule,
  currentTenantId: getCurrentOrganizationId(),
  removeCodeLoading: loading.effects['codeRule/removeCode'],
  fetchCodeLoading: loading.effects['codeRule/fetchCode'],
  addCodeRuleLoading: loading.effects['codeRule/addCodeRule'],
}))
@Form.create({ fieldNameProp: null })
@withRouter
@cacheComponent({ cacheKey: '/hpfm/code-rule/list' })
export default class codeRule extends PureComponent {
  /**
   *Creates an instance of codeRule.
   * @param {object} props 属性
   */
  constructor(props) {
    super(props);
    /**
     * 内部状态
     */
    this.state = {
      selectedRows: [],
      formValues: {},
      modalVisible: false,
      tenantStatus: {
        display: 'none',
        required: false,
      },
    };
  }

  /**
   * 新增编码规则
   * @param {object} fieldsValue 传递的filedvalue
   * @param {object} form        表单数据
   */
  @Bind()
  handleAddCodeRule(fieldsValue, form) {
    const {
      dispatch,
      codeRule: { organizationId },
    } = this.props;
    const callback = res => {
      this.setState({
        modalVisible: false,
      });
      notification.success();
      form.resetFields();
      this.showCodeRuleDist(res);
    };
    dispatch({
      type: 'codeRule/addCodeRule',
      payload: {
        ...fieldsValue,
        organizationId,
      },
    }).then(response => {
      if (response) {
        callback(response);
      }
    });
  }

  /**
   * 刷新
   */
  @Bind()
  refreshValue() {
    this.fetchData();
    this.setState({
      selectedRows: [],
    });
  }

  /**
   * 编码规则删除
   */
  @Bind()
  deleteValue() {
    const {
      dispatch,
      codeRule: { organizationId },
      removeCodeLoading,
    } = this.props;
    const { selectedRows } = this.state;
    const onOk = () => {
      dispatch({
        type: 'codeRule/removeCode',
        payload: {
          selectedRows,
          organizationId,
        },
      }).then(response => {
        if (response) {
          this.refreshValue();
          notification.success();
        }
      });
    };
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
      removeCodeLoading,
    });
  }

  /**
   * 控制modal弹出层显隐
   * @param {boolean} flag 显/隐标记
   */
  @Bind()
  showCreateModal(flag) {
    this.setState({
      modalVisible: !!flag,
    });
  }

  /**
   * 查询数据
   * @param {object} pageData 页面基本信息数据
   */
  @Bind()
  fetchData(pageData = {}) {
    const { form, dispatch } = this.props;
    const organizationId = getCurrentOrganizationId();
    form.validateFields((err, fieldsValue) => {
      if (!err) {
        this.setState({
          formValues: fieldsValue,
        });
        dispatch({
          type: 'codeRule/fetchCode',
          payload: {
            ...fieldsValue,
            organizationId,
            ...pageData,
          },
        });
      }
    });
  }

  /**
   * 查询按钮点击
   * @returns
   */
  @Bind()
  queryValue() {
    this.fetchData();
  }

  /**
   * 页面跳转到编码规则维护页面
   * @param {object} record 行数据
   */
  @Bind()
  showCodeRuleDist(record = {}) {
    const { history } = this.props;
    history.push(`/hpfm/code-rule/dist/${record.ruleId}`);
  }

  /**
   * 租户输入框隐藏
   */
  @Bind()
  hideTenant() {
    this.setState({
      tenantStatus: {
        display: 'none',
        required: false,
      },
    });
  }

  /**
   * 租户输入框显示
   */
  @Bind()
  showTenant() {
    this.setState({
      tenantStatus: {
        display: 'block',
        required: true,
      },
    });
  }

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const {
      dispatch,
      codeRule: { list = {} },
      location: { state: { _back } = {} },
    } = this.props;
    const organizationId = getCurrentOrganizationId();
    dispatch({
      type: 'codeRule/settingOrgId',
      payload: {
        organizationId,
      },
    });
    const code = 'HPFM.LEVEL';
    const page = isUndefined(_back) ? {} : list.data && list.data.pagination;
    this.fetchData({ page });
    dispatch({
      type: 'codeRule/fetchLevel',
      payload: {
        lovCode: code,
      },
    });
  }

  /**
   * 分页变化后触发方法
   * @param {object} pagination 分页信息
   */
  @Bind()
  handleStandardTableChange(pagination = {}) {
    const {
      codeRule: { organizationId },
    } = this.props;
    const { formValues } = this.state;
    const params = {
      organizationId,
      ...formValues,
      page: pagination,
    };
    this.fetchData(params);
  }

  /**
   * 重置form表单
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
  }

  /**
   *选择数据触发方法
   * @param {null} _ 占位符
   * @param {object} rows 行记录
   */
  @Bind()
  handleSelectRows(_, rows) {
    this.setState({
      selectedRows: rows,
    });
  }

  /**
   * 渲染查询结构
   * @returns
   */
  renderForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('hpfm.codeRule.model.codeRule.ruleCode').d('规则代码')}>
          {getFieldDecorator('ruleCode')(<Input typeCase="upper" trim inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get('hpfm.codeRule.model.codeRule.ruleName').d('规则名称')}>
          {getFieldDecorator('ruleName')(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.queryValue}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      codeRule: {
        organizationId,
        list: { data = {} },
        code: { LEVEL = {} },
      },
      removeCodeLoading,
      fetchCodeLoading,
      addCodeRuleLoading,
      currentTenantId,
    } = this.props;
    const { selectedRows, modalVisible, tenantStatus } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedRows.map(n => n.ruleId),
      onChange: this.handleSelectRows,
      getCheckboxProps: record => ({
        disabled: currentTenantId !== record.tenantId,
      }),
    };
    const columns = [
      {
        title: intl.get('hpfm.codeRule.model.codeRule.ruleCode').d('规则代码'),
        dataIndex: 'ruleCode',
        width: 200,
      },
      {
        title: intl.get('hpfm.codeRule.model.codeRule.ruleName').d('规则名称'),
        dataIndex: 'ruleName',
      },
      {
        title: intl.get('hpfm.codeRule.model.codeRule.meaning').d('层级'),
        align: 'center',
        dataIndex: 'meaning',
        width: 200,
      },
      {
        title: intl.get('hpfm.codeRule.model.codeRule.tenantName').d('租户'),
        dataIndex: 'tenantName',
        width: 200,
      },
      {
        title: intl.get('hpfm.codeRule.model.codeRule.description').d('规则描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        align: 'center',
        width: 80,
        render: (_, record) => (
          <Fragment>
            <a
              onClick={() => {
                this.showCodeRuleDist(record);
              }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </a>
          </Fragment>
        ),
      },
    ].filter(col => {
      return !organizationId ? true : col.dataIndex !== 'meaning' && col.dataIndex !== 'tenantName';
    });
    const parentMethods = {
      onHideTenant: this.hideTenant,
      onShowTenant: this.showTenant,
      onHandleAdd: this.handleAddCodeRule,
      onShowCreateModal: this.showCreateModal,
    };

    return (
      <React.Fragment>
        <Header title={intl.get('hpfm.codeRule.view.message.title.list').d('编码规则')}>
          <Button icon="plus" type="primary" onClick={() => this.showCreateModal(true)}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button
            icon="delete"
            loading={removeCodeLoading}
            onClick={this.deleteValue}
            disabled={selectedRows.length <= 0}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderForm()}</div>
          <Table
            loading={fetchCodeLoading}
            rowKey="ruleId"
            rowSelection={rowSelection}
            dataSource={data.content}
            columns={columns}
            pagination={data.pagination || {}}
            onChange={this.handleStandardTableChange}
            bordered
          />
          <CreateForm
            {...parentMethods}
            codeLevel={LEVEL}
            modalVisible={modalVisible}
            tenantStatus={tenantStatus}
            loading={addCodeRuleLoading}
            organizationId={organizationId}
          />
        </Content>
      </React.Fragment>
    );
  }
}
