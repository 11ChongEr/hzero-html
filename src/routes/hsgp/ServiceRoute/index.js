/**
 * serviceRoute - 服务路由
 * @date: 2018-12-06
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Table, Popconfirm, Button, Cascader, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';
import { tableScrollWidth } from 'utils/utils';

import FilterForm from './FilterForm';
import Drawer from './Drawer';

@formatterCollections({ code: ['hsgp.serviceRoute'] })
@connect(({ loading, serviceRoute }) => ({
  serviceRoute,
  fetchLoading: loading.effects['serviceRoute/fetchServiceRouteList'],
  fetchDetailLoading: loading.effects['serviceRoute/fetchServiceRouteDetail'],
  updateLoading: loading.effects['serviceRoute/updateServiceRoute'],
  createLoading: loading.effects['serviceRoute/createServiceRoute'],
  refreshLoading: loading.effects['serviceRoute/refreshServiceRoute'],
}))
export default class ServiceRoute extends React.PureComponent {
  state = {
    modalVisible: false,
    fieldsValue: {},
  };

  componentDidMount() {
    this.queryProductWithEnv();
  }

  queryProductWithEnv() {
    const { dispatch } = this.props;
    dispatch({
      type: 'serviceRoute/queryProductWithEnv',
    }).then(res => {
      if (res && res[0]) {
        this.fetchServiceRouteList();
      }
    });
  }

  fetchServiceRouteList(params = {}) {
    const {
      dispatch,
      serviceRoute: { defaultProductEnv = [] },
    } = this.props;
    const { fieldsValue } = this.state;
    const [productId, productEnvId] = defaultProductEnv;
    dispatch({
      type: 'serviceRoute/fetchServiceRouteList',
      payload: { productId, productEnvId, ...fieldsValue, ...params },
    });
  }

  @Bind()
  handleRefresh() {
    const that = this;
    const {
      dispatch,
      serviceRoute: { defaultProductEnv = [] },
    } = this.props;
    const [productId, productEnvId] = defaultProductEnv;
    Modal.confirm({
      title: `${intl.get('hsgp.common.view.message.confirm.refresh').d('确定要刷新')}?`,
      content: intl
        .get('hsgp.serviceRoute.view.message.refresh.description')
        .d('将动态刷新服务路由'),
      onOk() {
        dispatch({
          type: 'serviceRoute/refreshServiceRoute',
          payload: { productId, productEnvId },
        }).then(res => {
          if (res) {
            notification.success();
            that.fetchServiceRouteList();
          }
        });
      },
    });
  }

  /**
   * 查询表单
   * @param {object} form - 查询表单
   */
  @Bind()
  handleSearch(form) {
    const fieldsValue = form.getFieldsValue();
    this.setState({ fieldsValue });
    this.fetchServiceRouteList({ ...fieldsValue, page: {} });
  }

  /**
   * 重置查询表单
   * @param {object} form - 查询表单
   */
  @Bind()
  handleResetSearch(form) {
    this.setState({ fieldsValue: {} });
    form.resetFields();
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchServiceRouteList({ page: pagination });
  }

  @Bind()
  handleChangeProduct(value) {
    // 设置当前的产品
    const { dispatch } = this.props;
    dispatch({
      type: 'serviceRoute/updateState',
      payload: { defaultProduct: value },
    });
    this.fetchServiceRouteList({ productId: value });
  }

  /**
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    this.setState({ modalVisible: flag });
  }

  /**
   * 显示编辑模态框
   * @param {object} record - 编辑的行数据
   */
  @Bind()
  showModal(record = {}) {
    const {
      dispatch,
      serviceRoute: { yesOrNoList = [], defaultProductEnv: defaultValue = [] },
    } = this.props;
    if (record.serviceRouteId) {
      dispatch({
        type: 'serviceRoute/fetchServiceRouteDetail',
        payload: {
          productId: defaultValue[0],
          productEnvId: defaultValue[1],
          serviceRouteId: record.serviceRouteId,
        },
      });
    } else {
      dispatch({
        type: 'serviceRoute/updateState',
        payload: { serviceRouteDetail: {} },
      });
    }
    if (Array.isArray(yesOrNoList) && yesOrNoList.length === 0) {
      dispatch({
        type: 'serviceRoute/init',
      });
    }
    this.handleModalVisible(true);
  }

  /**
   * 关闭模态框
   */
  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  @Bind()
  handleChangeEnv(value) {
    const { dispatch } = this.props;
    // 设置当前所用的产品及其环境
    dispatch({
      type: 'serviceRoute/updateState',
      payload: { defaultProductEnv: value },
    });
    this.fetchServiceRouteList({ productId: value[0], productEnvId: value[1] });
  }

  @Bind()
  handleUpdateRoute(fieldsValue) {
    const {
      dispatch,
      serviceRoute: { defaultProductEnv: defaultValue = [], serviceRouteDetail = {} },
    } = this.props;
    dispatch({
      type: `serviceRoute/${
        serviceRouteDetail.serviceRouteId !== undefined
          ? 'updateServiceRoute'
          : 'createServiceRoute'
      }`,
      payload: {
        ...serviceRouteDetail,
        productId: defaultValue[0],
        productEnvId: defaultValue[1],
        ...fieldsValue,
      },
    }).then(res => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchServiceRouteList();
      }
    });
  }

  /**
   * 删除服务路由
   * @param {object} record - 删除的行数据
   */
  @Bind()
  handleDeleteServiceRoute(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'serviceRoute/deleteServiceRoute',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchServiceRouteList();
      }
    });
  }

  render() {
    const {
      fetchLoading = false,
      updateLoading = false,
      createLoading = false,
      fetchDetailLoading = false,
      refreshLoading = false,
      serviceRoute: {
        serviceRouteList = [],
        productWithEnvList = [],
        defaultProductEnv = [],
        serviceRouteDetail = {},
        pagination = {},
      },
    } = this.props;
    const { modalVisible } = this.state;
    const drawerProps = {
      title:
        serviceRouteDetail.serviceRouteId !== undefined
          ? intl.get('hsgp.serviceRoute.view.message.editor.edit').d('编辑服务路由')
          : intl.get('hsgp.serviceRoute.view.message.editor.create').d('新建服务路由'),
      modalVisible,
      initData: serviceRouteDetail,
      initLoading: fetchDetailLoading,
      loading: serviceRouteDetail.serviceRouteId !== undefined ? updateLoading : createLoading,
      onCancel: this.hideModal,
      onOk: this.handleUpdateRoute,
    };
    const columns = [
      {
        title: intl.get('hsgp.common.model.common.serviceCode').d('服务编码'),
        width: 200,
        dataIndex: 'serviceCode',
      },
      {
        title: intl.get('hsgp.common.model.common.serviceName').d('服务名称'),
        dataIndex: 'serviceName',
      },
      {
        title: intl.get('hsgp.serviceRoute.model.serviceRoute.name').d('路由标识'),
        dataIndex: 'name',
      },
      {
        title: intl.get('hsgp.serviceRoute.model.serviceRoute.path').d('服务路径'),
        dataIndex: 'path',
      },
      {
        title: intl.get('hsgp.serviceRoute.model.serviceRoute.url').d('物理路径'),
        dataIndex: 'url',
      },
      {
        title: intl.get('hsgp.serviceRoute.model.serviceRoute.stripPrefix').d('去掉前缀'),
        width: 100,
        dataIndex: 'stripPrefix',
        render: yesOrNoRender,
      },
      {
        title: intl.get('hsgp.serviceRoute.model.serviceRoute.retryable').d('支持路由重试'),
        width: 120,
        dataIndex: 'retryable',
        render: yesOrNoRender,
      },
      {
        title: intl
          .get('hsgp.serviceRoute.model.serviceRoute.customSensitiveHeaders')
          .d('自定义敏感头'),
        width: 120,
        dataIndex: 'customSensitiveHeaders',
        render: yesOrNoRender,
      },
      {
        title: intl.get('hsgp.serviceRoute.model.serviceRoute.helperService').d('敏感头部列表'),
        dataIndex: 'sensitiveHeaders',
      },
      {
        title: '自定义GatewayHelper',
        dataIndex: 'helperService',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 110,
        fixed: 'right',
        render: (text, record) => {
          return (
            <span className="action-link">
              <a onClick={() => this.showModal(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Popconfirm
                title={intl
                  .get('hsgp.nodeRule.view.message.confirm.remove')
                  .d('是否删除此条记录？')}
                onConfirm={() => this.handleDeleteServiceRoute(record)}
              >
                <a>{intl.get('hzero.common.button.delete').d('删除')}</a>
              </Popconfirm>
            </span>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        <Header title={intl.get('hsgp.serviceRoute.view.message.title').d('服务路由')}>
          <Button type="primary" icon="plus" style={{ marginLeft: 10 }} onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="sync" onClick={this.handleRefresh} loading={refreshLoading}>
            {intl.get('hsgp.serviceRoute.view.button.refresh').d('刷新路由')}
          </Button>
          <div>
            <span>
              {`${intl.get('hsgp.common.view.title.product').d('产品')}/${intl
                .get('hsgp.common.view.title.env')
                .d('环境')}：`}
              ：
            </span>
            <Cascader
              style={{ width: 200 }}
              disabled={refreshLoading}
              placeholder=""
              expandTrigger="hover"
              allowClear={false}
              value={defaultProductEnv}
              options={productWithEnvList}
              fieldNames={{ label: 'meaning', value: 'value', children: 'children' }}
              onChange={this.handleChangeEnv}
            />
          </div>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm search={this.handleSearch} reset={this.handleResetSearch} />
          </div>
          <Table
            bordered
            rowKey="serviceRouteId"
            loading={fetchLoading || refreshLoading}
            dataSource={serviceRouteList}
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
