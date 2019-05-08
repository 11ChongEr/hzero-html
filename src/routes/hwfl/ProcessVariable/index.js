/**
 * ProcessVariable - 流程设置/流程变量
 * @date: 2018-8-15
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';

import { Header, Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';
import Drawer from './Drawer';

/**
 * 流程变量组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} processVariable - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hwfl.processVariable', 'hwfl.common'] })
@connect(({ processVariable, loading }) => ({
  processVariable,
  loading: loading.effects['processVariable/fetchVariableList'],
  saving: loading.effects['processVariable/creatOne'] || loading.effects['processVariable/editOne'],
  tenantId: getCurrentOrganizationId(),
}))
export default class ProcessVariable extends Component {
  form;

  /**
   * state初始化
   */
  state = {
    formValues: {},
    tableRecord: {},
    visible: false,
    isCreate: false,
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.fetchTableList();
    this.fetchTypeList();
    this.fetchCategories();
    this.fetchScopeType();
  }

  /**
   * 获取数据范围
   * @memberof ProcessVariable
   */
  @Bind()
  fetchScopeType() {
    const { dispatch } = this.props;
    dispatch({
      type: 'processVariable/fetchScopeType',
    });
  }

  /**
   * 获取流程分类
   * @memberof ProcessVariable
   */
  @Bind()
  fetchCategories() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'processVariable/queryCategories',
      payload: tenantId,
    });
  }

  /**
   * 获取类型
   * @memberof ProcessVariable
   */
  @Bind()
  fetchTypeList() {
    const { dispatch } = this.props;
    dispatch({
      type: 'processVariable/queryTypeList',
      payload: {},
    });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  fetchTableList(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'processVariable/fetchVariableList',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
        tenantId,
      },
    });
  }

  /**
   * 获取表格中的记录
   * @param {*} record
   * @memberof ProcessVariable
   */
  @Bind()
  getRecordData(record) {
    this.setState({
      tableRecord: { ...record },
    });
    this.showEditModal();
  }

  /**
   * 保存表单中的值
   * @param {*} values
   * @memberof ProcessVariable
   */
  @Bind()
  storeFormValues(values) {
    this.setState({
      formValues: { ...values },
    });
  }

  /**
   * 关闭模态框
   * @memberof ProcessVariable
   */
  @Bind()
  handleCancel() {
    this.setState({
      visible: false,
      isCreate: false,
      tableRecord: {},
    });
  }

  /**
   * 打开新增模态框
   * @memberof ProcessVariable
   */
  @Bind()
  showModal() {
    this.setState({
      visible: true,
      isCreate: true,
    });
  }

  /**
   * 打开编辑模态框
   * @memberof ProcessVariable
   */
  @Bind()
  showEditModal() {
    this.setState({
      visible: true,
      isCreate: false,
    });
  }

  /**
   * 新建流程变量
   * @param {*} values
   * @memberof ProcessVariable
   */
  @Bind()
  handleAdd(values) {
    const {
      dispatch,
      tenantId,
      processVariable: { pagination },
    } = this.props;
    dispatch({
      type: 'processVariable/creatOne',
      payload: { ...values, tenantId },
    }).then(response => {
      if (response) {
        this.handleCancel();
        this.fetchTableList(pagination);
        notification.success();
      }
    });
  }

  /**
   * 编辑流程变量
   * @param {*} values
   * @memberof ProcessVariable
   */
  @Bind()
  handleEdit(values) {
    const {
      dispatch,
      tenantId,
      processVariable: { pagination },
    } = this.props;
    dispatch({
      type: 'processVariable/editOne',
      payload: { ...values, tenantId },
    }).then(response => {
      if (response) {
        this.handleCancel();
        this.fetchTableList(pagination);
        notification.success();
      }
    });
  }

  /**
   * 删除流程变量
   * @param {*} values
   * @memberof ProcessVariable
   */
  @Bind()
  handleDelete(values) {
    const {
      dispatch,
      tenantId,
      processVariable: { pagination },
    } = this.props;
    dispatch({
      type: 'processVariable/deleteOne',
      payload: { ...values, tenantId },
    }).then(response => {
      if (response) {
        this.fetchTableList(pagination);
        notification.success();
      }
    });
  }

  /**
   * 条件编码唯一性校验
   * @param {!object} rule - 规则
   * @param {!string} value - 表单值
   * @param {!Function} callback
   */
  @Bind()
  checkUnique(rule, value, callback, codeValue) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'processVariable/checkUnique',
      payload: {
        tenantId,
        code: value,
      },
    }).then(res => {
      if (res && res.failed && codeValue) {
        callback(
          intl.get('hwfl.common.view.validation.code.exist').d('编码已存在，请输入其他编码')
        );
      }
      callback();
    });
  }

  /**
   * 设置Form
   * @param {object} ref - FilterForm组件引用
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      saving,
      tenantId,
      processVariable: {
        variableList = {},
        typeList = [],
        category = [],
        scopeType = [],
        pagination = {},
      },
    } = this.props;
    const { formValues = {}, tableRecord = {}, isCreate, visible } = this.state;
    const filterProps = {
      tenantId,
      typeList,
      category,
      onSearch: this.fetchTableList,
      onStore: this.storeFormValues,
      onRef: this.handleBindRef,
    };
    const listProps = {
      variableList,
      formValues,
      loading,
      category,
      scopeType,
      typeList,
      pagination,
      onChange: this.fetchTableList,
      onGetRecord: this.getRecordData,
      onDelete: this.handleDelete,
    };
    const drawerProps = {
      tableRecord,
      visible,
      saving,
      isCreate,
      tenantId,
      typeList,
      scopeType,
      category,
      anchor: 'right',
      onCancel: this.handleCancel,
      onAdd: this.handleAdd,
      onEdit: this.handleEdit,
      onCheck: this.checkUnique,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.processVariable.view.message.title').d('流程变量管理')}>
          <Button
            icon="plus"
            type="primary"
            onClick={() => {
              this.showModal({});
            }}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
          <Drawer {...drawerProps} />
        </Content>
      </React.Fragment>
    );
  }
}
