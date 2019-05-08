/**
 * OpenApp - 三方应用管理
 * @date: 2018-10-8
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Button, Form, Input, Table, Icon, Popconfirm } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';

import Drawer from './Drawer';

const FormItem = Form.Item;
@Form.create({ fieldNameProp: null })
/**
 * 三方应用管理
 * @extends {Component} - PureComponent
 * @reactProps {Object} openApp - 数据源
 * @reactProps {Object} loading - 数据加载状态
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@formatterCollections({ code: 'hiam.openApp' })
@connect(({ loading, openApp }) => ({
  openApp,
  init: loading.effects['openApp/fetchOpenAppList'],
  fetchDetailLoading: loading.effects['openApp/fetchOpenAppDetail'],
  deleteLoading: loading.effects['openApp/deleteOpenApp'],
  saveDetailLoading: loading.effects['openApp/updateOpenApp'],
  enableLoading: loading.effects['openApp/enabledOpenApp'],
  disableLoading: loading.effects['openApp/disabledOpenApp'],
}))
export default class OpenApp extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false, // 模态框可见度
      actionOpenAppId: '',
      fileList: [], // 文件上传列表
    };
  }

  componentDidMount() {
    this.fetchOpenAppList();
  }

  /**
   * 获取三方应用管理列表信息
   * @param {*} params
   */
  fetchOpenAppList(params = {}) {
    const {
      dispatch,
      form,
      openApp: { pagination = {} },
    } = this.props;
    dispatch({
      type: 'openApp/fetchOpenAppList',
      payload: { page: pagination, ...form.getFieldsValue(), ...params },
    });
  }

  /**
   * 打开模态框，详情数据恢复初始状态
   */
  @Bind()
  handleCreate() {
    const { dispatch } = this.props;
    dispatch({
      type: 'openApp/updateState',
      payload: { openAppDetail: {} },
    });
    this.handleModalVisible(true);
  }

  /**
   * @function handleModalVisible - 控制实例modal显示与隐藏
   * @param {boolean} flag 是否显示modal
   */
  handleModalVisible(flag) {
    this.setState({ modalVisible: !!flag, fileList: [] });
  }

  /**
   * @function handleModalSave - 保存
   * @param {object} data - 数据
   */
  @Bind()
  handleModalSave(data) {
    const {
      dispatch,
      openApp: { openAppDetail },
    } = this.props;
    const type = openAppDetail.openAppId ? 'openApp/updateOpenApp' : 'openApp/createOpenApp';
    dispatch({
      type,
      payload: { ...openAppDetail, ...data },
    }).then(res => {
      if (res) {
        notification.success();
        this.handleModalVisible(false);
        this.fetchOpenAppList();
      }
    });
  }

  /**
   * @function handleEnable - 启用或禁用
   * @param {boolean} flag - 启用标识
   * @param {object} record - 行数据
   */
  handleEnable(flag, record) {
    const { dispatch } = this.props;
    const { openAppId } = record;
    this.setState({ actionOpenAppId: openAppId });
    const type = flag ? 'openApp/enabledOpenApp' : 'openApp/disabledOpenApp';
    dispatch({ type, payload: record }).then(res => {
      if (res) {
        notification.success();
        this.fetchOpenAppList();
      }
    });
  }

  /**
   * @function deleteOpenApp - 更新
   * @param {string} record - 行数据
   */
  @Bind()
  handleUpdateOpenApp(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'openApp/fetchOpenAppDetail',
      payload: record,
    }).then(res => {
      this.setState({
        fileList: [
          {
            uid: '-1',
            name: res.appName,
            status: 'done',
            url: res.appImage,
          },
        ],
      });
    });
    this.handleModalVisible(true);
  }

  /**
   * @function deleteOpenApp - 删除
   * @param {string} record - 行数据
   */
  deleteOpenApp(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'openApp/deleteOpenApp',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchOpenAppList();
      }
    });
  }

  /**
   * @function handlePagination - 分页操作
   * @param {Object} pagination - 分页参数
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchOpenAppList({
      page: pagination,
    });
  }

  /**
   * @function handleSearch - 搜索表单
   */
  @Bind()
  handleSearch() {
    this.fetchOpenAppList({ page: {} });
  }

  /**
   * @function handleResetSearch - 重置查询表单
   */
  @Bind()
  handleResetSearch() {
    this.props.form.resetFields();
  }

  /**
   * @function renderForm - 渲染搜索表单
   */
  renderFilterForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Form layout="inline">
        <FormItem label={intl.get('hiam.openApp.model.openApp.appCode').d('应用编码')}>
          {getFieldDecorator('appCode', {})(<Input trim inputChinese={false} />)}
        </FormItem>
        <FormItem label={intl.get('hiam.openApp.model.openApp.appName').d('应用名称')}>
          {getFieldDecorator('appName', {})(<Input />)}
        </FormItem>
        <FormItem>
          <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
            {intl.get('hzero.common.button.search').d('查询')}
          </Button>
          <Button style={{ marginLeft: 8 }} onClick={this.handleResetSearch}>
            {intl.get('hzero.common.button.reset').d('重置')}
          </Button>
        </FormItem>
      </Form>
    );
  }

  /**
   * @function render - react render函数
   */
  render() {
    const {
      init,
      fetchDetailLoading,
      saveDetailLoading,
      deleteLoading,
      enableLoading,
      disableLoading,
      openApp: { openAppList = [], pagination = {}, openAppDetail = {} },
    } = this.props;
    const { modalVisible, actionOpenAppId, fileList } = this.state;
    const { openAppId } = openAppDetail;
    const drawerProps = {
      fetchDetailLoading,
      saveDetailLoading,
      modalVisible,
      openAppDetail,
      fileList,
      detailTitle: openAppId
        ? `${intl.get('hzero.common.button.edit').d('编辑')}${openAppDetail.appName}`
        : `${intl.get('hzero.common.button.create').d('新建')}`,
      onCancel: this.handleModalVisible.bind(this, false),
      onOk: this.handleModalSave,
    };
    const columns = [
      {
        title: intl.get('hiam.openApp.model.openApp.orderSeq').d('序号'),
        dataIndex: 'orderSeq',
        width: 80,
      },
      {
        title: intl.get('hiam.openApp.model.openApp.appleImage').d('应用图片'),
        dataIndex: 'appImage',
        width: 100,
        render: (text, record) => {
          return (
            <img
              alt={record.appName}
              src={text}
              width="24"
              height="24"
              style={{ borderRadius: '50%' }}
            />
          );
        },
      },
      {
        title: intl.get('hiam.openApp.model.openApp.appCode').d('应用编码'),
        dataIndex: 'appCode',
      },
      {
        title: intl.get('hiam.openApp.model.openApp.appName').d('应用名称'),
        dataIndex: 'appName',
      },
      {
        title: 'appId',
        dataIndex: 'appId',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        key: 'operator',
        width: 150,
        render: (text, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.handleUpdateOpenApp(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              {record.enabledFlag === 1 ? (
                <a onClick={() => this.handleEnable(false, record)}>
                  {disableLoading && record.nodeRuleId === actionOpenAppId ? (
                    <Icon type="loading" />
                  ) : (
                    intl.get('hzero.common.button.disable').d('禁用')
                  )}
                </a>
              ) : (
                <a onClick={() => this.handleEnable(true, record)}>
                  {enableLoading && record.nodeRuleId === actionOpenAppId ? (
                    <Icon type="loading" />
                  ) : (
                    intl.get('hzero.common.button.enable').d('启用')
                  )}
                </a>
              )}
              <Popconfirm
                arrowPointAtCenter={false}
                placement="left"
                overlayStyle={{ zIndex: 100 }}
                title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录')}
                onConfirm={() => {
                  this.deleteOpenApp(record);
                }}
              >
                {deleteLoading && record.nodeRuleId === actionOpenAppId ? (
                  <Icon type="loading" />
                ) : (
                  intl.get('hzero.common.button.delete').d('删除')
                )}
              </Popconfirm>
            </span>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('hiam.openApp.view.message.title').d('三方应用管理')}>
          <Button icon="plus" type="primary" onClick={this.handleCreate}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">{this.renderFilterForm()}</div>
          <Table
            bordered
            rowKey="openAppId"
            loading={init}
            dataSource={openAppList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            pagination={pagination}
            onChange={this.handlePagination}
          />
          <Drawer {...drawerProps} />
        </Content>
      </React.Fragment>
    );
  }
}
