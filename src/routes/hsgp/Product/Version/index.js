import React from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Table, Popconfirm, Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { Content, Header } from 'components/Page';

import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';

import Drawer from './Drawer';

@connect(({ loading, productVersion }) => ({
  productVersion,
  fetchLoading: loading.effects['productVersion/fetchProductVersionList'],
  fetchDetailLoading: loading.effects['productVersion/fetchProductVersionDetail'],
  createLoading: loading.effects['productVersion/createProductVersion'],
  updateLoading: loading.effects['productVersion/updateProductVersion'],
}))
export default class Version extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      versionModalVisible: false,
    };
  }

  componentDidMount() {
    this.fetchProductVersionList();
  }

  fetchProductVersionList(params = {}) {
    const {
      dispatch,
      productVersion: { pagination = {} },
      match,
    } = this.props;
    const {
      params: { productId },
    } = match;
    dispatch({
      type: 'productVersion/fetchProductVersionList',
      payload: { page: pagination, productId, ...params },
    });
  }

  /**
   * 控制modal显示与隐藏
   * @param {boolean}} flag 是否显示modal
   */
  handleModalVisible(flag) {
    this.setState({ versionModalVisible: flag });
  }

  /**
   * 显示编辑模态框
   * @param {object} record - 编辑的行数据
   */
  @Bind()
  showModal(record = {}) {
    const { dispatch, match } = this.props;
    const {
      params: { productId },
    } = match;
    if (record.productVersionId) {
      dispatch({
        type: 'productVersion/fetchProductVersionDetail',
        payload: { productVersionId: record.productVersionId, productId },
      });
    } else {
      dispatch({
        type: 'productVersion/updateState',
        payload: { productVersionDetail: {} },
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

  /**
   * 删除版本
   * @param {object} record - 编辑的行数据
   */
  @Bind()
  handleDeleteVersion(record = {}) {
    const { dispatch, match } = this.props;
    const {
      params: { productId },
    } = match;
    dispatch({
      type: 'productVersion/deleteProductVersion',
      payload: { ...record, productId },
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchProductVersionList();
      }
    });
  }

  @Bind()
  handleUpdateVersion(fieldsValue) {
    const {
      dispatch,
      match,
      productVersion: { productVersionDetail = {} },
    } = this.props;
    const {
      params: { productId },
    } = match;
    const params = productVersionDetail.productVersionId
      ? {
          ...productVersionDetail,
          ...fieldsValue,
          productId,
        }
      : { ...fieldsValue, productId };
    dispatch({
      type: `productVersion/${
        productVersionDetail.productVersionId !== undefined
          ? 'updateProductVersion'
          : 'createProductVersion'
      }`,
      payload: params,
    }).then(res => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchProductVersionList();
      }
    });
  }

  render() {
    const {
      dispatch,
      fetchLoading = false,
      createLoading = false,
      updateLoading = false,
      fetchDetailLoading = false,
      productVersion: {
        productVersionList = [],
        productVersionDetail = {},
        releaseDateValidator = '',
        pagination = {},
      },
      match: {
        params: { productName },
      },
    } = this.props;
    const { versionModalVisible } = this.state;
    const drawerProps = {
      releaseDateValidator,
      title: productVersionDetail.productVersionId !== undefined ? '编辑版本' : '新建版本',
      modalVisible: versionModalVisible,
      initData: productVersionDetail,
      initLoading: fetchDetailLoading,
      loading: productVersionDetail.productVersionId !== undefined ? updateLoading : createLoading,
      onCancel: this.hideModal,
      onOk: this.handleUpdateVersion,
    };
    const columns = [
      {
        title: intl.get('hsgp.common.model.common.versionNumber').d('版本号'),
        width: 150,
        dataIndex: 'versionNumber',
      },
      {
        title: intl.get('hsgp.common.model.common.description').d('描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hsgp.common.model.common.releaseDate').d('发布时间'),
        width: 150,
        dataIndex: 'releaseDate',
        render: dateTimeRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 180,
        render: (text, record) => {
          return (
            <span className="action-link">
              <a
                onClick={() => {
                  // 跳转到指定产品/版本下的服务组合
                  dispatch({
                    type: 'productService/updateState',
                    payload: {
                      defaultProductVersion: [`${record.productId}`, `${record.productVersionId}`],
                    },
                  });
                  dispatch(routerRedux.push(`/hsgp/product-service/list`));
                }}
              >
                {intl.get('hsgp.productService.view.message.title').d('服务组合')}
              </a>
              <a onClick={() => this.showModal(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Popconfirm
                title={intl
                  .get('hsgp.nodeRule.view.message.confirm.remove')
                  .d('是否删除此条记录？')}
                onConfirm={() => this.handleDeleteVersion(record)}
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
        <Header
          title={`${productName}-${intl
            .get('hsgp.serviceCollect.view.message.title.version.title')
            .d('版本管理')}`}
          backPath="/hsgp/product-collect/list"
        >
          <Button type="primary" icon="plus" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <Table
            bordered
            rowKey="productVersionId"
            initLoading={fetchDetailLoading}
            loading={fetchLoading}
            dataSource={productVersionList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={this.handlePagination}
            pagination={pagination}
          />
          <Drawer {...drawerProps} />
        </Content>
      </React.Fragment>
    );
  }
}
