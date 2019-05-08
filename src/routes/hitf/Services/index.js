/*
 * index - 服务注册
 * @date: 2018/10/26 16:18:29
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Button, Modal, Input } from 'hzero-ui';
import { connect } from 'dva';
// import { routerRedux } from 'dva/router';
import { isEmpty, isUndefined } from 'lodash';
import { Header, Content } from 'components/Page';
import {
  getCurrentOrganizationId,
  getCurrentUser,
  filterNullValueObject,
  isTenantRoleLevel,
} from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import Search from './Search';
import List from './List';
import ServiceEditor from './Editor';
import styles from './index.less';

const { TextArea } = Input;

const viewMessagePrompt = 'hitf.services.view.message';

/**
 * 服务注册
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} services - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ loading, services }) => ({
  fetchingList: loading.effects['services/queryList'],
  importLoading: loading.effects['services/importService'],
  deletingService: loading.effects['services/delete'],
  fetchingInterface: loading.effects['services/queryInterface'],
  fetchingInterfaceDetail: loading.effects['services/queryInterfaceDetail'],
  creating: loading.effects['services/create'],
  editing: loading.effects['services/edit'],
  services,
  currentTenantId: getCurrentOrganizationId(),
  tenantRoleLevel: isTenantRoleLevel(),
}))
@formatterCollections({ code: ['hitf.services'] })
export default class Services extends PureComponent {
  constructor(props) {
    super(props);
    this.fetchList = this.fetchList.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'services/queryIdpValue',
    });
    this.fetchList();
  }

  state = {
    editorVisible: false,
    editingRow: {},
    currentProcessedRow: null,
    importModalVisible: false,
    wsdl: null,
  };

  /**
   * fetchList - 获取列表数据
   * @param {Object} payload - 查询参数
   */
  fetchList(params = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    dispatch({
      type: 'services/queryList',
      payload: {
        page: params,
        ...filterValues,
      },
    });
  }

  /**
   * 查询接口详情
   * @param {Object} params
   */
  fetchInterfaceDetail(params) {
    const { dispatch } = this.props;
    return dispatch({ type: 'services/queryInterfaceDetail', payload: { ...params } });
  }

  /**
   * 创建服务
   * @param {Object} params
   * @param {Function} [cb=e => e]
   */
  create(params, cb = e => e) {
    const {
      dispatch,
      services: { list },
    } = this.props;
    const { pagination } = list;
    dispatch({ type: 'services/create', params }).then(res => {
      if (res) {
        this.fetchList(pagination);
        notification.success();
        cb();
      }
    });
  }

  /**
   * 修改服务
   * @param {Object} params
   * @param {Function} [cb=e => e]
   */
  edit(params, cb = e => e) {
    const {
      dispatch,
      services: { list },
    } = this.props;
    const { pagination } = list;
    dispatch({ type: 'services/edit', params }).then(res => {
      if (res) {
        this.fetchList(pagination);
        notification.success();
        cb();
      }
    });
  }

  /**
   * 删除服务
   * @param {Object} params
   * @param {Function} [cb=e => e]
   */
  deleteRow(record, cb = e => e) {
    const { dispatch = e => e } = this.props;
    this.setState({
      currentProcessedRow: record.interfaceServerId,
    });
    dispatch({ type: 'services/deleteHeader', payload: { deleteRecord: record } }).then(res => {
      this.setState({
        currentProcessedRow: null,
      });
      if (!isEmpty(res)) {
        notification.error({ description: res.message });
      } else {
        this.fetchList();
        notification.success();
        cb();
      }
    });
  }

  /**
   * 打开编辑模态框
   * @param {Object} [editingRow={}]
   */
  openEditor(editingRow = {}) {
    this.setState({
      editorVisible: true,
      editingRow,
    });
  }

  /**
   * 关闭编辑模态框
   */
  closeEditor() {
    this.setState({
      editorVisible: false,
      editingRow: {},
    });
  }

  /**
   * 删除行
   * @param {Array} interfaceIds
   */
  handleDeleteLines(interfaceIds) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'services/deleteLines',
      interfaceIds,
    });
  }

  /**
   * 导入服务模态框打开
   */
  importService() {
    this.setState({ importModalVisible: true, wsdl: null });
  }

  /**
   * 关闭导入服务模态框
   */
  handleCancel() {
    this.setState({ importModalVisible: false });
  }

  /**
   * 服务导入
   */
  handleOk() {
    const { wsdl } = this.state;
    const {
      dispatch,
      services: { list },
    } = this.props;
    const { pagination } = list;
    if (wsdl) {
      dispatch({
        type: 'services/importService',
        payload: { importUrl: wsdl },
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchList(pagination);
          this.setState({ importModalVisible: false });
        }
      });
    } else {
      notification.warning({
        message: intl.get('hzero.common.validation.notNull', {
          name: intl.get('hitf.services.model.services.address').d('服务地址'),
        }),
      });
    }
  }

  /**
   * 修改导入服务的内容
   * @param {*} e
   */
  handleTextChange(e) {
    this.setState({ wsdl: e.target.value });
  }

  render() {
    const {
      services = {},
      importLoading,
      fetchingList,
      deletingService,
      fetchingInterface,
      fetchingInterfaceDetail,
      creating,
      editing,
      currentTenantId,
      tenantRoleLevel,
    } = this.props;
    const { list = {}, enumMap } = services;
    const { editorVisible, editingRow, currentProcessedRow } = this.state;
    const {
      serviceTypes, // 服务类型值集、发布类型？
      soapVersionTypes, // SOAP版本值集
      requestTypes, // 请求方式值集
      authTypes, // 认证方式值集
      grantTypes, // 授权模式值集
      wssPasswordTypes, // 加密方式
      interfaceStatus, // 接口状态
      contentTypes, // 接口类型
    } = enumMap;
    const searchProps = {
      tenantRoleLevel,
      serviceTypes,
      fetchList: this.fetchList,
      onRef: node => {
        this.filterForm = node.props.form;
      },
    };
    const listProps = {
      tenantRoleLevel,
      currentProcessedRow,
      onChange: this.fetchList,
      openEditor: this.openEditor.bind(this),
      dataSource: list.dataSource,
      pagination: list.pagination,
      processing: {
        query: fetchingList,
        delete: deletingService,
      },
      deleteRow: this.deleteRow.bind(this),
    };

    const editorProps = {
      currentTenantId,
      tenantRoleLevel,
      serviceTypes,
      wssPasswordTypes,
      authTypes,
      requestTypes,
      soapVersionTypes,
      interfaceStatus,
      contentTypes,
      grantTypes,
      deleteLines: this.handleDeleteLines.bind(this),
      visible: editorVisible,
      interfaceServerId: editingRow.interfaceServerId,
      onCancel: this.closeEditor.bind(this),
      processing: {
        fetchInterface: fetchingInterface,
        fetchInterfaceDetail: fetchingInterfaceDetail,
        create: creating,
        edit: editing,
      },
      realName: getCurrentUser() && getCurrentUser().realName,
      edit: this.edit.bind(this),
      create: this.create.bind(this),
      fetchInterfaceDetail: this.fetchInterfaceDetail.bind(this),
    };

    return (
      <div className={styles['hitf-services']}>
        <Header title={intl.get(`${viewMessagePrompt}.title.header`).d('服务注册')}>
          <Button type="primary" icon="plus" onClick={this.openEditor.bind(this)}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
          <Button icon="to-top" onClick={this.importService.bind(this)}>
            {intl.get(`hzero.common.button.import`).d('导入')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <Search {...searchProps} />
          </div>
          <List {...listProps} />
        </Content>
        <ServiceEditor {...editorProps} />
        <Modal
          title={intl.get(`${viewMessagePrompt}.detail`).d('详细信息')}
          visible={this.state.importModalVisible}
          onOk={this.handleOk.bind(this)}
          onCancel={this.handleCancel.bind(this)}
          okButtonProps={{ loading: importLoading }}
        >
          <TextArea
            placeHolder={intl
              .get(`${viewMessagePrompt}.importPlaceHolder`)
              .d('导入地址：支持导入WSDL或者Swagger服务地址描述地址')}
            value={this.state.wsdl}
            onChange={this.handleTextChange.bind(this)}
          />
        </Modal>
      </div>
    );
  }
}
