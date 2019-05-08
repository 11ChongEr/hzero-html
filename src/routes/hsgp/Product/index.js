/**
 * Product - 产品汇总
 * @date: 2018-11-28
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Link, routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import { Table, Popconfirm, Button } from 'hzero-ui';

import { Header, Content } from 'components/Page';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { tableScrollWidth } from 'utils/utils';

import FilterForm from './FilterForm';
import Drawer from './Drawer';

@connect(({ loading, product }) => ({
  product,
  fetchAppLoading: loading.effects['product/fetchProductList'],
  fetchDetailLoading: loading.effects['product/fetchProductDetail'],
  createAppLoading: loading.effects['product/createProduct'],
  updateAppLoading: loading.effects['product/updateProduct'],
}))
export default class Product extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      fieldsValue: {},
    };
  }

  componentDidMount() {
    this.fetchProductList();
  }

  /**
   * 获取列表数据
   * @param {object} params - 请求参数
   */
  fetchProductList(params = {}) {
    const {
      dispatch,
      product: { pagination = {} },
    } = this.props;
    const { fieldsValue } = this.state;
    dispatch({
      type: 'product/fetchProductList',
      payload: { ...fieldsValue, page: pagination, ...params },
    });
  }

  /**
   * handlePagination - 分页设置
   * @param {object} pagination - 分页对象
   */
  @Bind()
  handlePagination(pagination) {
    this.fetchProductList({ page: pagination });
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
    const { dispatch } = this.props;
    if (record.productId !== undefined) {
      dispatch({
        type: 'product/fetchProductDetail',
        payload: { productId: record.productId },
      });
    }
    dispatch({
      type: 'product/updateState',
      payload: { productDetail: {} },
    });
    this.handleModalVisible(true, record);
  }

  /**
   * 关闭模态框
   */
  @Bind()
  hideModal() {
    this.handleModalVisible(false);
  }

  /**
   * 查询应用来源
   * @param {object} form - 查询表单
   */
  @Bind()
  handleSearch(form) {
    const fieldsValue = form.getFieldsValue();
    this.setState({ fieldsValue });
    this.fetchProductList(fieldsValue);
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
   * 删除产品
   * @param {object} record - 行数据
   */
  @Bind()
  handleDeleteProduct(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'product/deleteProduct',
      payload: record,
    }).then(res => {
      if (res) {
        notification.success();
        this.fetchProductList();
      }
    });
  }

  /**
   * 保存产品
   * @param {object} fieldsValue - 更新的数据
   */
  @Bind()
  handleSaveProduct(fieldsValue) {
    const {
      dispatch,
      product: { productDetail = {} },
    } = this.props;
    const params = productDetail.productId
      ? {
          ...productDetail,
          ...fieldsValue,
        }
      : { ...fieldsValue };
    dispatch({
      type: `product/${productDetail.productId !== undefined ? 'updateProduct' : 'createProduct'}`,
      payload: params,
    }).then(res => {
      if (res) {
        notification.success();
        this.hideModal();
        this.fetchProductList();
      }
    });
  }

  render() {
    const {
      dispatch,
      fetchAppLoading = false,
      createAppLoading = false,
      updateAppLoading = false,
      fetchDetailLoading = false,
      product: { productList = [], pagination = {}, productDetail = {} },
    } = this.props;
    const { modalVisible } = this.state;
    const columns = [
      {
        title: intl.get('hsgp.productCollect.model.productCollect.productCode').d('产品编码'),
        width: 150,
        dataIndex: 'productCode',
      },
      {
        title: intl.get('hsgp.productCollect.model.productCollect.productName').d('产品名称'),
        dataIndex: 'productName',
      },
      {
        title: intl.get('hsgp.productCollect.model.productCollect.description').d('产品描述'),
        dataIndex: 'description',
      },
      {
        title: intl.get('hzeron.common.button.action').d('操作'),
        width: 250,
        render: (val, record) => {
          return (
            <span className="action-link">
              <a
                onClick={() => {
                  // 跳转到指定产品下的环境
                  dispatch({
                    type: 'productEnv/updateState',
                    payload: { defaultProduct: record.productId },
                  });
                  dispatch(routerRedux.push(`/hsgp/product-env`));
                }}
              >
                {intl.get('hsgp.productEnv.view.message.title').d('环境管理')}
              </a>
              <Link to={`/hsgp/product-collect/version/${record.productId}/${record.productName}`}>
                {intl.get('hsgp.productCollect.view.message.title.version').d('版本管理')}
              </Link>
              <a onClick={() => this.showModal(record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
              <Popconfirm
                title={intl
                  .get('hsgp.nodeRule.view.message.confirm.remove')
                  .d('是否删除此条记录？')}
                onConfirm={() => this.handleDeleteProduct(record)}
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
        <Header title={intl.get('hsgp.productCollect.view.message.title').d('产品汇总')}>
          <Button icon="plus" type="primary" onClick={this.showModal}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm search={this.handleSearch} reset={this.handleResetSearch} />
          </div>
          <Table
            bordered
            rowKey="productId"
            loading={fetchAppLoading}
            dataSource={productList}
            columns={columns}
            scroll={{ x: tableScrollWidth(columns) }}
            onChange={this.handlePagination}
            pagination={pagination}
          />
          <Drawer
            title={
              productDetail.productId !== undefined
                ? intl.get('hsgp.productCollect.view.message.title.editor.edit').d('编辑产品')
                : intl.get('hsgp.productCollect.view.message.title.editor.create').d('新建产品')
            }
            initLoading={fetchDetailLoading}
            loading={productDetail.productId !== undefined ? updateAppLoading : createAppLoading}
            modalVisible={modalVisible}
            initData={productDetail}
            onCancel={this.hideModal}
            onOk={this.handleSaveProduct}
          />
        </Content>
      </React.Fragment>
    );
  }
}
