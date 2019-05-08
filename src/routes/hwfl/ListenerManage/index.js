/**
 * listenerManage - 流程设置/监听器管理
 * @date: 2018-12-20
 * @author: LZY <zhuyan.luo@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';

import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import FilterForm from './FilterForm';
import ListTable from './ListTable';
import Drawer from './Drawer';

/**
 * 监听器组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} listenerManage - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hwfl.listenerManage', 'hwfl.common'] })
@Form.create({ fieldNameProp: null })
@connect(({ listenerManage, loading }) => ({
  listenerManage,
  loading: loading.effects['listenerManage/fetchListenerList'],
  saving:
    loading.effects['listenerManage/createListener'] ||
    loading.effects['listenerManage/editListener'],
  tenantId: getCurrentOrganizationId(),
}))
export default class ListenerManage extends Component {
  /**
   * state初始化
   */
  state = {
    formValues: {},
    tableRecord: {},
    visible: false,
    isCreate: true,
    isChangeServiceTask: false,
    eventList: [],
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.fetchTableList();
    this.fetchTransactionState();
    this.fetchCategory();
    this.fetchParameterType();
    this.props.dispatch({
      type: 'listenerManage/fetchListenerType',
    });

    this.props.dispatch({
      type: 'listenerManage/queryOptions',
      payload: {
        categoryNullFlag: 1,
        parameterType: 'variable',
        tenantId: this.props.tenantId,
      },
    });
  }

  /**
   * 获取监听事件
   * @memberof TaskMonitor
   */
  @Bind()
  handleSearchEvent(value) {
    const { dispatch } = this.props;
    if (value === 'execution') {
      dispatch({
        type: 'listenerManage/queryExecutionEvent',
      }).then(res => {
        if (res) {
          this.setState({ eventList: res });
        }
      });
    } else {
      dispatch({
        type: 'listenerManage/queryTaskEvent',
      }).then(res => {
        if (res) {
          this.setState({ eventList: res });
        }
      });
    }
  }

  /**
   * 获取事务状态
   * @memberof TaskMonitor
   */
  @Bind()
  fetchTransactionState() {
    const { dispatch } = this.props;
    dispatch({
      type: 'listenerManage/queryTransactionState',
      payload: {},
    });
  }

  /**
   * 获取流程分类
   * @memberof TaskMonitor
   */
  @Bind()
  fetchCategory() {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'listenerManage/queryCategory',
      payload: { tenantId },
    });
  }

  /**
   * 获取参数类型值集
   * @memberof TaskMonitor
   */
  @Bind()
  fetchParameterType() {
    const { dispatch } = this.props;
    dispatch({
      type: 'listenerManage/queryParameterType',
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
      type: 'listenerManage/fetchListenerList',
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
   * @memberof TaskMonitor
   */
  @Bind()
  getRecordData(record) {
    const { dispatch, tenantId } = this.props;
    this.setState(
      {
        tableRecord: { ...record },
      },
      () => {
        this.handleSearchEvent(record.type);
      }
    );
    this.showEditModal();
    dispatch({
      type: 'listenerManage/queryServiceTask',
      payload: {
        category: record.category,
        categoryNullFlag: 1,
        scope: 1,
        type: 'ServiceTask',
        tenantId,
      },
    });
    dispatch({
      type: 'listenerManage/queryOptions',
      payload: {
        category: record.category,
        categoryNullFlag: 1,
        parameterType: 'variable',
        scope: 1,
        tenantId,
      },
    });
    dispatch({
      type: 'listenerManage/updateState',
      payload: { parameter: JSON.parse(record.serviceParams || '[]') },
    });
  }

  /**
   * 保存表单中的值
   * @param {*} values
   * @memberof TaskMonitor
   */
  @Bind()
  storeFormValues(values) {
    this.setState({
      formValues: { ...values },
    });
  }

  /**
   * 关闭模态框
   * @memberof TaskMonitor
   */
  @Bind()
  handleCancel() {
    const { dispatch } = this.props;
    this.setState({
      visible: false,
      isCreate: true,
      tableRecord: {},
      isChangeServiceTask: false,
    });
    dispatch({
      type: 'listenerManage/updateState',
      payload: { parameter: [] },
    });
  }

  /**
   * 打开新增模态框
   * @memberof TaskMonitor
   */
  @Bind()
  showModal() {
    const { isCreate } = this.state;
    if (isCreate) {
      this.setState({
        isCreate: true,
      });
    }
    this.setState({
      visible: true,
    });
  }

  /**
   * 打开编辑模态框
   * @memberof TaskMonitor
   */
  @Bind()
  showEditModal() {
    const { isCreate } = this.state;
    if (isCreate) {
      this.setState({
        isCreate: false,
      });
    }
    this.setState({
      visible: true,
    });
  }

  /**
   * 新建监听器
   * @param {*} values
   * @memberof TaskMonitor
   */
  @Bind()
  handleAdd(values) {
    const {
      dispatch,
      tenantId,
      listenerManage: { pagination },
    } = this.props;
    dispatch({
      type: 'listenerManage/createListener',
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
   * 编辑监听器
   * @param {*} values
   * @memberof TaskMonitor
   */
  @Bind()
  handleEdit(values) {
    const {
      dispatch,
      tenantId,
      listenerManage: { pagination },
    } = this.props;
    dispatch({
      type: 'listenerManage/editListener',
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
   * 删除监听器
   * @param {*} values
   * @memberof TaskMonitor
   */
  @Bind()
  handleDelete(record) {
    const {
      dispatch,
      tenantId,
      listenerManage: { pagination },
    } = this.props;
    dispatch({
      type: 'listenerManage/deleteListener',
      payload: { listenerId: record.listenerId, tenantId, record },
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
      type: 'listenerManage/checkUnique',
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
   * 流程分类改变,获取服务任务，流程变量选项
   * @param {*} value
   * @memberof TaskMonitor
   */
  @Bind()
  changeCategoryValue(value) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'listenerManage/queryServiceTask',
      payload: { category: value, categoryNullFlag: 1, scope: 1, type: 'ServiceTask', tenantId },
    });
    dispatch({
      type: 'listenerManage/queryOptions',
      payload: {
        category: value,
        categoryNullFlag: 1,
        parameterType: 'variable',
        scope: 1,
        tenantId,
      },
    });
    dispatch({
      type: 'listenerManage/updateState',
      payload: { parameter: [] },
    });
  }

  /**
   * 服务任务改变，获取动态参数
   * @param {*} value
   * @memberof TaskMonitor
   */
  @Bind()
  changeServiceTaskValue(value) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'listenerManage/queryParameter',
      payload: { code: value, tenantId },
    });
    this.setState({
      isChangeServiceTask: true,
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
      listenerManage: {
        listenerList = [],
        TransactionState = [],
        category = [],
        serviceTask = [],
        parameter = [],
        variableOptions = [],
        parameterType = [],
        listenerTypeList = [],
        pagination = {},
      },
    } = this.props;
    const {
      formValues = {},
      tableRecord = {},
      isCreate,
      visible,
      isChangeServiceTask,
      eventList = [],
    } = this.state;
    const filterProps = {
      category,
      listenerTypeList,
      onSearch: this.fetchTableList,
      onStore: this.storeFormValues,
      onRef: this.handleBindRef,
    };
    const listProps = {
      listenerList,
      formValues,
      loading,
      category,
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
      eventList,
      TransactionState,
      serviceTask,
      variableOptions,
      parameter,
      parameterType,
      listenerTypeList,
      isChangeServiceTask,
      category,
      tenantId,
      anchor: 'right',
      onCheck: this.checkUnique,
      onChangeCategory: this.changeCategoryValue,
      onChangeServiceTask: this.changeServiceTaskValue,
      onCancel: this.handleCancel,
      onAdd: this.handleAdd,
      onEdit: this.handleEdit,
      onSearchEvent: this.handleSearchEvent,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.listenerManage.view.message.title').d('监听器管理')}>
          <Button
            icon="plus"
            type="primary"
            onClick={() => {
              this.showModal();
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
