/**
 * InterfaceMap - 流程设置/接口映射
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
 * 接口映射组件
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} interfaceMap - 数据源
 * @reactProps {!Object} loading - 数据加载是否完成
 * @reactProps {!Object} saving - 保存是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hwfl.interfaceMap', 'hwfl.common'] })
@connect(({ interfaceMap, loading }) => ({
  interfaceMap,
  loading: loading.effects['interfaceMap/fetchInterfaceList'],
  saving:
    loading.effects['interfaceMap/createInterfaceMap'] ||
    loading.effects['interfaceMap/editInterfaceMap'],
  tenantId: getCurrentOrganizationId(),
}))
export default class InterfaceMap extends Component {
  form;

  /**
   * state初始化
   */
  state = {
    formValues: {}, // 表单中的值
    tableRecord: {}, // 表格记录
    drawerVisible: false, // 侧边框是否可见
    isCreate: false, // 是否为新建
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.handleSearch();
    this.fetchScopeType();
  }

  /**
   * 获取数据范围
   * @memberof InterfaceMap
   */
  @Bind()
  fetchScopeType() {
    const { dispatch } = this.props;
    dispatch({
      type: 'interfaceMap/fetchScopeType',
    });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'interfaceMap/fetchInterfaceList',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
        tenantId,
      },
    });
  }

  /**
   *
   * 获取表格中的记录
   * @param {*} record
   * @memberof InterfaceMap
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
   *
   * @param {*} values
   * @memberof InterfaceMap
   */
  @Bind()
  handleStore(values) {
    this.setState({
      formValues: { ...values },
    });
  }

  /**
   * 关闭模态框
   *
   * @memberof InterfaceMap
   */
  @Bind()
  handleCancel() {
    this.setState({
      drawerVisible: false,
      isCreate: false,
      tableRecord: {},
    });
  }

  /**
   * 打开新增模态框
   *
   * @memberof InterfaceMap
   */
  @Bind()
  showModal() {
    this.setState({
      drawerVisible: true,
      isCreate: true,
    });
  }

  /**
   * 打开编辑模态框
   *
   * @memberof InterfaceMap
   */
  @Bind()
  showEditModal() {
    this.setState({
      drawerVisible: true,
      isCreate: false,
    });
  }

  /**
   * 新建接口映射
   *
   * @param {*} values
   * @memberof InterfaceMap
   */
  @Bind()
  handleAdd(values) {
    const {
      dispatch,
      tenantId,
      interfaceMap: { pagination },
    } = this.props;
    dispatch({
      type: 'interfaceMap/createInterfaceMap',
      payload: { ...values, tenantId },
    }).then(response => {
      if (response) {
        this.handleCancel();
        this.handleSearch(pagination);
        notification.success();
      }
    });
  }

  /**
   * 编辑接口映射
   *
   * @param {*} values
   * @memberof InterfaceMap
   */
  @Bind()
  handleEdit(values) {
    const {
      dispatch,
      tenantId,
      interfaceMap: { pagination },
    } = this.props;
    dispatch({
      type: 'interfaceMap/editInterfaceMap',
      payload: { ...values, tenantId },
    }).then(response => {
      if (response) {
        this.handleCancel();
        this.handleSearch(pagination);
        notification.success();
      }
    });
  }

  /**
   * 删除接口映射
   *
   * @param {*} values
   * @memberof InterfaceMap
   */
  @Bind()
  handleDelete(values) {
    const {
      dispatch,
      tenantId,
      interfaceMap: { pagination },
    } = this.props;
    dispatch({
      type: 'interfaceMap/deleteInterfaceMap',
      payload: { ...values, tenantId },
    }).then(response => {
      if (response) {
        this.handleSearch(pagination);
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
      type: 'interfaceMap/checkUnique',
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
      interfaceMap: { scopeList = [], interfaceMapData = {}, pagination },
    } = this.props;
    const { formValues = {}, tableRecord = {}, isCreate, drawerVisible } = this.state;
    const filterProps = {
      onSearch: this.handleSearch,
      onStore: this.handleStore,
      onRef: this.handleBindRef,
    };
    const listProps = {
      interfaceMapData,
      formValues,
      loading,
      scopeList,
      pagination,
      onChange: this.handleSearch,
      onGetRecord: this.getRecordData,
      onDelete: this.handleDelete,
    };
    const drawerProps = {
      tableRecord,
      drawerVisible,
      saving,
      isCreate,
      scopeList,
      anchor: 'right',
      onCancel: this.handleCancel,
      onAdd: this.handleAdd,
      onEdit: this.handleEdit,
      onCheck: this.checkUnique,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hwfl.interfaceMap.view.message.title').d('接口映射管理')}>
          <Button icon="plus" type="primary" onClick={this.showModal}>
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
