/**
 * sendConfig - 发送配置
 * @date: 2018-9-7
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Button } from 'hzero-ui';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { isEmpty, isUndefined, map } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import cacheComponent from 'components/CacheComponent';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { filterNullValueObject, isTenantRoleLevel } from 'utils/utils';
import { valueMapMeaning } from 'utils/renderer';
import FilterForm from './FilterForm';
import ListTable from './ListTable';
import Drawer from './Drawer';

/**
 * 发送配置
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} approveAuth - 数据源
 * @reactProps {!Object} fetchTableListLoading - 列表数据加载是否完成
 * @reactProps {!Object} sendMessageLoading - 消息发送是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: ['hmsg.sendConfig', 'entity.tenant'] })
@Form.create({ fieldNameProp: null })
@connect(({ sendConfig, loading }) => ({
  sendConfig,
  tenantRoleLevel: isTenantRoleLevel(),
  fetchTableListLoading: loading.effects['sendConfig/queryTableList'],
  sendMessageLoading: loading.effects['sendConfig/sendMessage'],
}))
@cacheComponent({ cacheKey: '/hmsg/sendConfig' })
export default class List extends Component {
  form;

  /**
   * state初始化
   */
  state = {
    visible: false, // 发送模态框是否可见
    tableRecord: {}, // 表格中数据
    enableService: [], // 启用服务数组
  };

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    const {
      dispatch,
      sendConfig: { pagination = {} },
      location: { state: { _back } = {} },
    } = this.props;
    // 校验是否从详情页返回
    const page = isUndefined(_back) ? {} : pagination;
    this.handleSearch(page);
    dispatch({
      type: 'sendConfig/queryMessageType',
    });
  }

  /**
   * 查询
   * @param {object} fields - 查询参数
   */
  @Bind()
  handleSearch(fields = {}) {
    const { dispatch } = this.props;
    const fieldValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'sendConfig/queryTableList',
      payload: {
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    });
  }

  /**
   * 新增，跳转到明细页面
   */
  @Bind()
  handleAddApprove() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hmsg/send-config/create`,
      })
    );
  }

  /**
   * 数据列表，行删除
   * @param {obejct} record - 操作对象
   */
  @Bind()
  handleDeleteContent(record) {
    const {
      dispatch,
      sendConfig: { pagination },
    } = this.props;
    dispatch({
      type: 'sendConfig/deleteHeader',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.handleSearch(pagination);
      }
    });
  }

  /**
   * 数据列表，行编辑
   *@param {obejct} record - 操作对象
   */
  @Bind()
  handleEditContent(record) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hmsg/send-config/detail/${record.tempServerId}`,
      })
    );
  }

  /**
   * 打开发送模态框
   *
   * @memberof List
   */
  @Bind()
  handleOpenSendModal(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'sendConfig/fetchLangType',
      payload: { tenantId: record.tenantId, messageCode: record.messageCode },
    });
    let anotherServerList = [];
    const tempServerList = [];
    if (record.typeCode) {
      tempServerList.push({ typeMeaning: record.typeMeaning, typeCode: record.typeCode });
    }
    if (!isEmpty(record.serverList)) {
      anotherServerList = record.serverList.map(item => ({
        typeMeaning: item.typeMeaning,
        typeCode: item.typeCode,
      }));
    }
    this.setState({
      visible: true,
      tableRecord: { ...record },
      enableService: [...tempServerList, ...anotherServerList],
    });
  }

  /**
   * 关闭发送模态框
   *
   * @memberof List
   */
  @Bind()
  handleCloseSendModal() {
    const { dispatch } = this.props;
    dispatch({
      type: 'sendConfig/updateState',
      payload: { paramsName: [] },
    });
    this.setState({
      visible: false,
      tableRecord: {},
      enableService: [],
    });
  }

  /**
   * 发送保存
   *
   * @param {*} values
   * @memberof List
   */
  @Bind()
  handleSendOk(values) {
    const {
      dispatch,
      sendConfig: { messageType = [] },
    } = this.props;
    dispatch({
      type: 'sendConfig/sendMessage',
      payload: values,
    }).then(res => {
      if (res) {
        let newRes = [];
        newRes = map(res, (value, key) => {
          return { key, value };
        });
        newRes.map(item => {
          return notification.success({
            message: `${valueMapMeaning(messageType, item.key)}${
              item.value === 1
                ? intl.get('hmsg.sendConfig.view.message.success').d('成功')
                : intl.get('hmsg.sendConfig.view.message.failed').d('失败')
            }`,
          });
        });
      }
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
   * 改变语言，获取参数
   */
  @Bind()
  getParams(values) {
    const { dispatch } = this.props;
    dispatch({
      type: 'sendConfig/getParams',
      payload: values,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      fetchTableListLoading,
      sendMessageLoading,
      sendConfig: { list = [], scopeType = [], pagination, langType = [], paramsName = [] },
      tenantRoleLevel,
    } = this.props;
    const { visible, tableRecord, enableService } = this.state;
    const filterProps = {
      form,
      tenantRoleLevel,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    const listProps = {
      scopeType,
      pagination,
      tenantRoleLevel,
      loading: fetchTableListLoading,
      dataSource: list,
      onEdit: this.handleEditContent,
      onDelete: this.handleDeleteContent,
      onOpenSendModal: this.handleOpenSendModal,
      onChange: this.handleSearch,
    };
    const drawerProps = {
      visible,
      tableRecord,
      langType,
      enableService,
      paramsName,
      tenantRoleLevel,
      saving: sendMessageLoading,
      anchor: 'right',
      onCancel: this.handleCloseSendModal,
      onSendOk: this.handleSendOk,
      onGetParams: this.getParams,
    };
    return (
      <React.Fragment>
        <Header title={intl.get('hmsg.sendConfig.view.message.title').d('发送配置')}>
          <Button icon="plus" type="primary" onClick={this.handleAddApprove}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          <ListTable {...listProps} />
        </Content>
        <Drawer {...drawerProps} />
      </React.Fragment>
    );
  }
}
